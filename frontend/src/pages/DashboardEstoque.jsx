import Topbar from "../components/Topbar";
import "../styles/dashboard.css";
import "../styles/topbar.css";

const MOCK_STOCK_KPIs = [
  { label: "Produtos", value: "35.383", sub: "28.879 ativos • 6.504 inativos", color: "#2563eb", icon: "📦" },
  { label: "Valor em Estoque (Custo)", value: "R$ 2.688.414,27", sub: "", color: "#b48c04", icon: "💲" },
  { label: "Valor em Estoque (Venda)", value: "R$ 5.462.473,47", sub: "", color: "#16a34a", icon: "💲" },
  { label: "Alertas", value: "30.265", sub: "23.721 sem estoque • 6.544 abaixo do mínimo", color: "#ea580c", icon: "⚠️" },
];

const MOCK_PURCHASE_KPIs = [
  { label: "Compras (Últimos 30 dias)", value: "84", color: "#2563eb", icon: "📄" },
  { label: "Valor Total de Compras (Últimos 30 dias)", value: "R$ 272.535,81", color: "#16a34a", icon: "💲" },
];

const MOCK_TURNOVER = [
  { produto: "BIELETA VW GOL/FOX/SAVEIRO/VOYAGE/POLO/NIVUS/UP!/T-CROSS/SPACEFOX/CROSS 01/24 (Z", vendida: 153, estoque: 28 },
  { produto: "BIELETA VW GOL/FOX/SAVEIRO/VOYAGE/POLO/NIVUS/UP!/T-CROSS/SPACEFOX/CROSS 01/24 (Z", vendida: 153, estoque: 1 },
  { produto: "BIELETA VW GOL/FOX/SAVEIRO/VOYAGE/POLO/NIVUS/UP!/T-CROSS/SPACEFOX/CROSS 01/24 (Z", vendida: 153, estoque: 29 },
  { produto: "BIELETA VW GOL/FOX/SAVEIRO/VOYAGE/POLO/NIVUS/UP!/T-CROSS/SPACEFOX/CROSS 01/24 (Z", vendida: 150, estoque: 12 },
];

const MOCK_OUT_OF_STOCK = [
  { produto: "KIT CORREIA DENTADA+TENSOR VW GOL G2/G3/G4/G5/G6/PARATI/SAVEIRO/FOX/VOYAGE 1.0/1", estoque: -671, minimo: 4 },
  { produto: "KIT CORREIA DENTADA+TENSOR GM CORSA/CELTA/PRISMA/MONTANA 1.0/1.4/1.6 8V 94/..-FI", estoque: -588, minimo: 4 },
  { produto: "KIT CORREIA DENTADA+TENSOR FIAT FIRE PALIO/STRADA/SIENA/UNO MOTOR 1.0/1.3 8V", estoque: -537, minimo: 4 },
  { produto: "KIT CORREIA DENTADA+TENSOR FIAT FIRE PALIO/STRADA/SIENA/UNO MOTOR 1.0/1.3 8V", estoque: -512, minimo: 4 },
];

export default function DashboardEstoque({ onToggleSidebar, isMobileOrTablet, theme, toggleTheme }) {
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
        {MOCK_STOCK_KPIs.map((kpi, idx) => (
          <div key={idx} className="card-kpi" style={{ backgroundColor: kpi.color, border: 'none', position: 'relative' }}>
            <h3 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>{kpi.label}</h3>
            <p style={{ color: '#fff', fontSize: '28px', marginBottom: '8px' }}>{kpi.value}</p>
            {kpi.sub && <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{kpi.sub}</span>}
            <span style={{ position: 'absolute', right: '20px', bottom: '20px', fontSize: '24px', opacity: 0.5 }}>{kpi.icon}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-main-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', marginBottom: '20px' }}>
        {MOCK_PURCHASE_KPIs.map((kpi, idx) => (
          <div key={idx} className="card-kpi" style={{ backgroundColor: kpi.color, border: 'none', position: 'relative', padding: '24px' }}>
            <h3 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>{kpi.label}</h3>
            <p style={{ color: '#fff', fontSize: '28px', marginBottom: '0' }}>{kpi.value}</p>
            <span style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', fontSize: '28px', opacity: 0.5 }}>{kpi.icon}</span>
          </div>
        ))}
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
                {MOCK_TURNOVER.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ paddingLeft: '24px', fontSize: '12px', lineHeight: '1.4', maxWidth: '300px' }}>{item.produto}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{item.vendida}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, paddingRight: '24px' }}>{item.estoque}</td>
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
                {MOCK_OUT_OF_STOCK.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ paddingLeft: '24px', fontSize: '12px', lineHeight: '1.4', maxWidth: '300px' }}>{item.produto}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: item.estoque <= 0 ? '#ef4444' : 'inherit' }}>{item.estoque}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{item.minimo}</td>
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
