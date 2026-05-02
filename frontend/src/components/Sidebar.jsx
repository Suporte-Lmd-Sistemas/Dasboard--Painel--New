<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar({
  isMobileOrTablet = false,
  isOpen = false,
  onClose = () => {},
}) {
  const location = useLocation();

  const [dashboardOpen, setDashboardOpen] = useState(
    location.pathname.startsWith("/dashboard")
  );

  useEffect(() => {
    if (location.pathname.startsWith("/dashboard")) {
      setDashboardOpen(true);
    }
  }, [location.pathname]);

=======
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar() {
  const location = useLocation();

>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const isVendasRoute = location.pathname === "/dashboard/vendas";
  const isFinanceiroRoute = location.pathname === "/dashboard/financeiro";
  const isMultiempresaRoute = location.pathname === "/dashboard/multiempresa";
<<<<<<< HEAD
  const isRelatoriosRoute = location.pathname.startsWith("/relatorios");
  const isFuncionariosRoute = location.pathname.startsWith("/funcionarios");
  const isPerformanceRoute = location.pathname.startsWith("/performance");

  function handleDashboardClick() {
    setDashboardOpen((prev) => !prev);
  }

  function handleMobileNavigate() {
    if (isMobileOrTablet) {
      onClose();
    }
  }

  return (
    <aside
      className={`sidebar ${isMobileOrTablet ? "sidebar-overlay-mode" : ""} ${
        isOpen ? "sidebar-open" : ""
      }`}
    >
      <div className="logo">
        <img
          src="/logo-comprida.svg"
          alt="LMD Sistemas"
          className="sidebar-logo-full"
        />
        <img
          src="/logo-azul.svg"
          alt="LMD"
          className="sidebar-logo-icon"
        />
      </div>

      <nav className="sidebar-nav">
        <div className="menu-group">
          <button
            type="button"
            className={`menu-item ${isDashboardRoute ? "active" : ""}`}
            onClick={handleDashboardClick}
            title="Dashboard"
          >
            <span className="menu-icon" aria-hidden="true">
              <img src="/icons/painel.svg" alt="" />
            </span>
            <span className="menu-label">Dashboard</span>
          </button>
=======
  const isRelatoriosRoute = location.pathname === "/relatorios";
  const isFuncionariosRoute = location.pathname === "/funcionarios";
  const isPerformanceRoute = location.pathname === "/performance";

  const [dashboardOpen, setDashboardOpen] = useState(isDashboardRoute);

  function toggleDashboard() {
    setDashboardOpen(!dashboardOpen);
  }

  return (
    <div className="sidebar">
      <div className="logo">
        <img src="\logo.png" alt="LMD Sistemas" />
        <strong></strong>
      </div>

      <nav>
        <div className="menu-group">
          <div
            className={`menu-item ${isDashboardRoute ? "active" : ""}`}
            onClick={toggleDashboard}
          >
            Dashboard
          </div>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f

          {dashboardOpen && (
            <div className="submenu">
              <Link
                to="/dashboard/vendas"
<<<<<<< HEAD
                onClick={handleMobileNavigate}
                className={`submenu-item ${
                  isVendasRoute ? "submenu-item-active" : ""
                }`}
=======
                className={`submenu-item ${isVendasRoute ? "submenu-item-active" : ""}`}
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
              >
                Vendas
              </Link>

              <Link
                to="/dashboard/financeiro"
<<<<<<< HEAD
                onClick={handleMobileNavigate}
                className={`submenu-item ${
                  isFinanceiroRoute ? "submenu-item-active" : ""
                }`}
=======
                className={`submenu-item ${isFinanceiroRoute ? "submenu-item-active" : ""}`}
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
              >
                Financeiro
              </Link>

              <Link
                to="/dashboard/multiempresa"
<<<<<<< HEAD
                onClick={handleMobileNavigate}
                className={`submenu-item ${
                  isMultiempresaRoute ? "submenu-item-active" : ""
                }`}
=======
                className={`submenu-item ${isMultiempresaRoute ? "submenu-item-active" : ""}`}
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
              >
                MultiEmpresa
              </Link>
            </div>
          )}
        </div>

        <Link
          to="/relatorios"
<<<<<<< HEAD
          onClick={handleMobileNavigate}
          className={`menu-item ${isRelatoriosRoute ? "active" : ""}`}
          title="Relatórios"
        >
          <span className="menu-icon" aria-hidden="true">
            <img src="/icons/relatorio.svg" alt="" />
          </span>
          <span className="menu-label">Relatórios</span>
=======
          className={`menu-item ${isRelatoriosRoute ? "active" : ""}`}
        >
          Relatórios
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
        </Link>

        <Link
          to="/funcionarios"
<<<<<<< HEAD
          onClick={handleMobileNavigate}
          className={`menu-item ${isFuncionariosRoute ? "active" : ""}`}
          title="Funcionários"
        >
          <span className="menu-icon" aria-hidden="true">
            <img src="/icons/funcionario.svg" alt="" />
          </span>
          <span className="menu-label">Funcionários</span>
=======
          className={`menu-item ${isFuncionariosRoute ? "active" : ""}`}
        >
          Funcionários
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
        </Link>

        <Link
          to="/performance"
<<<<<<< HEAD
          onClick={handleMobileNavigate}
          className={`menu-item ${isPerformanceRoute ? "active" : ""}`}
          title="Performance"
        >
          <span className="menu-icon" aria-hidden="true">
            <img src="/icons/performance.svg" alt="" />
          </span>
          <span className="menu-label">Performance</span>
        </Link>
      </nav>
    </aside>
=======
          className={`menu-item ${isPerformanceRoute ? "active" : ""}`}
        >
          Performance
        </Link>
      </nav>
    </div>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
  );
}

export default Sidebar;