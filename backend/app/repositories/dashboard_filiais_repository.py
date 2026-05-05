from __future__ import annotations

from typing import Any

from app.services.base_dashboard_service import DateRange
from app.repositories.base_dashboard_repository import BaseDashboardRepository


class DashboardFiliaisRepository(BaseDashboardRepository):
    def get_resumo_filiais(self, date_range: DateRange, empresa_id: int | None = None) -> dict:
        """Retorna os cards de resumo do topo"""
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        
        sql = f"""
            SELECT 
                COUNT(DISTINCT PV.PEV_EMPRESA) as FILIAIS_ATIVAS,
                SUM(CAST(COALESCE(PV.PEV_VALOR_TOTAL, 0) AS NUMERIC(18,2))) as FATURAMENTO_TOTAL,
                SUM(CAST(COALESCE((
                    SELECT SUM(CAST(COALESCE(PI.PEVI_VALOR_TOTAL, 0) - (COALESCE(PI.PEVI_VALOR_CUSTO_UNITARIO, 0) * COALESCE(PI.PEVI_QUANTIDADE, 0)) AS NUMERIC(18,2)))
                    FROM TB_PEDIDO_VENDA_ITEM PI
                    WHERE PI.PEVI_PEDIDO_VENDA = PV.PEV_ID AND PI.PEVI_EMPRESA = PV.PEV_EMPRESA
                ), 0) AS NUMERIC(18,2))) as LUCRO_TOTAL
            FROM TB_PEDIDO_VENDA PV
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN CAST(:start_date AS DATE) AND CAST(:end_date AS DATE)
              AND PV.PEV_STATUS = 'F'
              {empresa_sql}
        """
        params = {
            "start_date": date_range.start.isoformat(),
            "end_date": date_range.end.isoformat(),
            **empresa_params
        }
        row = self._fetch_one(sql, params) or {}
        
        faturamento = self._safe_float(row.get("FATURAMENTO_TOTAL"))
        lucro = self._safe_float(row.get("LUCRO_TOTAL"))
        margem = (lucro / faturamento * 100) if faturamento > 0 else 0
        
        return {
            "faturamento_total": faturamento,
            "lucro_total": lucro,
            "margem_media": margem,
            "filiais_ativas": self._safe_int(row.get("FILIAIS_ATIVAS"))
        }

    def get_participacao_filiais(self, date_range: DateRange, empresa_id: int | None = None) -> list[dict]:
        """Dados para o gráfico de pizza (Participação no Faturamento)"""
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        
        sql = f"""
            SELECT 
                E.EMP_FANTASIA as FILIAL,
                SUM(CAST(COALESCE(PV.PEV_VALOR_TOTAL, 0) AS NUMERIC(18,2))) as VALOR
            FROM TB_PEDIDO_VENDA PV
            INNER JOIN TB_EMPRESA E ON E.EMP_ID = PV.PEV_EMPRESA
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN CAST(:start_date AS DATE) AND CAST(:end_date AS DATE)
              AND PV.PEV_STATUS = 'F'
              {empresa_sql}
            GROUP BY 1
            ORDER BY 2 DESC
        """
        params = {
            "start_date": date_range.start.isoformat(),
            "end_date": date_range.end.isoformat(),
            **empresa_params
        }
        return self._fetch_all(sql, params)

    def get_performance_detalhada(self, date_range: DateRange, empresa_id: int | None = None) -> list[dict]:
        """Dados para a tabela de indicadores por filial"""
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        
        sql = f"""
            SELECT 
                E.EMP_FANTASIA as FILIAL,
                SUM(CAST(COALESCE(PV.PEV_VALOR_TOTAL, 0) AS NUMERIC(18,2))) as FATURAMENTO,
                COUNT(PV.PEV_ID) as QTD_VENDAS,
                SUM(CAST(COALESCE((
                    SELECT SUM(CAST(COALESCE(PI.PEVI_VALOR_TOTAL, 0) - (COALESCE(PI.PEVI_VALOR_CUSTO_UNITARIO, 0) * COALESCE(PI.PEVI_QUANTIDADE, 0)) AS NUMERIC(18,2)))
                    FROM TB_PEDIDO_VENDA_ITEM PI
                    WHERE PI.PEVI_PEDIDO_VENDA = PV.PEV_ID AND PI.PEVI_EMPRESA = PV.PEV_EMPRESA
                ), 0) AS NUMERIC(18,2))) as LUCRO
            FROM TB_PEDIDO_VENDA PV
            INNER JOIN TB_EMPRESA E ON E.EMP_ID = PV.PEV_EMPRESA
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN CAST(:start_date AS DATE) AND CAST(:end_date AS DATE)
              AND PV.PEV_STATUS = 'F'
              {empresa_sql}
            GROUP BY 1
            ORDER BY 2 DESC
        """
        params = {
            "start_date": date_range.start.isoformat(),
            "end_date": date_range.end.isoformat(),
            **empresa_params
        }
        rows = self._fetch_all(sql, params)
        
        result = []
        for row in rows:
            fat = self._safe_float(row.get("FATURAMENTO"))
            lucro = self._safe_float(row.get("LUCRO"))
            vendas = self._safe_int(row.get("QTD_VENDAS"))
            
            result.append({
                "filial": row.get("FILIAL"),
                "faturamento": fat,
                "lucro": lucro,
                "margem": (lucro / fat * 100) if fat > 0 else 0,
                "vendas": vendas,
                "ticket_medio": (fat / vendas) if vendas > 0 else 0
            })
            
        return result

    def get_vendas_dia_semana(self, date_range: DateRange, empresa_id: int | None = None) -> list[dict]:
        """Vendas por dia da semana por filial"""
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        
        sql = f"""
            SELECT 
                E.EMP_FANTASIA as FILIAL,
                EXTRACT(WEEKDAY FROM PV.PEV_DT_LANCAMENTO) as DIA_SEM,
                SUM(CAST(COALESCE(PV.PEV_VALOR_TOTAL, 0) AS NUMERIC(18,2))) as TOTAL
            FROM TB_PEDIDO_VENDA PV
            INNER JOIN TB_EMPRESA E ON E.EMP_ID = PV.PEV_EMPRESA
            WHERE PV.PEV_DT_LANCAMENTO BETWEEN CAST(:start_date AS DATE) AND CAST(:end_date AS DATE)
              AND PV.PEV_STATUS = 'F'
              {empresa_sql}
            GROUP BY 1, 2
            ORDER BY 1, 2
        """
        params = {
            "start_date": date_range.start.isoformat(),
            "end_date": date_range.end.isoformat(),
            **empresa_params
        }
        return self._fetch_all(sql, params)

    def get_vendas_mensais(self, date_range: DateRange, empresa_id: int | None = None) -> list[dict]:
        """Evolução mensal de vendas por filial (últimos 12 meses)"""
        empresa_sql, empresa_params = self._empresa_filter("PV.PEV_EMPRESA", empresa_id)
        
        sql = f"""
            SELECT 
                E.EMP_FANTASIA as FILIAL,
                EXTRACT(YEAR FROM PV.PEV_DT_LANCAMENTO) as ANO,
                EXTRACT(MONTH FROM PV.PEV_DT_LANCAMENTO) as MES,
                SUM(CAST(COALESCE(PV.PEV_VALOR_TOTAL, 0) AS NUMERIC(18,2))) as TOTAL
            FROM TB_PEDIDO_VENDA PV
            INNER JOIN TB_EMPRESA E ON E.EMP_ID = PV.PEV_EMPRESA
            WHERE PV.PEV_DT_LANCAMENTO >= DATEADD(-11 MONTH TO CURRENT_DATE)
              AND PV.PEV_STATUS = 'F'
              {empresa_sql}
            GROUP BY 1, 2, 3
            ORDER BY 2, 3, 1
        """
        rows = self._fetch_all(sql, empresa_params)
        
        result = []
        for row in rows:
            result.append({
                "filial": row.get("FILIAL"),
                "mes": self._month_label(self._safe_int(row.get("MES"))),
                "ano": row.get("ANO"),
                "total": self._safe_float(row.get("TOTAL"))
            })
        return result
