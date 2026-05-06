import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Topbar from "../components/Topbar";
import DashboardFilters from "../components/DashboardFilters";
import { useEmpresa } from "../context/EmpresaContext";
import "../styles/dashboard.css";

export default function DetalhesPedidos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { empresaAtual } = useEmpresa();

  const [pedidos, setPedidos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parâmetros de Filtro e Paginação
  const period = searchParams.get("period") || "month";
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const status = searchParams.get("status") || "TODOS";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 10;

  useEffect(() => {
    async function fetchPedidos() {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams);
        if (!params.get("page")) params.set("page", "1");
        if (!params.get("empresa_id") && empresaAtual?.id) params.set("empresa_id", empresaAtual.id);

        const response = await api.get(`/api/dashboard/vendas/pedidos?${params.toString()}`);
        setPedidos(response.data.data);
        setTotal(response.data.total);
      } catch (err) {
        console.error("Erro ao carregar detalhes dos pedidos:", err);
        setError("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    }
    fetchPedidos();
  }, [searchParams, empresaAtual?.id]);

  const handleFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    params.set("period", newFilters.period);
    if (newFilters.start) params.set("start", newFilters.start);
    else params.delete("start");
    if (newFilters.end) params.set("end", newFilters.end);
    else params.delete("end");
    
    params.set("page", "1"); 
    setSearchParams(params);
  };

  const handleStatusChange = (newStatus) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", newStatus);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="dashboard-page">
      <Topbar
        titulo="Detalhamento de Pedidos"
        caminho="Dashboard / Vendas / Detalhes"
        subtitulo="Listagem detalhada de todas as vendas do período"
      />

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <DashboardFilters onChange={handleFilters} />
        </div>
        
        {/* Filtro de Status Customizado */}
        <div className="filter-group" style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status do Pedido</label>
          <select 
            value={status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontWeight: 600,
              minWidth: '200px',
              outline: 'none'
            }}
          >
            <option value="TODOS">Todos os Status</option>
            <option value="ABERTO">Em Aberto</option>
            <option value="FATURADO">Faturados</option>
            <option value="CANCELADO">Cancelados</option>
            <option value="ORCAMENTO">Orçamentos</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        {loading ? (
          <div className="status-message info-message">Buscando dados no ERP...</div>
        ) : error ? (
          <div className="status-message error-message">{error}</div>
        ) : (
          <>
            <div className="chart-box premium-box" style={{ padding: '0', overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="custom-table premium-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-main)' }}>
                      <th style={{ padding: '20px 24px' }}>ID</th>
                      <th>Data Lançamento</th>
                      <th>Cliente</th>
                      <th style={{ textAlign: 'right' }}>Valor Total</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                          Nenhum pedido encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    ) : pedidos.map((item) => (
                      <tr key={item.id}>
                        <td style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--primary)' }}>#{item.id}</td>
                        <td>{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                        <td style={{ fontWeight: 600 }}>{item.cliente}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-main)' }}>{formatCurrency(item.valor)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`status-badge ${item.status.toLowerCase()}`} style={{
                            padding: '6px 14px',
                            borderRadius: '99px',
                            fontSize: '11px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            background: item.status.toLowerCase() === 'faturado' || item.status.toLowerCase() === 'concluido' ? '#dcfce7' : 
                                       item.status.toLowerCase() === 'cancelado' ? '#fee2e2' : '#fef9c3',
                            color: item.status.toLowerCase() === 'faturado' || item.status.toLowerCase() === 'concluido' ? '#166534' : 
                                   item.status.toLowerCase() === 'cancelado' ? '#991b1b' : '#854d0e'
                          }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              <div style={{ 
                padding: '20px 32px', 
                borderTop: '1px solid var(--border-color)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'var(--bg-card)'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Mostrando <strong>{pedidos.length}</strong> de <strong>{total}</strong> registros
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="pagination-btn"
                  >
                    Anterior
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', px: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Página {page} de {totalPages || 1}
                  </div>
                  <button 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="pagination-btn"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <button 
        onClick={() => navigate('/dashboard/vendas')}
        style={{
          marginTop: '24px',
          padding: '14px 28px',
          borderRadius: '14px',
          border: 'none',
          background: 'var(--primary)',
          color: '#fff',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>&larr;</span> Voltar ao Dashboard
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .pagination-btn {
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          cursor: pointer;
          font-weight: 600;
          color: var(--text-main);
          transition: all 0.2s;
        }
        .pagination-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .pagination-btn:not(:disabled):hover {
          background: var(--bg-main);
          border-color: var(--primary);
          color: var(--primary);
        }
      `}} />
    </div>
  );
}
