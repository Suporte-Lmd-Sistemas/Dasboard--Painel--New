from fastapi import APIRouter, Depends, Query
from app.services.dashboard_filiais_service import DashboardFiliaisService
from app.schemas.dashboard_filiais import DashboardFiliaisResponse

router = APIRouter(prefix="/dashboard-filiais", tags=["Dashboard Filiais"])

@router.get("/", response_model=DashboardFiliaisResponse)
async def get_dashboard_filiais(
    period: str = Query("este_mes"),
    start: str | None = None,
    end: str | None = None,
    service: DashboardFiliaisService = Depends()
):
    return service.get_dashboard_filiais(period, start, end)
