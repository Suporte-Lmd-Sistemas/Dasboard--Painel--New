
from app.database.erp_connection import current_cnpj
from app.services.erp_query_service import ERPQueryService

def check_columns():
    service = ERPQueryService()
    current_cnpj.set("58253989000125")
    
    # Verificar se a tabela TB_PRODUTO_PRECO existe e quais são as colunas
    sql = "SELECT FIRST 1 * FROM TB_PRODUTO_PRECO"
    
    try:
        res = service.fetch_all(sql, {})
        if res:
            print("Colunas encontradas em TB_PRODUTO_PRECO:")
            print(res[0].keys())
        else:
            print("A tabela TB_PRODUTO_PRECO está vazia.")
    except Exception as e:
        print(f"Erro ao ler TB_PRODUTO_PRECO: {e}")

if __name__ == "__main__":
    check_columns()
