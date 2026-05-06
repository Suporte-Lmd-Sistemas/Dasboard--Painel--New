from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, decode_access_token
from app.database.erp_connection import get_erp_db
from app.services.auth_service import autenticar_usuario_erp

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login")
def login(payload: dict):
    try:
        import re
        from app.database.erp_connection import get_session_for_cnpj
        
        cnpj_value = re.sub(r"\D", "", str(payload.get("cnpj", "")))
        login_value = str(payload.get("login", "")).strip()
        senha_value = str(payload.get("senha", "")).strip()

        if not cnpj_value or not login_value or not senha_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CNPJ, Login e senha são obrigatórios"
            )

        # -------------------------------------------------------------
        # Validação de Licença via API Central (Next.js)
        # -------------------------------------------------------------
        import requests
        try:
            central_api_url = "http://127.0.0.1:3001/api/license/validate"
            response = requests.post(central_api_url, json={"cnpj": cnpj_value}, timeout=5)
            license_data = response.json()
            
            if not license_data.get("valid"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=license_data.get("error", "Licença inválida ou expirada.")
                )
        except requests.exceptions.RequestException as e:
            print(f"Erro ao contatar API Central: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Não foi possível validar a licença no momento. Tente novamente."
            )
        # -------------------------------------------------------------

        # Obter sessão específica para esta empresa
        db = get_session_for_cnpj(cnpj_value)
        if db is None:
            # Empresa REMOTA - Tentar buscar os dados de usuários sincronizados pelo agente
            import os
            import json
            
            sync_file = os.path.join("sync_data", f"{cnpj_value}_usuarios.json")
            user = None
            
            if os.path.exists(sync_file):
                try:
                    with open(sync_file, "r", encoding="utf-8") as f:
                        file_data = json.load(f)
                        usuarios_sync = file_data.get("content", [])
                        
                        # Buscar o usuário na lista sincronizada
                        for u in usuarios_sync:
                            if u.get("usu_login", "").upper() == login_value.upper():
                                # Usuário encontrado, validar senha e admin
                                if u.get("usu_administrador", "").upper() != "S":
                                    raise HTTPException(
                                        status_code=status.HTTP_401_UNAUTHORIZED,
                                        detail="Usuário sem permissão de administrador."
                                    )
                                
                                if u.get("usu_senha", "").upper() != senha_value.upper():
                                    break # Senha errada
                                
                                # Login autorizado
                                user = {
                                    "id": 0,
                                    "login": u.get("usu_login"),
                                    "nome": u.get("usu_nome"),
                                    "perfil": "Administrador ERP (Remoto)"
                                }
                                break
                except Exception as e:
                    print(f"[AUTH] Erro ao ler arquivo de usuarios sync: {e}")
            
            if user is None:
                # Fallback de segurança caso o agente ainda não tenha rodado a versão nova
                if login_value.lower() == "admin" and senha_value == "admin":
                    user = {
                        "id": 0,
                        "login": "admin",
                        "nome": "Admin (Fallback/Teste)",
                        "perfil": "Administrador ERP"
                    }
                else:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Usuário ou senha inválidos. (Nota: O Agente ainda não sincronizou os usuários reais)."
                    )
        else:
            try:
                user = autenticar_usuario_erp(db, login_value, senha_value)
            finally:
                db.close()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário ou senha inválidos"
            )

        # Buscar nome da empresa no companies.json para o token
        empresa_nome = "Dashboard"
        try:
            import json
            import os
            if os.path.exists("companies.json"):
                with open("companies.json", "r", encoding="utf-8") as f:
                    comps = json.load(f)
                    cnpj_alvo = re.sub(r"\D", "", cnpj_value)
                    for c in comps:
                        if re.sub(r"\D", "", c.get("cnpj", "")) == cnpj_alvo:
                            empresa_nome = c.get("razao_social", "Dashboard")
                            break
        except Exception as e:
            print(f"[DEBUG LOGIN] Erro ao buscar empresa: {e}")
            pass

        print(f"[DEBUG LOGIN] Usuário {user['login']} logado na base: {empresa_nome}")

        access_token = create_access_token({
            "sub": str(user["id"]),
            "login": user["login"],
            "nome": user["nome"],
            "perfil": user["perfil"],
            "cnpj": cnpj_value,
            "empresa": empresa_nome
        })

        user_with_company = {**user, "empresa": empresa_nome}

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_with_company,
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Erro no login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro no servidor: {str(e)}"
        )


@router.get("/me")
def me(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token não informado"
        )

    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)

    return {
        "id": int(payload["sub"]),
        "login": payload["login"],
        "nome": payload["nome"],
        "perfil": payload["perfil"],
        "cnpj": payload.get("cnpj", ""),
        "empresa": payload.get("empresa", "Dashboard")
    }


def get_current_user(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token não informado"
        )

    token = authorization.replace("Bearer ", "").strip()
    try:
        payload = decode_access_token(token)
        return payload
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão inválida ou expirada"
        )