from fastapi import APIRouter, Header, Body, HTTPException
from typing import Any
import logging
from datetime import datetime
import json
import os

router = APIRouter(prefix="/sync", tags=["Sincronismo"])
logger = logging.getLogger(__name__)

# Diretório para armazenar temporariamente os dados sincronizados
SYNC_DATA_DIR = "sync_data"
if not os.path.exists(SYNC_DATA_DIR):
    os.makedirs(SYNC_DATA_DIR)

from pydantic import BaseModel

class SyncData(BaseModel):
    cnpj: str
    type: str
    content: Any
    timestamp: str

@router.post("")
async def receive_sync_data(
    data: SyncData,
    authorization: str = Header(None)
):
    """
    Recebe dados sincronizados do agente remoto (Vendas, Financeiro, etc.)
    """
    # Log básico
    logger.info(f"[SYNC] Recebendo dados do CNPJ: {data.cnpj} | Tipo: {data.type}")

    # Validação simples do Token (opcional, pode ser expandido)
    if not authorization or not authorization.startswith("Bearer "):
        # Por enquanto permitimos para teste, mas logamos o aviso
        logger.warning(f"[SYNC] Chamada sem token de autorização do CNPJ: {data.cnpj}")
    
    try:
        # Salva o conteúdo em um arquivo JSON por CNPJ/Tipo para consulta posterior
        filename = f"{data.cnpj}_{data.type.lower()}.json"
        filepath = os.path.join(SYNC_DATA_DIR, filename)
        
        data_to_save = {
            "cnpj": data.cnpj,
            "type": data.type,
            "content": data.content,
            "received_at": datetime.now().isoformat(),
            "agent_timestamp": data.timestamp
        }
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data_to_save, f, indent=4, ensure_ascii=False)

        logger.info(f"[SYNC] Dados de {data.type} processados com sucesso para o CNPJ {data.cnpj}")

        return {
            "success": True, 
            "message": f"Dados de {data.type} recebidos e processados com sucesso",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"[SYNC] Erro ao processar sincronismo: {e}")
        raise HTTPException(status_code=500, detail=str(e))
