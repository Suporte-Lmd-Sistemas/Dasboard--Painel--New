from __future__ import annotations

from app.repositories.dashboard_vendas_repository import DashboardVendasRepository
from app.services.base_dashboard_service import BaseDashboardService


class DashboardVendasService(BaseDashboardService):
    def __init__(self) -> None:
        self.repository = DashboardVendasRepository()

    def get_dashboard_vendas(
        self,
        period: str,
        start: str | None,
        end: str | None,
        empresa_id: int | None = None,
    ) -> dict:
        date_range = self._resolve_period(period, start, end)

        # Tentar carregar dados sincronizados (JSON) como fallback
        sync_data = self._load_sync_data()
        if sync_data and "VENDAS" in sync_data:
            print(f"[DEBUG SYNC] Aplicando dados sincronizados para o Dashboard de Vendas")
            return self._apply_sync_data(sync_data["VENDAS"], period, date_range)

        print(f"[DEBUG SYNC] Vendas: Nenhum dado sincronizado encontrado.")

        faturamento = self.repository.get_faturamento_total(date_range, empresa_id)
        pedidos = self.repository.get_total_pedidos(date_range, empresa_id)
        itens = self.repository.get_total_itens(date_range, empresa_id)
        custo = self.repository.get_custo_total(date_range, empresa_id)
        
        ticket_medio = faturamento / pedidos if pedidos > 0 else 0
        itens_por_venda = itens / pedidos if pedidos > 0 else 0
        lucro_bruto = faturamento - custo
        
        # Cálculos de Percentual
        margem_lucro = (lucro_bruto / faturamento * 100) if faturamento > 0 else 0
        markup = (lucro_bruto / custo * 100) if custo > 0 else 0
        lucratividade = margem_lucro # Simplificado conforme imagem, onde lucro sobre receitas = margem

        return {
            "resumo": {
                "faturamento": faturamento,
                "pedidos": pedidos,
                "ticketMedio": round(ticket_medio, 2),
                "itensPorVenda": round(itens_por_venda, 2),
                "custoTotal": custo,
                "lucroBruto": lucro_bruto,
                "margemLucro": round(margem_lucro, 2),
                "markup": round(markup, 2),
                "lucratividade": round(lucratividade, 2),
                "variation": self._get_faturamento_variation(date_range, empresa_id),
            },
            "historico": self.repository.get_historico_vendas(empresa_id),
            "topClientes": self.repository.get_top_clientes(date_range, empresa_id),
            "topProdutos": self.repository.get_top_produtos(date_range, empresa_id),
            "vendasPorCidade": self.repository.get_vendas_por_cidade(date_range, empresa_id),
            "vendasPorVendedor": self.repository.get_vendas_por_vendedor(date_range, empresa_id),
            "vendasPorGrupo": self.repository.get_vendas_por_grupo(date_range, empresa_id),
            "vendasPorMarca": self.repository.get_vendas_por_marca(date_range, empresa_id),
            "mediaPorFaixaHoraria": self.repository.get_media_por_faixa_horaria(date_range, empresa_id),
            "mediaPorDiaSemana": self.repository.get_media_por_dia_semana(date_range, empresa_id),
        }

    def _apply_sync_data(self, sync_data: dict, period: str, date_range: DateRange) -> dict:
        """
        Mapeia os dados crus do JSON de sincronismo para o formato do Dashboard de Vendas,
        respeitando o filtro de datas.
        """
        vendas_diarias = sync_data.get("vendas_diarias", [])
        
        faturamento = 0.0
        pedidos = 0
        
        # Filtra os dados de acordo com o date_range selecionado no dashboard
        for dia in vendas_diarias:
            try:
                from datetime import datetime
                data_venda = datetime.strptime(dia["data"], "%Y-%m-%d").date()
                if date_range.start <= data_venda <= date_range.end:
                    faturamento += dia.get("faturamento", 0)
                    pedidos += dia.get("pedidos", 0)
            except Exception:
                pass
        
        ticket_medio = faturamento / pedidos if pedidos else 0

        return {
            "resumo": {
                "faturamento": faturamento,
                "pedidos": pedidos,
                "ticketMedio": round(ticket_medio, 2),
                "variation": "Sync Ativo",
            },
            "historico": [],
            "topClientes": [],
            "topProdutos": [],
            "vendasPorCidade": [],
            "vendasPorVendedor": [],
            "vendasPorGrupo": [],
            "vendasPorMarca": [],
            "mediaPorFaixaHoraria": [],
            "mediaPorDiaSemana": [],
            "is_remote": True
        }

    def _get_faturamento_variation(self, date_range, empresa_id: int | None) -> str:
        previous_period = self._previous_period(date_range)
        current_value = self.repository.get_faturamento_total(date_range, empresa_id)
        previous_value = self.repository.get_faturamento_total(previous_period, empresa_id)
        return self._format_variation(current_value, previous_value)

    def get_detalhes_pedidos(self, period: str, start: str | None, end: str | None, empresa_id: int | None = None, page: int = 1, page_size: int = 10, status: str | None = None) -> dict:
        date_range = self._resolve_period(period, start, end)
        return self.repository.get_detalhes_pedidos(date_range, empresa_id, page, page_size, status)

    def get_detalhes_novos_clientes(self, period: str, start: str | None, end: str | None, empresa_id: int | None = None, page: int = 1, page_size: int = 10) -> dict:
        date_range = self._resolve_period(period, start, end)
        return self.repository.get_detalhes_novos_clientes(date_range, empresa_id, page, page_size)