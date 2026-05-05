import os
import json
import re
from sqlalchemy import text
from sqlalchemy.orm import Session


def limpar(valor):
    if valor is None:
        return ""
    return str(valor).strip()

def limpar_cnpj(cnpj):
    return re.sub(r"\D", "", str(cnpj))

def get_registered_cnpjs():
    config_path = "companies.json"
    if not os.path.exists(config_path):
        config_path = os.path.join(os.path.dirname(__file__), "..", "..", "companies.json")
    
    if not os.path.exists(config_path):
        return []
    
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            companies = json.load(f)
            return [limpar_cnpj(c.get("cnpj")) for c in companies if c.get("cnpj")]
    except Exception:
        return []

def listar_empresas_erp(db: Session):
    registered_cnpjs = get_registered_cnpjs()

    sql = text("""
        SELECT
            e.EMP_ID,
            e.EMP_FANTASIA,
            e.EMP_RAZAO_SOCIAL,
            e.EMP_CNPJ,
            e.EMP_CIDADE,
            e.EMP_STATUS
        FROM TB_EMPRESA e
        ORDER BY e.EMP_ID
    """)

    rows = db.execute(sql).mappings().all()

    empresas = []

    for row in rows:
        empresa_id = row.get("emp_id") or row.get("EMP_ID")
        fantasia = row.get("emp_fantasia") or row.get("EMP_FANTASIA")
        razao = row.get("emp_razao_social") or row.get("EMP_RAZAO_SOCIAL")
        cnpj_raw = row.get("emp_cnpj") or row.get("EMP_CNPJ")
        cidade = row.get("emp_cidade") or row.get("EMP_CIDADE")
        status = row.get("emp_status") or row.get("EMP_STATUS")

        cnpj_clean = limpar_cnpj(cnpj_raw)
        
        # Se houver CNPJs cadastrados no painel, filtramos. 
        # Se não houver nada no companies.json, mostramos tudo (fallback) ou nada?
        # O usuário pediu: "trazer APENAS as empresas com cnpj cadastrado"
        if registered_cnpjs and cnpj_clean not in registered_cnpjs:
            continue

        empresa = {
            "id": empresa_id,
            "fantasia": limpar(fantasia),
            "razao_social": limpar(razao),
            "cnpj": limpar(cnpj_raw),
            "cidade": limpar(cidade),
            "status": limpar(status),
        }

        empresa["nome_exibicao"] = (
            empresa["fantasia"]
            or empresa["razao_social"]
            or f"Empresa {empresa_id}"
        )

        empresas.append(empresa)

    return empresas