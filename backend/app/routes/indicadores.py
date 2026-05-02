from fastapi import APIRouter, Depends
<<<<<<< HEAD
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.erp_connection import get_erp_db

router = APIRouter(prefix="/indicadores", tags=["Indicadores"])


@router.get("/resumo")
def resumo_funcionarios(
    erp_db: Session = Depends(get_erp_db)
):
    query = text(
        """
        SELECT
            c.COL_PESSOA,
            c.COL_STATUS,
            c.COL_SALARIO_VALOR,
            c.COL_DATA_AFASTAMENTO
        FROM TB_COLABORADOR c
        """
    )

    colaboradores = erp_db.execute(query).fetchall()

    total_funcionarios = len(colaboradores)
=======
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.session import get_db
from app.database.erp_connection import get_erp_db
from app.models.funcionario import Funcionario
from app.models.departamento import Departamento

router = APIRouter(prefix="/indicadores", tags=["Indicadores RH"])


@router.get("/resumo")
def resumo_rh(
    db: Session = Depends(get_db),
    erp_db: Session = Depends(get_erp_db)
):
    funcionarios = db.query(Funcionario).all()

    total_funcionarios = len(funcionarios)
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
    total_ativos = 0
    total_afastados = 0
    salarios = []

<<<<<<< HEAD
    for colaborador in colaboradores:
        status = colaborador[1]
        salario = colaborador[2]
        data_afastamento = colaborador[3]

        if status is not None:
            status_str = str(status).strip().upper()
            if status_str in ["A", "ATIVO", "1", "S"]:
                total_ativos += 1

        if data_afastamento is not None:
            total_afastados += 1

        if salario is not None:
            try:
                salarios.append(float(salario))
            except (TypeError, ValueError):
                pass
=======
    for funcionario in funcionarios:
        query = text("""
            SELECT
                c.COL_STATUS,
                c.COL_SALARIO_VALOR,
                c.COL_DATA_AFASTAMENTO
            FROM TB_COLABORADOR c
            WHERE c.COL_PESSOA = :col_pessoa
        """)

        colaborador = erp_db.execute(
            query,
            {"col_pessoa": funcionario.col_pessoa}
        ).fetchone()

        if colaborador:
            status = colaborador[0]
            salario = colaborador[1]
            data_afastamento = colaborador[2]

            if status is not None:
                status_str = str(status).strip().upper()
                if status_str in ["A", "ATIVO", "1", "S"]:
                    total_ativos += 1

            if data_afastamento is not None:
                total_afastados += 1

            if salario is not None:
                salarios.append(float(salario))
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f

    media_salarial = round(sum(salarios) / len(salarios), 2) if salarios else 0

    return {
<<<<<<< HEAD
        "total_funcionarios": total_funcionarios,
        "total_ativos": total_ativos,
        "total_afastados": total_afastados,
        "media_salarial": media_salarial,
    }


@router.get("/por-status")
def funcionarios_por_status(
    erp_db: Session = Depends(get_erp_db)
):
    query = text(
        """
        SELECT
            c.COL_STATUS,
            COUNT(*) AS total
        FROM TB_COLABORADOR c
        GROUP BY c.COL_STATUS
        ORDER BY total DESC
        """
    )

    rows = erp_db.execute(query).fetchall()

    resultado = []

    for row in rows:
        resultado.append(
            {
                "status": str(row[0]).strip() if row[0] is not None else "Não informado",
                "total_funcionarios": int(row[1] or 0),
            }
        )
=======
        "total_funcionarios_rh": total_funcionarios,
        "total_ativos": total_ativos,
        "total_afastados": total_afastados,
        "media_salarial": media_salarial
    }


@router.get("/por-departamento")
def funcionarios_por_departamento(
    db: Session = Depends(get_db)
):
    departamentos = db.query(Departamento).all()
    resultado = []

    for departamento in departamentos:
        total = db.query(Funcionario).filter(
            Funcionario.departamento_id == departamento.id
        ).count()

        resultado.append({
            "departamento_id": departamento.id,
            "departamento_nome": departamento.nome,
            "total_funcionarios": total
        })
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f

    return resultado