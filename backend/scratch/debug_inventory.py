
from app.database.erp_connection import current_cnpj
from app.services.erp_query_service import ERPQueryService

def debug_inventory():
    service = ERPQueryService()
    cnpj = "58253989000125" # CNPJ que estamos usando para testes
    current_cnpj.set(cnpj)
    
    # 1. Verificar se existem produtos com status 'A'
    sql1 = "SELECT PRD_STATUS, COUNT(*) FROM TB_PRODUTO GROUP BY 1"
    
    # 2. Verificar se existe estoque para a empresa (supondo empresa_id=1 para teste)
    empresa_id = 1 
    sql2 = f"SELECT COUNT(*) FROM TB_PRODUTO_ESTOQUE WHERE PRDE_EMPRESA = {empresa_id}"
    
    # 3. Rodar a query completa em partes para ver onde zera
    sql3 = f"""
        SELECT 
            COUNT(P.PRD_ID) as QTD_PRODUTOS,
            SUM(CAST(COALESCE(E.PRDE_ESTOQUE, 0) AS NUMERIC(18,2))) as TOTAL_ESTOQUE
        FROM TB_PRODUTO P
        INNER JOIN TB_PRODUTO_ESTOQUE E ON E.PRDE_PRODUTO = P.PRD_ID
        WHERE E.PRDE_EMPRESA = {empresa_id}
    """
    
    try:
        print("--- Status dos Produtos ---")
        for r in service.fetch_all(sql1, {}):
            print(f"Status: {r['PRD_STATUS']}, Total: {r['COUNT']}")
            
        print("\n--- Estoque na Empresa ---")
        res2 = service.fetch_all(sql2, {})
        print(f"Itens com estoque na empresa {empresa_id}: {res2[0]['COUNT']}")
        
        print("\n--- Join Produto + Estoque ---")
        res3 = service.fetch_all(sql3, {})
        print(f"Produtos Vinculados: {res3[0]['QTD_PRODUTOS']}, Soma Estoque: {res3[0]['TOTAL_ESTOQUE']}")
        
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    debug_inventory()
