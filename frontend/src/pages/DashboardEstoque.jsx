import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import api from "../services/api";
import "../styles/dashboard.css";
import "../styles/topbar.css";

const formatCurrency = (val) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

const formatNumber = (val) =>
  new Intl.NumberFormat("pt-BR").format(val || 0);

export default function DashboardEstoque({ onToggleSidebar, isMobileOrTablet, theme, toggleTheme }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.get("/api/dashboard/estoque");
        setData(response.data);
      } catch (err) {
        console.error("Erro ao carregar estoque:", err);
        setError("Não foi possível carregar os dados de estoque.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="dashboard-page"><div className="empty-state">Carregando dados de estoque...</div></div>;
  if (error) return <div className="dashboard-page"><div className="empty-state error">{error}</div></div>;
  if (!data) return null;

  return (
    <div className="dashboard-page">
      <Topbar
        titulo="Dashboard de Estoque"
        caminho="Dashboard / Estoque"
        subtitulo="Visão geral do controle de estoque e produtos"
        onToggleSidebar={onToggleSidebar}
        isMobileOrTablet={isMobileOrTablet}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div style={{ textAlign: 'center', marginBottom: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
        Dados atualizados automaticamente a cada 5 minutos • Última atualização: {new Date().toLocaleTimeString()}
      </div>

      <div className="cards-grid">
        <div className="card-kpi" style={{ backgroundColor: "#2563eb", border: 'none', position: 'relative' }}>
          <h3 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Produtos</h3>
          <p style={{ color: '#fff', fontSize: '28px', marginBottom: '8px' }}>{formatNumber(data.resumo.totalProdutos)}</p>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
            {formatNumber(data.resumo.ativos)} ativos • {formatNumber(data.resumo.inativos)} inativos
          </span>
          <span style={{ position: 'absolute', right: '20px', bottom: '20px', fontSize: '24px', opacity: 0.5 }}>📦</span>
        </div>

        <div className="card-kpi" style={{ backgroundColor: "#b48c04", border: 'none', position: 'relative' }}>
          <h3 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Valor em Estoque (Custo)</h3>
          <p style={{ color: '#fff', fontSize: '28px', marginBottom: '8px' }}>{formatCurrency(data.valores.custoTotal)}</p>
          <span style={{ position: 'absolute', right: '20px', bottom: '20px', fontSize: '24px', opacity: 0.5 }}>💲</span>
        </div>

        <div className="card-kpi" style={{ backgroundColor: "#16a34a", border: 'none', position: 'relative' }}>
          <h3 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Valor em Estoque (Venda)</h3>
          <p style={{ color: '#fff', fontSize: '28px', marginBottom: '8px' }}>{formatCurrency(data.valores.vendaTotal)}</p>
          <span style={{ position: 'absolute', right: '20px', bottom: '20px', fontSize: '24px', opacity: 0.5 }}>💲</span>
        </div>

        <div className="card-kpi" style={{ backgroundColor: "#ea580c", border: 'none', position: 'relative' }}>
          <h3 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Alertas</h3>
          <p style={{ color: '#fff', fontSize: '28px', marginBottom: '8px' }}>{formatNumber(data.alertas.total)}</p>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
            {formatNumber(data.alertas.semEstoque)} sem estoque • {formatNumber(data.alertas.abaixoMinimo)} abaixo do mínimo
          </span>
          <span style={{ position: 'absolute', right: '20px', bottom: '20px', fontSize: '24px', opacity: 0.5 }}>⚠️</span>
        </div>
      </div>

      <div className="dashboard-main-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', marginBottom: '20px' }}>
        <div className="card-kpi" style={{ backgroundColor: "#2563eb", border: 'none', position: 'relative', padding: '24px' }}>
          <h3 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Compras (Últimos 30 dias)</h3>
          <p style={{ color: '#fff', fontSize: '28px', marginBottom: '0' }}>{formatNumber(data.compras.quantidade)}</p>
          <span style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', fontSize: '28px', opacity: 0.5 }}>📄</span>
        </div>

        <div className="card-kpi" style={{ backgroundColor: "#16a34a", border: 'none', position: 'relative', padding: '24px' }}>
          <h3 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Valor Total de Compras (Últimos 30 dias)</h3>
          <p style={{ color: '#fff', fontSize: '28px', marginBottom: '0' }}>{formatCurrency(data.compras.valorTotal)}</p>
          <span style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', fontSize: '28px', opacity: 0.5 }}>💲</span>
        </div>
      </div>

      <div className="two-columns">
        <div className="chart-box premium-box" style={{ padding: '0' }}>
          <div style={{ padding: '24px 24px 12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Produtos por Maior Rotatividade(30 dias)</h3>
          </div>
          <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="custom-table premium-table">
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-card)' }}>
                <tr>
                  <th style={{ paddingLeft: '24px' }}>Produto</th>
                  <th style={{ textAlign: 'right' }}>Qtd. Vendida</th>
                  <th style={{ textAlign: 'right', paddingRight: '24px' }}>Estoque</th>
                </tr>
              </thead>
              <tbody>
                {data.rotatividade.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ paddingLeft: '24px', fontSize: '12px', lineHeight: '1.4', maxWidth: '300px' }}>{item.produto}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatNumber(item.vendida)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, paddingRight: '24px' }}>{formatNumber(item.estoque)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
            Mostrando primeiros 50 itens
          </div>
        </div>

        <div className="chart-box premium-box" style={{ padding: '0' }}>
          <div style={{ padding: '24px 24px 12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Produtos com Estoque Zerado ou Abaixo do Mínimo</h3>
          </div>
          <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="custom-table premium-table">
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-card)' }}>
                <tr>
                  <th style={{ paddingLeft: '24px' }}>Produto</th>
                  <th style={{ textAlign: 'right' }}>Estoque</th>
                  <th style={{ textAlign: 'right' }}>Mínimo</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {data.criticos.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ paddingLeft: '24px', fontSize: '12px', lineHeight: '1.4', maxWidth: '300px' }}>{item.produto}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: item.estoque <= 0 ? '#ef4444' : 'inherit' }}>{formatNumber(item.estoque)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatNumber(item.minimo)}</td>
                    <td style={{ paddingRight: '24px' }}>
                       <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', marginLeft: 'auto' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
            Mostrando primeiros 50 itens
          </div>
        </div>
      </div>
    </div>
  );
}
