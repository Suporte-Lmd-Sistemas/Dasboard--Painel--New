<<<<<<< HEAD
﻿import { useNavigate } from "react-router-dom";
=======
import { useNavigate } from "react-router-dom";
import "../styles/funcionarios.css";
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f

function FuncionarioCard({ funcionario }) {
  const navigate = useNavigate();

<<<<<<< HEAD
  const nome = funcionario?.nome || "Funcionário sem nome";
  const funcionarioId = funcionario?.pes_id || funcionario?.col_pessoa;
  const idErp = funcionario?.col_pessoa || "-";
  const cargoOficial = funcionario?.cargo_oficial || "Não informado";
  const status = funcionario?.status || "Sem status";
  const vendedor = Boolean(funcionario?.vendedor);

  function abrirAnalise() {
    if (!funcionarioId) {
      alert("Funcionário inválido para análise.");
      return;
    }

    navigate(`/funcionarios/${funcionarioId}/analise`);
  }

  function abrirDetalhe() {
    if (!funcionarioId) {
      alert("Funcionário inválido para detalhamento.");
      return;
    }

    navigate(`/funcionarios/${funcionarioId}`);
=======
  function abrirAnalise(event) {
    event.stopPropagation();

    if (!funcionario?.rh_id) {
      console.error("rh_id do funcionário não encontrado:", funcionario);
      return;
    }

    navigate(`/funcionarios/${funcionario.rh_id}/analise`);
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
  }

  return (
    <div className="funcionario-card">
<<<<<<< HEAD
      <div className="funcionario-avatar" />

      <div className="funcionario-id">ERP #{idErp}</div>

      <div className="funcionario-nome">{nome}</div>

      <div className="funcionario-info-box">
        <div className="funcionario-info-row">
          <span className="funcionario-label">Cargo ERP</span>
          <span className="funcionario-value">{cargoOficial}</span>
        </div>

        <div className="funcionario-info-row">
          <span className="funcionario-label">Status</span>
          <span className="funcionario-value">{status}</span>
=======
      <div className="funcionario-avatar"></div>

      <div className="funcionario-id">
        ID ERP - {funcionario.col_pessoa || "Não informado"}
      </div>

      <h3 className="funcionario-nome">{funcionario.nome || "Sem nome"}</h3>

      <div className="funcionario-info-box">
        <div className="funcionario-info-row">
          <span className="funcionario-label">Cargo</span>
          <span className="funcionario-value">
            {funcionario.cargo_rh_nome || funcionario.cargo_oficial || "Não informado"}
          </span>
        </div>

        <div className="funcionario-info-row">
          <span className="funcionario-label">Departamento</span>
          <span className="funcionario-value">
            {funcionario.departamento_nome || "Não informado"}
          </span>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
        </div>
      </div>

      <div className="funcionario-tags">
<<<<<<< HEAD
        {vendedor ? (
          <span className="tag tag-blue">Vendedor</span>
        ) : (
          <span className="tag tag-gray">Colaborador</span>
        )}

        <button
          type="button"
          className="tag-button tag-button-gray"
          onClick={abrirDetalhe}
        >
          Detalhe
        </button>

        <button
          type="button"
          className="tag-button tag-button-blue"
          onClick={abrirAnalise}
        >
=======
        <span className="tag tag-gray">
          {funcionario.status || "Sem status"}
        </span>

        <button className="tag-button tag-button-blue" onClick={abrirAnalise}>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
          Análise
        </button>
      </div>
    </div>
  );
}

export default FuncionarioCard;