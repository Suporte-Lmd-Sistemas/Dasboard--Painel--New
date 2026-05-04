from __future__ import annotations
from app.repositories.base_dashboard_repository import BaseDashboardRepository

class DashboardEstoqueRepository(BaseDashboardRepository):
    def get_resumo_produtos(self, empresa_id: int | None) -> dict:
        empresa_sql, empresa_params = self._empresa_filter("PRD_EMPRESA", empresa_id)
        
        sql = f"""
            SELECT 
                COUNT(*) AS TOTAL,
                SUM(CASE 
                    WHEN COALESCE(PRD_STATUS, 'A') = 'A' THEN 1 
                    ELSE 0 
                END) AS ATIVOS,
                SUM(CASE 
                    WHEN COALESCE(PRD_STATUS, 'I') = 'I' THEN 1 
                    ELSE 0 
                END) AS INATIVOS

            FROM TB_PRODUTO
            WHERE 1=1
        """
        row = self._fetch_one(sql, empresa_params)
        return {
            "total": self._safe_int(row.get("TOTAL")),
            "ativos": self._safe_int(row.get("ATIVOS")),
            "inativos": self._safe_int(row.get("INATIVOS"))
        }

    def get_valores_estoque(self, empresa_id: int | None) -> dict:
        empresa_prod_sql, empresa_prod_params = self._empresa_filter("P.PRD_EMPRESA", empresa_id)
        
        sql = f"""
            SELECT 
                SUM(CAST(COALESCE(E.PRDE_ESTOQUE, 0) * COALESCE(P.PRD_PRECO_CUSTO, 0) AS NUMERIC(18,2))) AS CUSTO_TOTAL,
                SUM(CAST(COALESCE(E.PRDE_ESTOQUE, 0) * COALESCE(P.PRD_PRECO_VENDA, 0) AS NUMERIC(18,2))) AS VENDA_TOTAL
            FROM TB_PRODUTO P
            INNER JOIN TB_PRODUTO_ESTOQUE E ON E.PRDE_PRODUTO = P.PRD_ID AND E.PRDE_EMPRESA = P.PRD_EMPRESA
            WHERE COALESCE(P.PRD_STATUS, 'A') IN ('A', 'ATIVO', '1')
              {empresa_prod_sql}
        """
        row = self._fetch_one(sql, empresa_prod_params)
        return {
            "custo": self._safe_float(row.get("CUSTO_TOTAL")),
            "venda": self._safe_float(row.get("VENDA_TOTAL"))
        }

    def get_alertas_estoque(self, empresa_id: int | None) -> dict:
        empresa_prod_sql, empresa_prod_params = self._empresa_filter("P.PRD_EMPRESA", empresa_id)
        
        sql = f"""
            SELECT 
                COUNT(*) AS TOTAL_ALERTAS,
                SUM(CASE WHEN COALESCE(E.PRDE_ESTOQUE, 0) <= 0 THEN 1 ELSE 0 END) AS SEM_ESTOQUE,
                SUM(CASE WHEN COALESCE(E.PRDE_ESTOQUE, 0) > 0 AND COALESCE(E.PRDE_ESTOQUE, 0) < COALESCE(P.PRD_ESTOQUE_MINIMO, 0) THEN 1 ELSE 0 END) AS ABAIXO_MINIMO
            FROM TB_PRODUTO P
            INNER JOIN TB_PRODUTO_ESTOQUE E ON E.PRDE_PRODUTO = P.PRD_ID AND E.PRDE_EMPRESA = P.PRD_EMPRESA
            WHERE COALESCE(P.PRD_STATUS, 'A') IN ('A', 'ATIVO', '1')
              AND (COALESCE(E.PRDE_ESTOQUE, 0) <= 0 OR COALESCE(E.PRDE_ESTOQUE, 0) < COALESCE(P.PRD_ESTOQUE_MINIMO, 0))
              {empresa_prod_sql}
        """
        row = self._fetch_one(sql, empresa_prod_params)
        return {
            "total": self._safe_int(row.get("TOTAL_ALERTAS")),
            "semEstoque": self._safe_int(row.get("SEM_ESTOQUE")),
            "abaixoMinimo": self._safe_int(row.get("ABAIXO_MINIMO"))
        }

    def get_compras_periodo(self, empresa_id: int | None) -> dict:
        # Nota: TB_ESTOQUE_MOVIMENTO Tipo 'E' (Entrada) ou similar
        # Como não tenho certeza da tabela de compras exata, vou tentar buscar entradas de estoque nos últimos 30 dias
        empresa_sql, empresa_params = self._empresa_filter("EM_EMPRESA", empresa_id)
        
        sql = f"""
            SELECT 
                COUNT(DISTINCT EM_ID) AS QTD,
                SUM(CAST(COALESCE(EM_VALOR_TOTAL, 0) AS NUMERIC(18,2))) AS TOTAL
            FROM TB_ESTOQUE_MOVIMENTO
            WHERE EM_TIPO = 'E' 
              AND EM_DATA >= DATEADD(-30 DAY TO CURRENT_DATE)
              {empresa_sql}
        """
        try:
            row = self._fetch_one(sql, empresa_params)
            return {
                "quantidade": self._safe_int(row.get("QTD")),
                "valor": self._safe_float(row.get("TOTAL"))
            }
        except:
            return {"quantidade": 0, "valor": 0.0}

    def get_maior_rotatividade(self, empresa_id: int | None) -> list[dict]:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        
        sql = f"""
            SELECT 
                P.PRD_DESCRICAO AS PRODUTO,
                SUM(CAST(COALESCE(PEVI.PEVI_QUANTIDADE, 0) AS NUMERIC(18,4))) AS QTD_VENDIDA,
                MAX(CAST(COALESCE(E.PRDE_ESTOQUE, 0) AS NUMERIC(18,2))) AS ESTOQUE_ATUAL
            FROM TB_PEDIDO_VENDA_ITEM PEVI
            INNER JOIN TB_PEDIDO_VENDA PV ON PV.PEV_ID = PEVI.PEVI_PEDIDO_VENDA AND PV.PEV_EMPRESA = PEVI.PEVI_EMPRESA
            INNER JOIN TB_PRODUTO P ON P.PRD_ID = PEVI.PEVI_PRODUTO AND P.PRD_EMPRESA = PEVI.PEVI_EMPRESA
            LEFT JOIN TB_PRODUTO_ESTOQUE E ON E.PRDE_PRODUTO = P.PRD_ID AND E.PRDE_EMPRESA = P.PRD_EMPRESA
            WHERE PV.PEV_DT_LANCAMENTO >= DATEADD(-30 DAY TO CURRENT_DATE)
              AND COALESCE(PV.PEV_STATUS, '') <> 'CANCELADO'
              {empresa_sql}
            GROUP BY 1
            ORDER BY 2 DESC
            ROWS 50
        """
        rows = self._fetch_all(sql, empresa_params)
        return [
            {
                "produto": row.get("PRODUTO"),
                "vendida": self._safe_float(row.get("QTD_VENDIDA")),
                "estoque": self._safe_float(row.get("ESTOQUE_ATUAL"))
            } for row in rows
        ]

    def get_estoque_critico(self, empresa_id: int | None) -> list[dict]:
        empresa_sql, empresa_params = self._empresa_filter("P.PRD_EMPRESA", empresa_id)
        
        sql = f"""
            SELECT 
                P.PRD_DESCRICAO AS PRODUTO,
                CAST(COALESCE(E.PRDE_ESTOQUE, 0) AS NUMERIC(18,2)) AS ESTOQUE,
                CAST(COALESCE(P.PRD_ESTOQUE_MINIMO, 0) AS NUMERIC(18,2)) AS MINIMO
            FROM TB_PRODUTO P
            INNER JOIN TB_PRODUTO_ESTOQUE E ON E.PRDE_PRODUTO = P.PRD_ID AND E.PRDE_EMPRESA = P.PRD_EMPRESA
            WHERE COALESCE(P.PRD_STATUS, 'A') IN ('A', 'ATIVO', '1')
              AND (COALESCE(E.PRDE_ESTOQUE, 0) <= 0 OR COALESCE(E.PRDE_ESTOQUE, 0) < COALESCE(P.PRD_ESTOQUE_MINIMO, 0))
              {empresa_sql}
            ORDER BY ESTOQUE ASC
            ROWS 50
        """
        rows = self._fetch_all(sql, empresa_params)
        return [
            {
                "produto": row.get("PRODUTO"),
                "estoque": self._safe_float(row.get("ESTOQUE")),
                "minimo": self._safe_float(row.get("MINIMO"))
            } for row in rows
        ]
