import Topbar from "../components/Topbar";
import "../styles/dashboard.css";
import "../styles/topbar.css";

<<<<<<< HEAD
function DashboardMultiEmpresa({ onToggleSidebar, isMobileOrTablet }) {
=======
function DashboardMultiEmpresa() {
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
  return (
    <div className="dashboard-page">
      <Topbar titulo="Dashboard" caminho="Dashboard / MultiEmpresa" />

      <div className="chart-box">
        <h3>MultiEmpresa</h3>
        <div className="placeholder">Página inicial do dashboard multiempresa</div>
      </div>
    </div>
  );
}

export default DashboardMultiEmpresa;