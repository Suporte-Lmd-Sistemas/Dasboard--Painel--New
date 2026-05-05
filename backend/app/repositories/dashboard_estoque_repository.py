from __future__ import annotations
from app.repositories.base_dashboard_repository import BaseDashboardRepository


class DashboardEstoqueRepository(BaseDashboardRepository):

    def get_resumo_produtos(self, empresa_id: int | None) -> dict:
        empresa_sql, empresa_params = self._empresa_filter("PRD_EMPRESA", empresa_id)

        sql = f"""
            SELECT
                COUNT(*) AS TOTAL,
                SUM(CASE WHEN COALESCE(PRD_STATUS, 'A') = 'A' THEN 1 ELSE 0 END) AS ATIVOS,
                SUM(CASE WHEN COALESCE(PRD_STATUS, 'A') <> 'A' THEN 1 ELSE 0 END) AS INATIVOS
            FROM TB_PRODUTO
            WHERE 1=1 {empresa_sql}
        """
        row = self._fetch_one(sql, empresa_params) or {}
        return {
            "total":   self._safe_int(row.get("TOTAL")),
            "ativos":  self._safe_int(row.get("ATIVOS")),
            "inativos": self._safe_int(row.get("INATIVOS")),
        }

    def get_valores_estoque(self, empresa_id: int | None) -> dict:
        empresa_sql, empresa_params = self._empresa_filter("E.PRDE_EMPRESA", empresa_id)

        sql = f"""
            SELECT
                COALESCE(SUM(
                    CAST(COALESCE(E.PRDE_ESTOQUE, 0) AS NUMERIC(18,4)) *
                    CAST(COALESCE(PRDP.PRDP_CUSTO_TOTAL, P.PRD_PRECO_CUSTO, 0) AS NUMERIC(18,4))
                ), 0) AS CUSTO_TOTAL,

                COALESCE(SUM(
                    CAST(COALESCE(E.PRDE_ESTOQUE, 0) AS NUMERIC(18,4)) *
                    CAST(COALESCE(PRDP.PRDP_PRECO_VENDA, P.PRD_PRECO_VENDA, 0) AS NUMERIC(18,4))
                ), 0) AS VENDA_TOTAL

            FROM TB_PRODUTO P
            INNER JOIN TB_PRODUTO_ESTOQUE E
                ON E.PRDE_PRODUTO = P.PRD_ID

            LEFT JOIN TB_PRODUTO_PRECO PRDP
                ON PRDP.PRDP_PRODUTO = P.PRD_ID
               AND PRDP.PRDP_EMPRESA = E.PRDE_EMPRESA

            WHERE COALESCE(P.PRD_STATUS, 'A') = 'A'
              {empresa_sql}
        """
        row = self._fetch_one(sql, empresa_params) or {}
        return {
            "custo": self._safe_float(row.get("CUSTO_TOTAL")),
            "venda": self._safe_float(row.get("VENDA_TOTAL")),
        }

    def get_alertas_estoque(self, empresa_id: int | None) -> dict:
        empresa_sql, empresa_params = self._empresa_filter("P.PRD_EMPRESA", empresa_id)

        sql = f"""
            SELECT
                COUNT(*) AS TOTAL_ALERTAS,
                SUM(CASE WHEN COALESCE(E.PRDE_ESTOQUE, 0) <= 0 THEN 1 ELSE 0 END) AS SEM_ESTOQUE,
                SUM(CASE
                    WHEN COALESCE(E.PRDE_ESTOQUE, 0) > 0
                     AND COALESCE(P.PRD_ESTOQUE_MINIMO, 0) > 0
                     AND COALESCE(E.PRDE_ESTOQUE, 0) < COALESCE(P.PRD_ESTOQUE_MINIMO, 0)
                    THEN 1 ELSE 0 END) AS ABAIXO_MINIMO
            FROM TB_PRODUTO P
            INNER JOIN TB_PRODUTO_ESTOQUE E
                ON E.PRDE_PRODUTO = P.PRD_ID

            WHERE COALESCE(P.PRD_STATUS, 'A') = 'A'
              AND (
                  COALESCE(E.PRDE_ESTOQUE, 0) <= 0
                  OR (
                      COALESCE(P.PRD_ESTOQUE_MINIMO, 0) > 0
                      AND COALESCE(E.PRDE_ESTOQUE, 0) < COALESCE(P.PRD_ESTOQUE_MINIMO, 0)
                  )
              )
              {empresa_sql}
        """
        row = self._fetch_one(sql, empresa_params) or {}
        return {
            "total":        self._safe_int(row.get("TOTAL_ALERTAS")),
            "semEstoque":   self._safe_int(row.get("SEM_ESTOQUE")),
            "abaixoMinimo": self._safe_int(row.get("ABAIXO_MINIMO")),
        }

    def get_compras_periodo(self, empresa_id: int | None) -> dict:
        """
        Compras = Notas Fiscais de ENTRADA dos últimos 30 dias
        TB_NOTA_FISCAL: NF_ENTRADA_SAIDA = 'E' indica entrada
        """
        empresa_sql, empresa_params = self._empresa_filter("P.PDC_EMPRESA", empresa_id)

        # Busca total de NFs de entrada
        sql_count = f"""
            SELECT COUNT(*) AS QTD
            FROM TB_PEDIDO_COMPRA P
            WHERE P.PDC_STATUS IN ('R', 'P')
              AND P.PDC_DT_LANCAMENTO >= DATEADD(-30 DAY TO CURRENT_DATE)
              {empresa_sql}
        """

        # Busca valor total das NFs de entrada via movimento de produto
        sql_valor = f"""
            SELECT
                COALESCE(SUM(
                    CAST(COALESCE(M.PRDM_QUANTIDADE, 0) AS NUMERIC(18,4)) *
                    CAST(COALESCE(M.PRDM_CUSTO_UN, 0) AS NUMERIC(18,4))
                ), 0) AS TOTAL
            FROM TB_PRODUTO_MOVIMENTO M
            WHERE M.PRDM_TIPO = 'ENT'
              AND M.PRDM_DT_LANCAMENTO >= DATEADD(-30 DAY TO CURRENT_DATE)
              {empresa_sql.replace('P.PDC_EMPRESA', 'M.PRDM_EMPRESA')}
        """

        try:
            row_count = self._fetch_one(sql_count, empresa_params) or {}
            quantidade = self._safe_int(row_count.get("QTD"))

            params_mov = {}
            emp_sql_mov = ""
            if empresa_id is not None:
                emp_sql_mov = " AND M.PRDM_EMPRESA = :empresa_id "
                params_mov = {"empresa_id": empresa_id}

            sql_valor2 = f"""
                SELECT
                    COALESCE(SUM(
                        CAST(COALESCE(M.PRDM_QUANTIDADE, 0) AS NUMERIC(18,4)) *
                        CAST(COALESCE(M.PRDM_CUSTO_UN, 0) AS NUMERIC(18,4))
                    ), 0) AS TOTAL
                FROM TB_PRODUTO_MOVIMENTO M
                WHERE M.PRDM_TIPO = 'ENT'
                  AND M.PRDM_DT_LANCAMENTO >= DATEADD(-30 DAY TO CURRENT_DATE)
                  {emp_sql_mov}
            """
            row_valor = self._fetch_one(sql_valor2, params_mov) or {}
            valor = self._safe_float(row_valor.get("TOTAL"))

            return {"quantidade": quantidade, "valor": valor}
        except Exception as e:
            return {"quantidade": 0, "valor": 0.0}

    def get_maior_rotatividade(self, empresa_id: int | None) -> list[dict]:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)

        sql = f"""
            SELECT
                COALESCE(NULLIF(TRIM(P.PRD_DESCRICAO), ''), 'Sem descricao') AS PRODUTO,
                SUM(CAST(COALESCE(PEVI.PEVI_QUANTIDADE, 0) AS NUMERIC(18,4))) AS QTD_VENDIDA,
                MAX(CAST(COALESCE(E.PRDE_ESTOQUE, 0) AS NUMERIC(18,2))) AS ESTOQUE_ATUAL
            FROM TB_PEDIDO_VENDA_ITEM PEVI
            INNER JOIN TB_PEDIDO_VENDA PV
                ON PV.PEV_ID = PEVI.PEVI_PEDIDO_VENDA
               AND PV.PEV_EMPRESA = PEVI.PEVI_EMPRESA
            INNER JOIN TB_PRODUTO P
                ON P.PRD_ID = PEVI.PEVI_PRODUTO
            LEFT JOIN TB_PRODUTO_ESTOQUE E
                ON E.PRDE_PRODUTO = P.PRD_ID
            WHERE PV.PEV_DT_LANCAMENTO >= DATEADD(-30 DAY TO CURRENT_DATE)
              AND PV.PEV_STATUS <> 'C'
              {empresa_sql}
              {empresa_sql.replace("PV.PEV_EMPRESA", "E.PRDE_EMPRESA")}
            GROUP BY 1
            ORDER BY 2 DESC
            ROWS 50
        """
        rows = self._fetch_all(sql, empresa_params)
        return [
            {
                "produto": row.get("PRODUTO") or "Sem descrição",
                "vendida": self._safe_float(row.get("QTD_VENDIDA")),
                "estoque": self._safe_float(row.get("ESTOQUE_ATUAL")),
            }
            for row in rows
        ]

    def get_estoque_critico(self, empresa_id: int | None) -> list[dict]:
        empresa_sql, empresa_params = self._empresa_filter("P.PRD_EMPRESA", empresa_id)

        sql = f"""
            SELECT
                COALESCE(NULLIF(TRIM(P.PRD_DESCRICAO), ''), 'Sem descricao') AS PRODUTO,
                CAST(COALESCE(E.PRDE_ESTOQUE, 0) AS NUMERIC(18,2)) AS ESTOQUE,
                CAST(COALESCE(P.PRD_ESTOQUE_MINIMO, 0) AS NUMERIC(18,2)) AS MINIMO
            FROM TB_PRODUTO P
            INNER JOIN TB_PRODUTO_ESTOQUE E
                ON E.PRDE_PRODUTO = P.PRD_ID
            WHERE P.PRD_STATUS = 'A'
              {empresa_sql}
              {empresa_sql.replace("P.PRD_EMPRESA", "E.PRDE_EMPRESA")}
              AND (
                  COALESCE(E.PRDE_ESTOQUE, 0) <= 0
                  OR (
                      COALESCE(P.PRD_ESTOQUE_MINIMO, 0) > 0
                      AND COALESCE(E.PRDE_ESTOQUE, 0) < COALESCE(P.PRD_ESTOQUE_MINIMO, 0)
                  )
              )
            ORDER BY E.PRDE_ESTOQUE ASC
            ROWS 50
        """
        rows = self._fetch_all(sql, empresa_params)
        return [
            {
                "produto": row.get("PRODUTO") or "Sem descrição",
                "estoque": self._safe_float(row.get("ESTOQUE")),
                "minimo":  self._safe_float(row.get("MINIMO")),
            }
            for row in rows
        ]
