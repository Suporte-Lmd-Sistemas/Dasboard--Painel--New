from __future__ import annotations
from typing import TYPE_CHECKING
from app.repositories.base_dashboard_repository import BaseDashboardRepository

if TYPE_CHECKING:
    from app.services.erp_query_service import DateRange

class DashboardVendasRepository(BaseDashboardRepository):
    def get_faturamento_total(self, date_range: DateRange, empresa_id: int | None) -> float:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        sql = f"""
            SELECT CAST(SUM(PV.PEV_VALOR_TOTAL) AS NUMERIC(18,2)) AS TOTAL
            FROM TB_PEDIDO_VENDA PV
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN :start_date AND :end_date
              AND COALESCE(PV.PEV_STATUS, '') <> 'CANCELADO'
              {empresa_sql}
        """
        params = {"start_date": date_range.start, "end_date": date_range.end, **empresa_params}
        row = self._fetch_one(sql, params)
        return self._safe_float(row.get("TOTAL")) if row else 0.0

    def get_total_pedidos(self, date_range: DateRange, empresa_id: int | None) -> int:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        sql = f"""
            SELECT COUNT(*) AS TOTAL
            FROM TB_PEDIDO_VENDA PV
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN :start_date AND :end_date
              AND COALESCE(PV.PEV_STATUS, '') <> 'CANCELADO'
              {empresa_sql}
        """
        params = {"start_date": date_range.start, "end_date": date_range.end, **empresa_params}
        row = self._fetch_one(sql, params)
        return self._safe_int(row.get("TOTAL")) if row else 0

    def get_total_itens(self, date_range: DateRange, empresa_id: int | None) -> float:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        sql = f"""
            SELECT SUM(I.PVI_QTDE) AS TOTAL
            FROM TB_PEDIDO_VENDA_ITEM I
            INNER JOIN TB_PEDIDO_VENDA PV ON PV.PEV_ID = I.PVI_PEDIDO
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN :start_date AND :end_date
              AND COALESCE(PV.PEV_STATUS, '') <> 'CANCELADO'
              {empresa_sql}
        """
        params = {"start_date": date_range.start, "end_date": date_range.end, **empresa_params}
        row = self._fetch_one(sql, params)
        return self._safe_float(row.get("TOTAL")) if row else 0.0

    def get_custo_total(self, date_range: DateRange, empresa_id: int | None) -> float:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        sql = f"""
            SELECT SUM(CAST(COALESCE(I.PVI_QTDE, 0) * COALESCE(I.PVI_CUSTO_MEDIO, 0) AS NUMERIC(18,2))) AS TOTAL
            FROM TB_PEDIDO_VENDA_ITEM I
            INNER JOIN TB_PEDIDO_VENDA PV ON PV.PEV_ID = I.PVI_PEDIDO
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN :start_date AND :end_date
              AND COALESCE(PV.PEV_STATUS, '') <> 'CANCELADO'
              {empresa_sql}
        """
        params = {"start_date": date_range.start, "end_date": date_range.end, **empresa_params}
        row = self._fetch_one(sql, params)
        return self._safe_float(row.get("TOTAL")) if row else 0.0

    def get_top_clientes(self, date_range: DateRange, empresa_id: int | None) -> list[dict]:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        sql = f"""
            SELECT FIRST 10
                COALESCE(NULLIF(TRIM(P.PES_FANTASIA_APELIDO), ''), P.PES_RSOCIAL_NOME) AS NOME,
                COUNT(PV.PEV_ID) AS PEDIDOS,
                CAST(SUM(PV.PEV_VALOR_TOTAL) AS NUMERIC(18,2)) AS VALOR
            FROM TB_PEDIDO_VENDA PV
            INNER JOIN TB_CLIENTE C ON C.CLI_PESSOA = PV.PEV_CLIENTE
            INNER JOIN TB_PESSOA P ON P.PES_ID = C.CLI_PESSOA
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN :start_date AND :end_date
              AND COALESCE(PV.PEV_STATUS, '') <> 'CANCELADO'
              {empresa_sql}
            GROUP BY 1
            ORDER BY 3 DESC
        """
        params = {"start_date": date_range.start, "end_date": date_range.end, **empresa_params}
        rows = self._fetch_all(sql, params)
        return [{"nome": r.get("NOME"), "pedidos": self._safe_int(r.get("PEDIDOS")), "valor": self._safe_float(r.get("VALOR"))} for r in rows]

    def get_top_produtos(self, date_range: DateRange, empresa_id: int | None) -> list[dict]:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        sql = f"""
            SELECT FIRST 10
                PR.PRD_DESCRICAO AS PRODUTO,
                SUM(I.PVI_QTDE) AS QUANTIDADE,
                CAST(SUM(I.PVI_VALOR_TOTAL) AS NUMERIC(18,2)) AS VALOR
            FROM TB_PEDIDO_VENDA_ITEM I
            INNER JOIN TB_PEDIDO_VENDA PV ON PV.PEV_ID = I.PVI_PEDIDO
            INNER JOIN TB_PRODUTO PR ON PR.PRD_ID = I.PVI_PRODUTO
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN :start_date AND :end_date
              AND COALESCE(PV.PEV_STATUS, '') <> 'CANCELADO'
              {empresa_sql}
            GROUP BY 1
            ORDER BY 3 DESC
        """
        params = {"start_date": date_range.start, "end_date": date_range.end, **empresa_params}
        rows = self._fetch_all(sql, params)
        return [{"produto": r.get("PRODUTO"), "quantidade": self._safe_float(r.get("QUANTIDADE")), "valor": self._safe_float(r.get("VALOR"))} for r in rows]

    def get_vendas_por_cidade(self, date_range: DateRange, empresa_id: int | None) -> list[dict]:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        sql = f"""
            SELECT FIRST 10
                CID.CID_NOME AS CIDADE,
                COUNT(PV.PEV_ID) AS QTD
            FROM TB_PEDIDO_VENDA PV
            INNER JOIN TB_CLIENTE C ON C.CLI_PESSOA = PV.PEV_CLIENTE
            INNER JOIN TB_PESSOA P ON P.PES_ID = C.CLI_PESSOA
            INNER JOIN TB_CIDADE CID ON CID.CID_ID = P.PES_CIDADE
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN :start_date AND :end_date
              AND COALESCE(PV.PEV_STATUS, '') <> 'CANCELADO'
              {empresa_sql}
            GROUP BY 1
            ORDER BY 2 DESC
        """
        params = {"start_date": date_range.start, "end_date": date_range.end, **empresa_params}
        rows = self._fetch_all(sql, params)
        return [{"cidade": r.get("CIDADE"), "quantidade": self._safe_int(r.get("QTD"))} for r in rows]

    def get_vendas_por_vendedor(self, date_range: DateRange, empresa_id: int | None) -> list[dict]:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        sql = f"""
            SELECT FIRST 10
                COALESCE(P.PES_RSOCIAL_NOME, 'NAO INFORMADO') AS VENDEDOR,
                COUNT(PV.PEV_ID) AS PEDIDOS,
                CAST(SUM(PV.PEV_VALOR_TOTAL) AS NUMERIC(18,2)) AS VALOR
            FROM TB_PEDIDO_VENDA PV
            LEFT JOIN TB_VENDEDOR V ON V.VEN_ID = PV.PEV_VENDEDOR
            LEFT JOIN TB_PESSOA P ON P.PES_ID = V.VEN_PESSOA
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN :start_date AND :end_date
              AND COALESCE(PV.PEV_STATUS, '') <> 'CANCELADO'
              {empresa_sql}
            GROUP BY 1
            ORDER BY 3 DESC
        """
        params = {"start_date": date_range.start, "end_date": date_range.end, **empresa_params}
        rows = self._fetch_all(sql, params)
        return [{"vendedor": r.get("VENDEDOR"), "pedidos": self._safe_int(r.get("PEDIDOS")), "valor": self._safe_float(r.get("VALOR"))} for r in rows]

    def get_vendas_por_grupo(self, date_range: DateRange, empresa_id: int | None) -> list[dict]:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        sql = f"""
            SELECT FIRST 10
                G.GRU_DESCRICAO AS GRUPO,
                CAST(SUM(I.PVI_VALOR_TOTAL) AS NUMERIC(18,2)) AS VALOR
            FROM TB_PEDIDO_VENDA_ITEM I
            INNER JOIN TB_PEDIDO_VENDA PV ON PV.PEV_ID = I.PVI_PEDIDO
            INNER JOIN TB_PRODUTO PR ON PR.PRD_ID = I.PVI_PRODUTO
            INNER JOIN TB_PRODUTO_GRUPO G ON G.GRU_ID = PR.PRD_GRUPO
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN :start_date AND :end_date
              AND COALESCE(PV.PEV_STATUS, '') <> 'CANCELADO'
              {empresa_sql}
            GROUP BY 1
            ORDER BY 2 DESC
        """
        params = {"start_date": date_range.start, "end_date": date_range.end, **empresa_params}
        rows = self._fetch_all(sql, params)
        return [{"label": r.get("GRUPO"), "valor": self._safe_float(r.get("VALOR"))} for r in rows]

    def get_vendas_por_marca(self, date_range: DateRange, empresa_id: int | None) -> list[dict]:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        sql = f"""
            SELECT FIRST 10
                M.MAR_DESCRICAO AS MARCA,
                CAST(SUM(I.PVI_VALOR_TOTAL) AS NUMERIC(18,2)) AS VALOR
            FROM TB_PEDIDO_VENDA_ITEM I
            INNER JOIN TB_PEDIDO_VENDA PV ON PV.PEV_ID = I.PVI_PEDIDO
            INNER JOIN TB_PRODUTO PR ON PR.PRD_ID = I.PVI_PRODUTO
            INNER JOIN TB_PRODUTO_MARCA M ON M.MAR_ID = PR.PRD_MARCA
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN :start_date AND :end_date
              AND COALESCE(PV.PEV_STATUS, '') <> 'CANCELADO'
              {empresa_sql}
            GROUP BY 1
            ORDER BY 2 DESC
        """
        params = {"start_date": date_range.start, "end_date": date_range.end, **empresa_params}
        rows = self._fetch_all(sql, params)
        return [{"label": r.get("MARCA"), "valor": self._safe_float(r.get("VALOR"))} for r in rows]

    def get_media_por_faixa_horaria(self, date_range: DateRange, empresa_id: int | None) -> list[dict]:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        sql = f"""
            SELECT
                EXTRACT(HOUR FROM PV.PEV_HR_LANCAMENTO) AS HORA,
                CAST(AVG(PV.PEV_VALOR_TOTAL) AS NUMERIC(18,2)) AS VALOR,
                COUNT(PV.PEV_ID) AS PEDIDOS
            FROM TB_PEDIDO_VENDA PV
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN :start_date AND :end_date
              AND COALESCE(PV.PEV_STATUS, '') <> 'CANCELADO'
              {empresa_sql}
            GROUP BY 1
            ORDER BY 1
        """
        params = {"start_date": date_range.start, "end_date": date_range.end, **empresa_params}
        rows = self._fetch_all(sql, params)
        return [{"faixa": f"{int(r.get('HORA')):02d}h", "valor": self._safe_float(r.get("VALOR")), "pedidos": self._safe_int(r.get("PEDIDOS"))} for r in rows]

    def get_media_por_dia_semana(self, date_range: DateRange, empresa_id: int | None) -> list[dict]:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        # 1=Dom, 7=Sab no Firebird
        sql = f"""
            SELECT
                EXTRACT(WEEKDAY FROM PV.PEV_DT_LANCAMENTO) + 1 AS DIA_NUM,
                CAST(AVG(PV.PEV_VALOR_TOTAL) AS NUMERIC(18,2)) AS VALOR,
                COUNT(PV.PEV_ID) AS PEDIDOS
            FROM TB_PEDIDO_VENDA PV
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN :start_date AND :end_date
              AND COALESCE(PV.PEV_STATUS, '') <> 'CANCELADO'
              {empresa_sql}
            GROUP BY 1
            ORDER BY 1
        """
        params = {"start_date": date_range.start, "end_date": date_range.end, **empresa_params}
        rows = self._fetch_all(sql, params)
        labels = {1: "Dom", 2: "Seg", 3: "Ter", 4: "Qua", 5: "Qui", 6: "Sex", 7: "Sab"}
        return [{"dia": labels.get(self._safe_int(r.get("DIA_NUM")), str(r.get("DIA_NUM"))), "valor": self._safe_float(r.get("VALOR")), "pedidos": self._safe_int(r.get("PEDIDOS"))} for r in rows]

    def get_historico_vendas(self, empresa_id: int | None) -> list[dict]:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        sql = f"""
            SELECT
                EXTRACT(YEAR FROM PV.PEV_DT_LANCAMENTO) AS ANO,
                EXTRACT(MONTH FROM PV.PEV_DT_LANCAMENTO) AS MES_NUM,
                CAST(SUM(PV.PEV_VALOR_TOTAL) AS NUMERIC(18,2)) AS VALOR,
                COUNT(PV.PEV_ID) AS PEDIDOS
            FROM TB_PEDIDO_VENDA PV
            WHERE PV.PEV_DT_LANCAMENTO >= DATEADD(-2 YEAR TO CURRENT_DATE)
              AND COALESCE(PV.PEV_STATUS, '') <> 'CANCELADO'
              {empresa_sql}
            GROUP BY 1, 2
            ORDER BY 1 DESC, 2 ASC
        """
        rows = self._fetch_all(sql, empresa_params)
        labels = {1: "Jan", 2: "Fev", 3: "Mar", 4: "Abr", 5: "Mai", 6: "Jun", 7: "Jul", 8: "Ago", 9: "Set", 10: "Out", 11: "Nov", 12: "Dez"}
        return [{"ano": int(r.get("ANO")), "label": labels.get(int(r.get("MES_NUM")), str(r.get("MES_NUM"))), "valor": self._safe_float(r.get("VALOR")), "pedidos": self._safe_int(r.get("PEDIDOS"))} for r in rows]

    def get_detalhes_pedidos(self, date_range: DateRange, empresa_id: int | None, page: int = 1, page_size: int = 10, status: str | None = None) -> dict:
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        
        status_sql = ""
        status_params = {}
        if status and status != "TODOS":
            status_sql = " AND PV.PEV_STATUS = :status "
            status_params = {"status": status}

        offset = (page - 1) * page_size
        
        count_sql = f"""
            SELECT COUNT(*) AS TOTAL 
            FROM TB_PEDIDO_VENDA PV 
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN :start_date AND :end_date 
              {status_sql}
              {empresa_sql}
        """
        
        sql = f"""
            SELECT
                PV.PEV_ID AS ID,
                PV.PEV_DT_LANCAMENTO AS DATA,
                COALESCE(NULLIF(TRIM(P.PES_FANTASIA_APELIDO), ''), P.PES_RSOCIAL_NOME) AS CLIENTE,
                CAST(COALESCE(PV.PEV_VALOR_TOTAL, 0) AS NUMERIC(18,2)) AS VALOR,
                COALESCE(PV.PEV_STATUS, 'ABERTO') AS STATUS
            FROM TB_PEDIDO_VENDA PV
            INNER JOIN TB_CLIENTE C ON C.CLI_PESSOA = PV.PEV_CLIENTE
            INNER JOIN TB_PESSOA P ON P.PES_ID = C.CLI_PESSOA
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN :start_date AND :end_date
              {status_sql}
              {empresa_sql}
            ORDER BY PV.PEV_DT_LANCAMENTO DESC
            ROWS {offset + 1} TO {offset + page_size}
        """
        
        params = {
            "start_date": date_range.start, 
            "end_date": date_range.end, 
            **empresa_params,
            **status_params
        }
        
        total_row = self._fetch_one(count_sql, params)
        total = self._safe_int(total_row.get("TOTAL")) if total_row else 0
        
        rows = self._fetch_all(sql, params)
        data = [{"id": r.get("ID"), "data": self._iso_date(r.get("DATA")), "cliente": r.get("CLIENTE"), "valor": self._safe_float(r.get("VALOR")), "status": r.get("STATUS")} for r in rows]
        return {"total": total, "data": data}

    def get_detalhes_novos_clientes(self, date_range: DateRange, empresa_id: int | None, page: int = 1, page_size: int = 10) -> dict:
        empresa_sql, empresa_params = self._empresa_filter("C.CLI_EMPRESA", empresa_id)
        offset = (page - 1) * page_size
        count_sql = f"SELECT COUNT(*) AS TOTAL FROM TB_CLIENTE C INNER JOIN TB_PESSOA P ON P.PES_ID = C.CLI_PESSOA WHERE P.PES_DT_CADASTRO BETWEEN :start_date AND :end_date {empresa_sql}"
        sql = f"""
            SELECT
                P.PES_ID AS ID,
                P.PES_RSOCIAL_NOME AS NOME,
                P.PES_FANTASIA_APELIDO AS FANTASIA,
                P.PES_DT_CADASTRO AS DATA_CADASTRO
            FROM TB_CLIENTE C
            INNER JOIN TB_PESSOA P ON P.PES_ID = C.CLI_PESSOA
            WHERE P.PES_DT_CADASTRO BETWEEN :start_date AND :end_date
              {empresa_sql}
            ORDER BY P.PES_DT_CADASTRO DESC
            ROWS {offset + 1} TO {offset + page_size}
        """
        params = {"start_date": date_range.start, "end_date": date_range.end, **empresa_params}
        total = self._safe_int(self._fetch_one(count_sql, params).get("TOTAL"))
        rows = self._fetch_all(sql, params)
        data = [{"id": r.get("ID"), "nome": r.get("NOME"), "fantasia": r.get("FANTASIA"), "data_cadastro": self._iso_date(r.get("DATA_CADASTRO"))} for r in rows]
        return {"total": total, "data": data}