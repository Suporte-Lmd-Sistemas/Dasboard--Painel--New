from fastapi import APIRouter, Depends, Query
from app.services.dashboard_filiais_service import DashboardFiliaisService
from app.schemas.dashboard_filiais import DashboardFiliaisResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Filiais"])

@router.get("/filiais", response_model=DashboardFiliaisResponse)
async def get_dashboard_filiais(
    period: str = Query("este_mes"),
    start: str | None = None,
    end: str | None = None,
    empresa_id: int | None = None,
    service: DashboardFiliaisService = Depends()
):
    return service.get_dashboard_filiais(period, start, end, empresa_id)
