import { useEffect, useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  AreaChart,
  Area
} from "recharts";
import Topbar from "../components/Topbar";
import DashboardFilters from "../components/DashboardFilters";
import api from "../services/api";
import { useEmpresa } from "../context/EmpresaContext";
import "../styles/dashboard-filiais.css";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(2).replace(".", ",")}%`;
}

export default function DashboardFiliais({ onToggleSidebar, isMobileOrTablet }) {
  const { empresaAtual } = useEmpresa();
  
  const [filters, setFilters] = useState({
    period: "year", // Começar logo com o ano para facilitar o teste
    start: null,
    end: null,
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("period", filters.period);
        
        if (filters.start) params.set("start", filters.start);
        if (filters.end) params.set("end", filters.end);
        
        // No Dashboard de Filiais, removemos o filtro fixo de empresa_id 
        // para que ele traga sempre todas as filiais da base de dados.

        console.log("Buscando dados das filiais com parâmetros:", params.toString());
        const response = await api.get(`/api/dashboard/filiais?${params.toString()}`);
        console.log("Dados recebidos do servidor:", response.data);
        
        setData(response.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard de filiais:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [filters.period, filters.start, filters.end, empresaAtual?.id]); // Dependências mais específicas

  // Preparar dados para o gráfico de pizza
  const pieData = useMemo(() => {
    const participacao = data?.participacao || data?.PARTICIPACAO;
    if (!participacao) return [];
    return participacao.map((item, index) => ({
      name: item.filial || item.FILIAL,
      value: item.valor || item.VALOR,
      color: COLORS[index % COLORS.length]
    }));
  }, [data]);

  // Preparar dados para o gráfico de barras por dia da semana
  const weeklyData = useMemo(() => {
    const vendasSemana = data?.vendas_semana || data?.VENDAS_SEMANA;
    if (!vendasSemana) return [];
    const days = [0, 1, 2, 3, 4, 5, 6].map(d => ({ dia: DIAS_SEMANA[d], index: d }));
    const branches = [...new Set(vendasSemana.map(v => v.filial || v.FILIAL))];
    
    return days.map(d => {
      const row = { name: d.dia };
      branches.forEach(b => {
        const val = vendasSemana.find(v => (v.filial || v.FILIAL) === b && (v.dia_sem ?? v.DIA_SEM) === d.index);
        row[b] = val ? (val.total || val.TOTAL) : 0;
      });
      return row;
    });
  }, [data]);

  // Preparar dados para o gráfico de linha (Evolução Mensal)
  const monthlyTimeline = useMemo(() => {
    const vendasMensais = data?.vendas_mensais || data?.VENDAS_MENSAIS;
    if (!vendasMensais) return [];
    const months = [...new Set(vendasMensais.map(v => v.mes || v.MES))];
    const branches = [...new Set(vendasMensais.map(v => v.filial || v.FILIAL))];
    
    return months.map(m => {
      const row = { name: m };
      branches.forEach(b => {
        const val = vendasMensais.find(v => (v.filial || v.FILIAL) === b && (v.mes || v.MES) === m);
        row[b] = val ? (val.total || val.TOTAL) : 0;
      });
      return row;
    });
  }, [data]);

  const performanceData = useMemo(() => {
    const perf = data?.performance || data?.PERFORMANCE;
    if (!perf) return [];
    return perf.map(item => ({
      filial: item.filial || item.FILIAL,
      faturamento: item.faturamento || item.FATURAMENTO,
      lucro: item.lucro || item.LUCRO,
      margem: item.margem || item.MARGEM,
      vendas: item.vendas || item.VENDAS,
      ticket_medio: item.ticket_medio || item.TICKET_MEDIO
    }));
  }, [data]);

  const resumo = data?.resumo || data?.RESUMO;
  const vendasSemanaForBranches = data?.vendas_semana || data?.VENDAS_SEMANA;

  const totalFaturamento = resumo?.faturamento_total ?? resumo?.FATURAMENTO_TOTAL ?? 0;
  const branches = vendasSemanaForBranches ? [...new Set(vendasSemanaForBranches.map(v => v.filial || v.FILIAL))] : [];

  return (
    <div className="dashboard-layout">
      <Topbar onToggleSidebar={onToggleSidebar} title="Dashboard de Filiais" />
      
      <div className="filiais-container">
        <div className="filiais-header">
          <h1>Dashboard de Filiais</h1>
          <p>Visão geral de vendas, faturamento e performance por filial</p>
        </div>

        <DashboardFilters 
          onChange={(newFilters) => {
            console.log("Filtros alterados pelo usuário:", newFilters);
            setFilters(prev => ({ ...prev, ...newFilters }));
          }}
          showTypeFilter={false}
        />

        {loading && !data ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando dados da rede...</p>
          </div>
        ) : !data ? (
          <div className="error-state">
            <p>Não foi possível carregar os dados. Verifique sua conexão.</p>
          </div>
        ) : (
          <>
            <div className="filiais-cards-grid">
              <div className="filial-card green">
                <div className="filial-card-content">
                  <h3>Faturamento Total</h3>
                  <span className="value">{formatCurrency(resumo?.faturamento_total ?? resumo?.FATURAMENTO_TOTAL)}</span>
                </div>
                <div className="filial-card-icon">$</div>
              </div>

              <div className="filial-card blue">
                <div className="filial-card-content">
                  <h3>Lucro Bruto</h3>
                  <span className="value">{formatCurrency(resumo?.lucro_total ?? resumo?.LUCRO_TOTAL)}</span>
                </div>
                <div className="filial-card-icon">↑</div>
              </div>

              <div className="filial-card purple">
                <div className="filial-card-content">
                  <h3>Margem de Lucro</h3>
                  <span className="value">{formatPercent(resumo?.margem_media ?? resumo?.MARGEM_MEDIA)}</span>
                </div>
                <div className="filial-card-icon">◔</div>
              </div>

              <div className="filial-card orange">
                <div className="filial-card-content">
                  <h3>Filiais Ativas</h3>
                  <span className="value">{resumo?.filiais_ativas ?? resumo?.FILIAIS_ATIVAS ?? 0}</span>
                </div>
                <div className="filial-card-icon">📦</div>
              </div>
            </div>

            <div className="filiais-charts-section">
              <div className="chart-header">
                <h2>Participação no Faturamento da Rede</h2>
                <p>Distribuição percentual do faturamento por filial</p>
              </div>
              
              <div className="chart-container-flex">
                <div className="pie-chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="resumo-filiais-list">
                  {pieData.map((item) => {
                    const percent = totalFaturamento > 0 ? (item.value / totalFaturamento) * 100 : 0;
                    return (
                      <div className="filial-resumo-item" key={item.name}>
                        <div className="filial-resumo-info">
                          <div>
                            <span className="name">{item.name}</span>
                            <span className="percent"> {percent.toFixed(1)}%</span>
                          </div>
                          <span className="value">{formatCurrency(item.value)}</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${percent}%`, backgroundColor: item.color }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="filiais-grid-two">
                <div className="filiais-charts-section">
                    <div className="chart-header">
                        <h2>Vendas por Dia da Semana</h2>
                        <p>Comparativo de volume de vendas por filial</p>
                    </div>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `R$ ${v/1000}k`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                {branches.map((b, i) => (
                                    <Bar key={b} dataKey={b} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="filiais-charts-section">
                    <div className="chart-header">
                        <h2>Margem de Lucro por Filial</h2>
                        <p>Comparativo de rentabilidade entre as unidades</p>
                    </div>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" axisLine={false} tickLine={false} unit="%" />
                                <YAxis dataKey="filial" type="category" axisLine={false} tickLine={false} width={100} />
                                <Tooltip />
                                <Bar dataKey="margem" name="Margem (%)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="filiais-charts-section">
                <div className="chart-header">
                    <h2>Vendas Mensais por Filial</h2>
                    <p>Evolução do faturamento nos últimos 12 meses</p>
                </div>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyTimeline}>
                            <defs>
                                {branches.map((b, i) => (
                                    <linearGradient key={`grad-${b}`} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0}/>
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `R$ ${v/1000}k`} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            {branches.map((b, i) => (
                                <Area 
                                    key={b} 
                                    type="monotone" 
                                    dataKey={b} 
                                    stroke={COLORS[i % COLORS.length]} 
                                    fillOpacity={1} 
                                    fill={`url(#color-${i})`} 
                                    strokeWidth={3}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="filiais-charts-section">
              <div className="chart-header">
                <h2>Indicadores Detalhados por Filial</h2>
                <p>Análise detalhada de performance por filial</p>
              </div>

              <div className="filiais-table-wrapper">
                <table className="filiais-table">
                  <thead>
                    <tr>
                      <th>Filial</th>
                      <th>Faturamento</th>
                      <th>Lucro Bruto</th>
                      <th>Margem</th>
                      <th>Ticket Médio</th>
                      <th>Vendas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.map((item) => (
                      <tr key={item.filial}>
                        <td className="filial-name-cell">{item.filial}</td>
                        <td>{formatCurrency(item.faturamento)}</td>
                        <td>{formatCurrency(item.lucro)}</td>
                        <td>{formatPercent(item.margem)}</td>
                        <td>{formatCurrency(item.ticket_medio)}</td>
                        <td>{item.vendas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
