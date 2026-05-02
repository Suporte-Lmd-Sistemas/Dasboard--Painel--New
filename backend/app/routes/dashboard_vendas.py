from fastapi import APIRouter, Query, Depends
from app.schemas.dashboard_vendas import DashboardVendasResponse
from app.services.dashboard_vendas_service import DashboardVendasService
from app.routes.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Vendas"])


@router.get("/vendas", response_model=DashboardVendasResponse)
def get_dashboard_vendas(
    period: str = Query(default="month"),
    start: str | None = Query(default=None),
    end: str | None = Query(default=None),
    empresa_id: int | None = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    service = DashboardVendasService()

    return service.get_dashboard_vendas(
        period=period,
        start=start,
        end=end,
        empresa_id=empresa_id,
    )