<<<<<<< HEAD
﻿import { useEffect, useMemo, useState } from "react";
=======
import { useEffect, useMemo, useState } from "react";
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
import Topbar from "../components/Topbar";
import FuncionarioCard from "../components/FuncionarioCard";
import api from "../services/api";
import "../styles/dashboard.css";
import "../styles/topbar.css";
import "../styles/funcionarios.css";

<<<<<<< HEAD
function Funcionarios({ onToggleSidebar, isMobileOrTablet }) {
=======
function Funcionarios() {
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [pesquisa, setPesquisa] = useState("");
<<<<<<< HEAD
=======
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState("");
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
  const [ordemSelecionada, setOrdemSelecionada] = useState("nome");

  useEffect(() => {
    async function carregarFuncionarios() {
      try {
        setLoading(true);
        setErro("");

        const response = await api.get("/funcionarios/");
        const dados = Array.isArray(response.data) ? response.data : [];

        const funcionariosFormatados = dados.map((item) => ({
<<<<<<< HEAD
          pes_id: item.pes_id,
          col_pessoa: item.col_pessoa,
          nome: item.nome || "FUNCIONÁRIO SEM NOME",
          cargo_oficial: item.cargo_oficial || "Não informado",
          departamento_nome: item.departamento_nome || "Não informado",
=======
          rh_id: item.rh_id,
          col_pessoa: item.col_pessoa,
          nome: item.nome || "FUNCIONÁRIO SEM NOME",
          cargo_rh_nome: item.cargo_rh_nome || "",
          cargo_oficial: item.cargo_oficial || "Não informado",
          departamento_nome: item.departamento_nome || "Não informado",
          periodo: "Período Integral",
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
          status:
            item.status && item.status.trim() !== ""
              ? item.status
              : "Sem status",
        }));

        setFuncionarios(funcionariosFormatados);
      } catch (error) {
        console.error("Erro ao carregar funcionários:", error);
        setErro("Não foi possível carregar os funcionários da API.");
      } finally {
        setLoading(false);
      }
    }

    carregarFuncionarios();
  }, []);

<<<<<<< HEAD
=======
  const departamentos = useMemo(() => {
    const lista = funcionarios.map((funcionario) => funcionario.departamento_nome);
    const unicos = [...new Set(lista)];
    return unicos.sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [funcionarios]);

>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
  const funcionariosFiltradosEOrdenados = useMemo(() => {
    let resultado = [...funcionarios];

    if (pesquisa.trim() !== "") {
      const texto = pesquisa.toLowerCase();

      resultado = resultado.filter((funcionario) => {
        const nome = String(funcionario.nome || "").toLowerCase();
        const idErp = String(funcionario.col_pessoa || "").toLowerCase();
<<<<<<< HEAD
        const cargo = String(funcionario.cargo_oficial || "").toLowerCase();
        const status = String(funcionario.status || "").toLowerCase();
=======
        const departamento = String(funcionario.departamento_nome || "").toLowerCase();
        const cargo = String(
          funcionario.cargo_rh_nome || funcionario.cargo_oficial || ""
        ).toLowerCase();
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f

        return (
          nome.includes(texto) ||
          idErp.includes(texto) ||
<<<<<<< HEAD
          cargo.includes(texto) ||
          status.includes(texto)
=======
          departamento.includes(texto) ||
          cargo.includes(texto)
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
        );
      });
    }

<<<<<<< HEAD
=======
    if (departamentoSelecionado !== "") {
      resultado = resultado.filter(
        (funcionario) => funcionario.departamento_nome === departamentoSelecionado
      );
    }

>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
    if (ordemSelecionada === "nome") {
      resultado.sort((a, b) =>
        String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR")
      );
    }

    if (ordemSelecionada === "idErp") {
      resultado.sort(
        (a, b) => Number(a.col_pessoa || 0) - Number(b.col_pessoa || 0)
      );
    }

    return resultado;
<<<<<<< HEAD
  }, [funcionarios, pesquisa, ordemSelecionada]);

  return (
    <div className="dashboard-page">
      <Topbar 
      titulo="Funcionários" 
      caminho="Dashboard / Funcionários" onToggleSidebar={onToggleSidebar}
      isMobileOrTablet={isMobileOrTablet} />
=======
  }, [funcionarios, pesquisa, departamentoSelecionado, ordemSelecionada]);

  return (
    <div className="dashboard-page">
      <Topbar titulo="Funcionários" caminho="Dashboard / Funcionários" />
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f

      <div className="funcionarios-toolbar">
        <div className="funcionarios-toolbar-left">
          <input
            type="text"
<<<<<<< HEAD
            placeholder="Pesquisar funcionário"
=======
            placeholder="Pesquisa"
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
            className="funcionarios-search"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
<<<<<<< HEAD
=======

          <select
            className="funcionarios-select"
            value={departamentoSelecionado}
            onChange={(e) => setDepartamentoSelecionado(e.target.value)}
          >
            <option value="">Todos os departamentos</option>
            {departamentos.map((departamento) => (
              <option key={departamento} value={departamento}>
                {departamento}
              </option>
            ))}
          </select>

          <button className="funcionarios-filter-button" type="button">
            Setores
          </button>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
        </div>

        <div className="funcionarios-toolbar-right">
          <div className="funcionarios-ordem-box">
            <span>Ordem:</span>
            <select
              className="funcionarios-select"
              value={ordemSelecionada}
              onChange={(e) => setOrdemSelecionada(e.target.value)}
            >
              <option value="nome">Nome</option>
              <option value="idErp">ID ERP</option>
            </select>
          </div>
<<<<<<< HEAD
=======

          <button className="funcionarios-novo-vinculo" type="button">
            Novo vínculo
          </button>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
        </div>
      </div>

      {loading && (
        <div className="funcionarios-mensagem">
          Carregando funcionários...
        </div>
      )}

      {!loading && erro && (
        <div className="funcionarios-mensagem erro">
          {erro}
        </div>
      )}

      {!loading && !erro && funcionariosFiltradosEOrdenados.length === 0 && (
        <div className="funcionarios-mensagem">
          Nenhum funcionário encontrado.
        </div>
      )}

      {!loading && !erro && funcionariosFiltradosEOrdenados.length > 0 && (
        <>
          <div className="funcionarios-grid">
            {funcionariosFiltradosEOrdenados.map((funcionario) => (
              <FuncionarioCard
<<<<<<< HEAD
                key={funcionario.col_pessoa}
=======
                key={funcionario.rh_id}
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
                funcionario={funcionario}
              />
            ))}
          </div>

          <div className="funcionarios-footer">
            <div className="funcionarios-resultados">
              Mostrando {funcionariosFiltradosEOrdenados.length} resultado(s)
            </div>
<<<<<<< HEAD
=======

            <div className="funcionarios-paginacao">
              <button className="pagina-btn" type="button">
                ‹
              </button>
              <button className="pagina-btn active" type="button">
                1
              </button>
              <button className="pagina-btn" type="button">
                ›
              </button>
            </div>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
          </div>
        </>
      )}
    </div>
  );
}

export default Funcionarios;