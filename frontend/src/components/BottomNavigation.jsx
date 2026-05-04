import { Link, useLocation } from "react-router-dom";
import "../styles/bottom-navigation.css";

function BottomNavigation() {
  const location = useLocation();

  const navItems = [
    {
      path: "/dashboard/vendas",
      label: "Vendas",
      icon: "/icons/painel.svg",
      active: location.pathname.startsWith("/dashboard/vendas"),
    },
    {
      path: "/dashboard/financeiro",
      label: "Financeiro",
      icon: "/icons/painel.svg", // Reusing same icon as dashboard for now, or could use another
      active: location.pathname.startsWith("/dashboard/financeiro"),
    },
    {
      path: "/relatorios",
      label: "Relatórios",
      icon: "/icons/relatorio.svg",
      active: location.pathname.startsWith("/relatorios"),
    },
    {
      path: "/funcionarios",
      label: "Equipe",
      icon: "/icons/funcionario.svg",
      active: location.pathname.startsWith("/funcionarios"),
    },
    {
      path: "/dashboard/estoque",
      label: "Estoque",
      icon: "/icons/painel.svg",
      active: location.pathname.startsWith("/dashboard/estoque"),
    },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-item ${item.active ? "active" : ""}`}
          aria-label={item.label}
        >
          <div className="bottom-nav-icon">
            <img src={item.icon} alt="" aria-hidden="true" />
          </div>
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default BottomNavigation;
