from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from typing import List

class BaseSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=lambda x: x.upper())

class ResumoFiliais(BaseSchema):
    faturamento_total: float
    lucro_total: float
    margem_media: float
    filiais_ativas: int

class ParticipacaoFilial(BaseSchema):
    filial: str
    valor: float

class PerformanceFilial(BaseSchema):
    filial: str
    faturamento: float
    lucro: float
    margem: float
    vendas: int
    ticket_medio: float

class VendaDiaSemana(BaseSchema):
    filial: str
    dia_sem: int
    total: float

class VendaMensal(BaseSchema):
    filial: str
    mes: str
    ano: int
    total: float

class DashboardFiliaisResponse(BaseSchema):
    resumo: ResumoFiliais
    participacao: List[ParticipacaoFilial]
    performance: List[PerformanceFilial]
    vendas_semana: List[VendaDiaSemana]
    vendas_mensais: List[VendaMensal]
