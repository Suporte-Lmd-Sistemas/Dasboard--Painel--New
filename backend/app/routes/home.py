<<<<<<< HEAD
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.erp_connection import get_erp_db

router = APIRouter()


@router.get("/")
def home():
    return {
        "mensagem": "API do dashboard ERP está funcionando!"
    }


@router.get("/teste-banco")
def teste_banco(erp_db: Session = Depends(get_erp_db)):
    try:
        erp_db.execute(text("SELECT 1 FROM RDB$DATABASE"))
        return {"banco_erp": "conectado com sucesso"}
=======
from fastapi import APIRouter
from sqlalchemy import text
from app.database.connection import engine

router = APIRouter()

@router.get("/")
def home():
    return {
        "mensagem": "API do módulo RH está funcionando!"
    }

@router.get("/teste-banco")
def teste_banco():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            return {"banco": "conectado com sucesso"}
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
    except Exception as e:
        return {"erro": str(e)}