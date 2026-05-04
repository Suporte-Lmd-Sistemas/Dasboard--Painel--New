import os
import time
import json
import logging
import requests
import fdb
import schedule
from datetime import datetime, date
from dotenv import load_dotenv

# Configuração de Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("agent.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Carrega variáveis de ambiente
load_dotenv()

# Configurações do Firebird
FB_HOST = os.getenv("FB_HOST", "127.0.0.1")
FB_PORT = int(os.getenv("FB_PORT", 3050))
FB_DATABASE = os.getenv("FB_DATABASE")
FB_USER = os.getenv("FB_USER", "SYSDBA")
FB_PASS = os.getenv("FB_PASS", "masterkey")
FB_CLIENT_PATH = os.getenv("FB_CLIENT_PATH")

# Configurações da API
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3000/api")
API_TOKEN = os.getenv("API_TOKEN")
COMPANY_CNPJ = os.getenv("COMPANY_CNPJ")
SYNC_INTERVAL = int(os.getenv("SYNC_INTERVAL_MINUTES", 5))

# Carrega a DLL do Firebird
if FB_CLIENT_PATH:
    try:
        fdb.load_api(FB_CLIENT_PATH)
        logger.info(f"DLL do Firebird carregada de: {FB_CLIENT_PATH}")
    except Exception as e:
        logger.error(f"Erro ao carregar DLL do Firebird: {e}")

def get_db_connection():
    return fdb.connect(
        host=FB_HOST,
        port=FB_PORT,
        database=FB_DATABASE,
        user=FB_USER,
        password=FB_PASS,
        charset='WIN1252'
    )

def fetch_vendas_data():
    """Busca dados de faturamento do mês atual"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        today = date.today()
        start_date = today.replace(day=1).strftime('%Y-%m-%d')
        end_date = today.strftime('%Y-%m-%d')
        
        sql = """
            SELECT 
                SUM(CAST(COALESCE(PEV_VALOR_TOTAL, 0) AS NUMERIC(18,2))) as TOTAL,
                COUNT(*) as PEDIDOS
            FROM TB_PEDIDO_VENDA
            WHERE PEV_DT_LANCAMENTO BETWEEN ? AND ?
              AND COALESCE(PEV_STATUS, '') <> 'CANCELADO'
        """
        
        cur.execute(sql, (start_date, end_date))
        result = cur.fetchone()
        conn.close()
        
        return {
            "faturamento_mes": float(result[0] or 0),
            "total_pedidos": int(result[1] or 0),
            "periodo": f"{start_date} ate {end_date}"
        }
    except Exception as e:
        logger.error(f"Erro ao buscar dados de vendas: {e}")
        return None

def fetch_financeiro_data():
    """Exemplo: Busca dados financeiros (Contas a Receber vencidas)"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        sql = """
            SELECT SUM(CAST(COALESCE(REC_VALOR_ABERTO, 0) AS NUMERIC(18,2)))
            FROM TB_CONTAS_RECEBER
            WHERE REC_DT_VENCIMENTO < CURRENT_DATE
              AND REC_STATUS = 'ABERTO'
        """
        
        cur.execute(sql)
        result = cur.fetchone()
        conn.close()
        
        return {
            "inadimplencia_total": float(result[0] or 0)
        }
    except Exception as e:
        logger.error(f"Erro ao buscar dados financeiros: {e}")
        return None

def send_to_dashboard(data_type, content):
    """Envia os dados capturados para a API Central"""
    if not COMPANY_CNPJ or not API_TOKEN:
        logger.error("CNPJ ou API_TOKEN não configurados no .env")
        return

    payload = {
        "cnpj": COMPANY_CNPJ,
        "type": data_type,
        "content": content,
        "timestamp": datetime.now().isoformat()
    }

    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }

    try:
        url = f"{API_BASE_URL}/sync"
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        
        if response.status_code == 200:
            logger.info(f"Dados do tipo {data_type} enviados com sucesso.")
        else:
            logger.warning(f"Erro ao enviar dados {data_type}: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Erro de conexão com a API: {e}")

def run_sync():
    logger.info("Iniciando ciclo de sincronização...")
    
    # 1. Sincronizar Vendas
    vendas = fetch_vendas_data()
    if vendas:
        send_to_dashboard("VENDAS", vendas)
    
    # 2. Sincronizar Financeiro
    financeiro = fetch_financeiro_data()
    if financeiro:
        send_to_dashboard("FINANCEIRO", financeiro)

    # 3. Verificar tarefas remotas (Pull)
    # TODO: Implementar busca de tarefas pendentes na API
    
    logger.info("Ciclo de sincronização finalizado.")

def start_agent():
    logger.info(f"Agente de Sincronismo iniciado para o CNPJ: {COMPANY_CNPJ}")
    logger.info(f"Intervalo de sincronização: {SYNC_INTERVAL} minutos")
    
    # Roda uma vez no início
    run_sync()
    
    # Agenda as próximas execuções
    schedule.every(SYNC_INTERVAL).minutes.do(run_sync)
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    try:
        start_agent()
    except KeyboardInterrupt:
        logger.info("Agente parado pelo usuário.")
    except Exception as e:
        logger.critical(f"Falha crítica no agente: {e}")
