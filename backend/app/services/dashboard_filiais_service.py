from __future__ import annotations
from app.repositories.dashboard_filiais_repository import DashboardFiliaisRepository
from app.services.base_dashboard_service import BaseDashboardService

class DashboardFiliaisService(BaseDashboardService):
    def get_dashboard_filiais(
        self,
        period: str,
        start: str | None,
        end: str | None,
        empresa_id: int | None = None,
    ) -> dict:
        repository = DashboardFiliaisRepository()
        date_range = self._resolve_period(period, start, end)

        resumo = repository.get_resumo_filiais(date_range, empresa_id)
        participacao = repository.get_participacao_filiais(date_range, empresa_id)
        performance = repository.get_performance_detalhada(date_range, empresa_id)
        vendas_semana = repository.get_vendas_dia_semana(date_range, empresa_id)
        vendas_mensais = repository.get_vendas_mensais(date_range, empresa_id)

        return {
            "resumo": resumo,
            "participacao": participacao,
            "performance": performance,
            "vendas_semana": vendas_semana,
            "vendas_mensais": vendas_mensais
        }
