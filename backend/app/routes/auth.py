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
            central_api_url = "http://127.0.0.1:3000/api/license/validate"
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
        try:
            user = autenticar_usuario_erp(db, login_value, senha_value)
        finally:
            db.close()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário ou senha inválidos"
            )

        access_token = create_access_token({
            "sub": str(user["id"]),
            "login": user["login"],
            "nome": user["nome"],
            "perfil": user["perfil"],
            "cnpj": cnpj_value,
        })

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user,
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