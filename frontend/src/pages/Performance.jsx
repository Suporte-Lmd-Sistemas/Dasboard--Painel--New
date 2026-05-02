import { useEffect, useMemo, useState } from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
=======
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
import Topbar from "../components/Topbar";
import api from "../services/api";
import "../styles/dashboard.css";
import "../styles/topbar.css";
<<<<<<< HEAD
import "../styles/performance.css";

function obterDataHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function obterPrimeiroDiaMesAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}-01`;
}

function formatarNumero(valor) {
  return Number(valor || 0).toLocaleString("pt-BR");
}

function calcularPercentual(valor, total) {
  if (!total) return 0;
  return Number(((Number(valor || 0) / Number(total || 0)) * 100).toFixed(1));
}

function classeKpiPorChave(chave) {
  if (chave === "total") return "kpi-total";
  if (chave === "inclusoes") return "kpi-inclusao";
  if (chave === "alteracoes") return "kpi-alteracao";
  if (chave === "exclusoes") return "kpi-exclusao";
  return "kpi-cancelamento";
}

function corDistribuicao(chave) {
  if (chave === "inclusoes") return "#16a34a";
  if (chave === "alteracoes") return "#f59e0b";
  if (chave === "exclusoes") return "#dc2626";
  return "#7c3aed";
}

function Performance({ onToggleSidebar, isMobileOrTablet }) {
  const navigate = useNavigate();

  const hoje = obterDataHoje();
  const primeiroDiaMesAtual = obterPrimeiroDiaMesAtual();

  const [filtroAcao, setFiltroAcao] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const [dataInicial, setDataInicial] = useState(primeiroDiaMesAtual);
  const [dataFinal, setDataFinal] = useState(hoje);
  const [buscaRapida, setBuscaRapida] = useState("");
  const [filtroResumoAtivo, setFiltroResumoAtivo] = useState("total");
=======

function Performance() {
  const [filtroAcao, setFiltroAcao] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f

  const [departamentos, setDepartamentos] = useState([]);
  const [dadosPerformance, setDadosPerformance] = useState({
    resumo: {
      total: 0,
      inclusoes: 0,
      alteracoes: 0,
      exclusoes: 0,
      cancelamentos: 0,
    },
    produtividade: {
      dias_com_atividade: 0,
      media_por_dia: 0,
      hora_mais_ativa: "-",
      tabela_mais_movimentada: "-",
    },
    acoes_por_dia: [],
    acoes_por_horario: [],
    ranking_funcionarios: [],
    tabela_resumo: [],
    registros: [],
  });

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const maiorDia = useMemo(() => {
    if (!dadosPerformance.acoes_por_dia.length) return 1;
<<<<<<< HEAD
    return Math.max(
      ...dadosPerformance.acoes_por_dia.map((item) => Number(item.total || 0))
    );
=======
    return Math.max(...dadosPerformance.acoes_por_dia.map((item) => item.total));
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
  }, [dadosPerformance.acoes_por_dia]);

  const maiorHora = useMemo(() => {
    if (!dadosPerformance.acoes_por_horario.length) return 1;
<<<<<<< HEAD
    return Math.max(
      ...dadosPerformance.acoes_por_horario.map((item) => Number(item.total || 0))
    );
=======
    return Math.max(...dadosPerformance.acoes_por_horario.map((item) => item.total));
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
  }, [dadosPerformance.acoes_por_horario]);

  const maiorRanking = useMemo(() => {
    if (!dadosPerformance.ranking_funcionarios.length) return 1;
<<<<<<< HEAD
    return Math.max(
      ...dadosPerformance.ranking_funcionarios.map((item) =>
        Number(item.total || 0)
      )
    );
  }, [dadosPerformance.ranking_funcionarios]);

  const distribuicaoAcoes = useMemo(() => {
    const total = Number(dadosPerformance.resumo.total || 0);

    return [
      {
        key: "inclusoes",
        label: "Inclusões",
        valor: Number(dadosPerformance.resumo.inclusoes || 0),
        percentual: calcularPercentual(dadosPerformance.resumo.inclusoes, total),
      },
      {
        key: "alteracoes",
        label: "Alterações",
        valor: Number(dadosPerformance.resumo.alteracoes || 0),
        percentual: calcularPercentual(dadosPerformance.resumo.alteracoes, total),
      },
      {
        key: "exclusoes",
        label: "Exclusões",
        valor: Number(dadosPerformance.resumo.exclusoes || 0),
        percentual: calcularPercentual(dadosPerformance.resumo.exclusoes, total),
      },
      {
        key: "cancelamentos",
        label: "Cancelamentos",
        valor: Number(dadosPerformance.resumo.cancelamentos || 0),
        percentual: calcularPercentual(
          dadosPerformance.resumo.cancelamentos,
          total
        ),
=======
    return Math.max(...dadosPerformance.ranking_funcionarios.map((item) => item.total));
  }, [dadosPerformance.ranking_funcionarios]);

  const distribuicaoAcoes = useMemo(() => {
    const total = dadosPerformance.resumo.total || 0;

    if (total === 0) {
      return [
        { label: "Inclusões", valor: 0, percentual: 0, classe: "dist-green" },
        { label: "Alterações", valor: 0, percentual: 0, classe: "dist-yellow" },
        { label: "Exclusões", valor: 0, percentual: 0, classe: "dist-red" },
        { label: "Cancelamentos", valor: 0, percentual: 0, classe: "dist-purple" },
      ];
    }

    return [
      {
        label: "Inclusões",
        valor: dadosPerformance.resumo.inclusoes,
        percentual: ((dadosPerformance.resumo.inclusoes / total) * 100).toFixed(1),
        classe: "dist-green",
      },
      {
        label: "Alterações",
        valor: dadosPerformance.resumo.alteracoes,
        percentual: ((dadosPerformance.resumo.alteracoes / total) * 100).toFixed(1),
        classe: "dist-yellow",
      },
      {
        label: "Exclusões",
        valor: dadosPerformance.resumo.exclusoes,
        percentual: ((dadosPerformance.resumo.exclusoes / total) * 100).toFixed(1),
        classe: "dist-red",
      },
      {
        label: "Cancelamentos",
        valor: dadosPerformance.resumo.cancelamentos,
        percentual: ((dadosPerformance.resumo.cancelamentos / total) * 100).toFixed(1),
        classe: "dist-purple",
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
      },
    ];
  }, [dadosPerformance.resumo]);

  const leituraExecutiva = useMemo(() => {
    const resumo = dadosPerformance.resumo;
    const produtividade = dadosPerformance.produtividade;

<<<<<<< HEAD
    const mapa = [
      { nome: "Inclusões", valor: Number(resumo.inclusoes || 0) },
      { nome: "Alterações", valor: Number(resumo.alteracoes || 0) },
      { nome: "Exclusões", valor: Number(resumo.exclusoes || 0) },
      { nome: "Cancelamentos", valor: Number(resumo.cancelamentos || 0) },
    ].sort((a, b) => b.valor - a.valor);

    const tipoPredominante =
      mapa[0] && mapa[0].valor > 0 ? mapa[0].nome : "Sem predominância";
=======
    let tipoPredominante = "sem predominância";
    const mapa = [
      { nome: "Inclusões", valor: resumo.inclusoes },
      { nome: "Alterações", valor: resumo.alteracoes },
      { nome: "Exclusões", valor: resumo.exclusoes },
      { nome: "Cancelamentos", valor: resumo.cancelamentos },
    ].sort((a, b) => b.valor - a.valor);

    if (mapa[0] && mapa[0].valor > 0) {
      tipoPredominante = mapa[0].nome;
    }
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f

    const topFuncionario =
      dadosPerformance.ranking_funcionarios.length > 0
        ? dadosPerformance.ranking_funcionarios[0]
        : null;

<<<<<<< HEAD
    const total = Number(resumo.total || 0);
    const media = Number(produtividade.media_por_dia || 0);

=======
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
    return {
      tipoPredominante,
      topFuncionario,
      mensagemVolume:
<<<<<<< HEAD
        total > 0
          ? `Foram identificadas ${formatarNumero(total)} ações no período analisado.`
          : "Nenhuma ação foi encontrada no período analisado.",
      mensagemProdutividade:
        Number(produtividade.dias_com_atividade || 0) > 0
          ? `A operação apresentou atividade em ${formatarNumero(
              produtividade.dias_com_atividade
            )} dias, com média de ${formatarNumero(media)} ações por dia.`
=======
        resumo.total > 0
          ? `Foram identificadas ${resumo.total} ações no recorte analisado.`
          : "Nenhuma ação foi encontrada no recorte analisado.",
      mensagemProdutividade:
        produtividade.dias_com_atividade > 0
          ? `A operação apresentou atividade em ${produtividade.dias_com_atividade} dias, com média de ${produtividade.media_por_dia} ações por dia.`
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
          : "Não houve dias com atividade no período filtrado.",
    };
  }, [dadosPerformance]);

<<<<<<< HEAD
  const indicadoresTopo = useMemo(() => {
    const total = Number(dadosPerformance.resumo.total || 0);

    return [
      {
        key: "total",
        titulo: "Total de ações",
        valor: Number(dadosPerformance.resumo.total || 0),
        subtitulo: "Indicador principal do painel",
      },
      {
        key: "inclusoes",
        titulo: "Inclusões",
        valor: Number(dadosPerformance.resumo.inclusoes || 0),
        subtitulo: `${calcularPercentual(
          dadosPerformance.resumo.inclusoes,
          total
        )}% do total`,
      },
      {
        key: "alteracoes",
        titulo: "Alterações",
        valor: Number(dadosPerformance.resumo.alteracoes || 0),
        subtitulo: `${calcularPercentual(
          dadosPerformance.resumo.alteracoes,
          total
        )}% do total`,
      },
      {
        key: "exclusoes",
        titulo: "Exclusões",
        valor: Number(dadosPerformance.resumo.exclusoes || 0),
        subtitulo: `${calcularPercentual(
          dadosPerformance.resumo.exclusoes,
          total
        )}% do total`,
      },
      {
        key: "cancelamentos",
        titulo: "Cancelamentos",
        valor: Number(dadosPerformance.resumo.cancelamentos || 0),
        subtitulo: `${calcularPercentual(
          dadosPerformance.resumo.cancelamentos,
          total
        )}% do total`,
      },
    ];
  }, [dadosPerformance.resumo]);

  const rankingFiltrado = useMemo(() => {
    const texto = String(buscaRapida || "").trim().toLowerCase();
    const base = Array.isArray(dadosPerformance.ranking_funcionarios)
      ? dadosPerformance.ranking_funcionarios
      : [];

    const filtradoPorResumo =
      filtroResumoAtivo === "total"
        ? base
        : base.filter((item) => {
            if (filtroResumoAtivo === "inclusoes") {
              return Number(item.inclusoes || 0) > 0;
            }
            if (filtroResumoAtivo === "alteracoes") {
              return Number(item.alteracoes || 0) > 0;
            }
            if (filtroResumoAtivo === "exclusoes") {
              return Number(item.exclusoes || 0) > 0;
            }
            if (filtroResumoAtivo === "cancelamentos") {
              return Number(item.cancelamentos || 0) > 0;
            }
            return true;
          });

    if (!texto) return filtradoPorResumo;

    return filtradoPorResumo.filter((item) => {
      const nome = String(item.nome || "").toLowerCase();
      const departamento = String(item.departamento || "").toLowerCase();
      return nome.includes(texto) || departamento.includes(texto);
    });
  }, [dadosPerformance.ranking_funcionarios, buscaRapida, filtroResumoAtivo]);

  const tabelaResumoFiltrada = useMemo(() => {
    const texto = String(buscaRapida || "").trim().toLowerCase();
    const base = Array.isArray(dadosPerformance.tabela_resumo)
      ? dadosPerformance.tabela_resumo
      : [];

    const filtradoPorResumo =
      filtroResumoAtivo === "total"
        ? base
        : base.filter((item) => {
            if (filtroResumoAtivo === "inclusoes") {
              return Number(item.inclusoes || 0) > 0;
            }
            if (filtroResumoAtivo === "alteracoes") {
              return Number(item.alteracoes || 0) > 0;
            }
            if (filtroResumoAtivo === "exclusoes") {
              return Number(item.exclusoes || 0) > 0;
            }
            if (filtroResumoAtivo === "cancelamentos") {
              return Number(item.cancelamentos || 0) > 0;
            }
            return true;
          });

    if (!texto) return filtradoPorResumo;

    return filtradoPorResumo.filter((item) => {
      const funcionario = String(item.funcionario || "").toLowerCase();
      const departamento = String(item.departamento || "").toLowerCase();
      return funcionario.includes(texto) || departamento.includes(texto);
    });
  }, [dadosPerformance.tabela_resumo, buscaRapida, filtroResumoAtivo]);

  const rankingTop10 = useMemo(() => {
    return rankingFiltrado.slice(0, 10);
  }, [rankingFiltrado]);

  async function carregarDepartamentos() {
    try {
      const response = await api.get("/departamentos/");
      setDepartamentos(Array.isArray(response.data) ? response.data : []);
=======
  async function carregarDepartamentos() {
    try {
      const response = await api.get("/departamentos/");
      setDepartamentos(response.data || []);
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
    } catch (error) {
      console.error("Erro ao carregar departamentos:", error);
    }
  }

  async function carregarPerformance() {
    try {
      setCarregando(true);
      setErro("");

      const params = {};

<<<<<<< HEAD
      if (filtroAcao) params.acao = filtroAcao;
      if (filtroDepartamento) params.departamento_id = filtroDepartamento;
      if (dataInicial) params.data_inicial = dataInicial;
      if (dataFinal) params.data_final = dataFinal;
=======
      if (filtroAcao) {
        params.acao = filtroAcao;
      }

      if (filtroDepartamento) {
        params.departamento_id = filtroDepartamento;
      }

      if (dataInicial) {
        params.data_inicial = dataInicial;
      }

      if (dataFinal) {
        params.data_final = dataFinal;
      }
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f

      const response = await api.get("/performance/visao-geral", { params });

      setDadosPerformance({
        resumo: response.data?.resumo || {
          total: 0,
          inclusoes: 0,
          alteracoes: 0,
          exclusoes: 0,
          cancelamentos: 0,
        },
        produtividade: response.data?.produtividade || {
          dias_com_atividade: 0,
          media_por_dia: 0,
          hora_mais_ativa: "-",
          tabela_mais_movimentada: "-",
        },
<<<<<<< HEAD
        acoes_por_dia: Array.isArray(response.data?.acoes_por_dia)
          ? response.data.acoes_por_dia
          : [],
        acoes_por_horario: Array.isArray(response.data?.acoes_por_horario)
          ? response.data.acoes_por_horario
          : [],
        ranking_funcionarios: Array.isArray(response.data?.ranking_funcionarios)
          ? response.data.ranking_funcionarios
          : [],
        tabela_resumo: Array.isArray(response.data?.tabela_resumo)
          ? response.data.tabela_resumo
          : [],
        registros: [],
=======
        acoes_por_dia: response.data?.acoes_por_dia || [],
        acoes_por_horario: response.data?.acoes_por_horario || [],
        ranking_funcionarios: response.data?.ranking_funcionarios || [],
        tabela_resumo: response.data?.tabela_resumo || [],
        registros: response.data?.registros || [],
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
      });
    } catch (error) {
      console.error("Erro ao carregar performance:", error);
      setErro("Não foi possível carregar os dados de performance.");
      setDadosPerformance({
        resumo: {
          total: 0,
          inclusoes: 0,
          alteracoes: 0,
          exclusoes: 0,
          cancelamentos: 0,
        },
        produtividade: {
          dias_com_atividade: 0,
          media_por_dia: 0,
          hora_mais_ativa: "-",
          tabela_mais_movimentada: "-",
        },
        acoes_por_dia: [],
        acoes_por_horario: [],
        ranking_funcionarios: [],
        tabela_resumo: [],
        registros: [],
      });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDepartamentos();
  }, []);

  useEffect(() => {
    carregarPerformance();
<<<<<<< HEAD
  }, []);
=======
  }, [filtroAcao, filtroDepartamento, dataInicial, dataFinal]);
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f

  function limparFiltros() {
    setFiltroAcao("");
    setFiltroDepartamento("");
<<<<<<< HEAD
    setDataInicial(primeiroDiaMesAtual);
    setDataFinal(hoje);
    setBuscaRapida("");
    setFiltroResumoAtivo("total");
    setErro("");
  }

  function aplicarFiltros() {
    setErro("");

    if (dataInicial && !/^\d{4}-\d{2}-\d{2}$/.test(dataInicial)) {
      setErro("A data inicial está inválida.");
      return;
    }

    if (dataFinal && !/^\d{4}-\d{2}-\d{2}$/.test(dataFinal)) {
      setErro("A data final está inválida.");
      return;
    }

    if (dataInicial && dataFinal && dataFinal < dataInicial) {
      setErro("A data final não pode ser menor que a data inicial.");
      return;
    }

    carregarPerformance();
  }

 function lidarCliqueCard(itemKey) {
  setFiltroResumoAtivo(itemKey);

  if (itemKey === "inclusoes") {
    navigate("/performance/inclusoes");
    return;
  }

  if (itemKey === "alteracoes") {
    navigate("/performance/alteracoes");
    return;
  }

  if (itemKey === "exclusoes") {
    navigate("/performance/exclusoes");
    return;
  }

  if (itemKey === "cancelamentos") {
    navigate("/performance/cancelamentos");
  }
}
  return (
    <div className="dashboard-page performance-page">
      <Topbar titulo="Performance" caminho="Performance" onToggleSidebar={onToggleSidebar}
        isMobileOrTablet={isMobileOrTablet} />

      <section className="performance-hero">
        <div className="performance-hero-content">
          <span className="performance-eyebrow">Painel gerencial</span>
          <h1 className="performance-title">Performance operacional</h1>
          <p className="performance-subtitle">
            Visão consolidada do mês atual com volume, tendência, distribuição,
            ranking e resumo executivo da operação.
          </p>
        </div>

        <div className="performance-hero-mini-grid">
          <div className="mini-stat-card">
            <span>Total monitorado</span>
            <strong>{formatarNumero(dadosPerformance.resumo.total)}</strong>
=======
    setDataInicial("");
    setDataFinal("");
  }

  return (
    <div className="dashboard-page performance-page">
      <Topbar titulo="Performance" caminho="Performance" />

      <div className="performance-header-clean">
        <div className="performance-header-text">
        
          <p>
            Acompanhe volume, produtividade, distribuição das ações e leitura
            gerencial da operação em um painel analítico mais visual.
          </p>
        </div>

        <div className="performance-header-stats">
          <div className="mini-stat-card">
            <span>Total monitorado</span>
            <strong>{dadosPerformance.resumo.total}</strong>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
          </div>

          <div className="mini-stat-card">
            <span>Dias com atividade</span>
<<<<<<< HEAD
            <strong>
              {formatarNumero(dadosPerformance.produtividade.dias_com_atividade)}
            </strong>
=======
            <strong>{dadosPerformance.produtividade.dias_com_atividade}</strong>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
          </div>

          <div className="mini-stat-card">
            <span>Hora mais ativa</span>
            <strong>{dadosPerformance.produtividade.hora_mais_ativa}</strong>
          </div>
<<<<<<< HEAD

          <div className="mini-stat-card">
            <span>Tabela líder</span>
            <strong>
              {dadosPerformance.produtividade.tabela_mais_movimentada || "-"}
            </strong>
          </div>
        </div>
      </section>

      <section className="performance-panel">
        <div className="performance-panel-top">
          <div>
            <h3>Filtros de análise</h3>
            <p>Por padrão, o painel abre sempre com o mês atual.</p>
          </div>

          <button
            className="btn-refresh"
            onClick={aplicarFiltros}
            type="button"
            disabled={carregando}
          >
            {carregando ? "Atualizando..." : "Atualizar painel"}
          </button>
        </div>

        <div className="performance-filters-grid">
          <div className="performance-filter-group">
            <label>Tipo de ação</label>
            <select
              value={filtroAcao}
              onChange={(e) => setFiltroAcao(e.target.value)}
            >
=======
        </div>
      </div>

      <div className="chart-box filter-panel">
        <div className="box-header-with-action">
          <h3>Filtros de análise</h3>

          <button className="btn-refresh" onClick={carregarPerformance} type="button">
            Atualizar painel
          </button>
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>Tipo de ação</label>
            <select value={filtroAcao} onChange={(e) => setFiltroAcao(e.target.value)}>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
              <option value="">Todas</option>
              <option value="I">Inclusão</option>
              <option value="A">Alteração</option>
              <option value="E">Exclusão</option>
              <option value="C">Cancelamento</option>
            </select>
          </div>

<<<<<<< HEAD
          <div className="performance-filter-group">
=======
          <div className="filter-group">
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
            <label>Departamento</label>
            <select
              value={filtroDepartamento}
              onChange={(e) => setFiltroDepartamento(e.target.value)}
            >
              <option value="">Todos</option>
<<<<<<< HEAD
=======

>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
              {departamentos.map((departamento) => (
                <option key={departamento.id} value={departamento.id}>
                  {departamento.nome}
                </option>
              ))}
            </select>
          </div>

<<<<<<< HEAD
          <div className="performance-filter-group">
=======
          <div className="filter-group">
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
            <label>Data inicial</label>
            <input
              type="date"
              value={dataInicial}
<<<<<<< HEAD
              onChange={(e) =>
                setDataInicial(String(e.target.value || "").slice(0, 10))
              }
            />
          </div>

          <div className="performance-filter-group">
=======
              onChange={(e) => setDataInicial(e.target.value)}
            />
          </div>

          <div className="filter-group">
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
            <label>Data final</label>
            <input
              type="date"
              value={dataFinal}
<<<<<<< HEAD
              onChange={(e) =>
                setDataFinal(String(e.target.value || "").slice(0, 10))
              }
            />
          </div>

          <div className="performance-filter-group">
            <label>Busca rápida</label>
            <input
              type="text"
              placeholder="Nome ou departamento"
              value={buscaRapida}
              onChange={(e) => setBuscaRapida(e.target.value)}
            />
          </div>

          <div className="performance-filter-actions">
=======
              onChange={(e) => setDataFinal(e.target.value)}
            />
          </div>

          <div className="filter-actions">
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
            <button className="btn-clear" onClick={limparFiltros} type="button">
              Limpar filtros
            </button>
          </div>
        </div>

        {carregando && (
<<<<<<< HEAD
          <div className="performance-status info-message">
=======
          <div className="status-message info-message">
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
            Carregando dados de performance...
          </div>
        )}

        {erro && !carregando && (
<<<<<<< HEAD
          <div className="performance-status error-message">{erro}</div>
        )}
      </section>

      <section className="performance-kpi-grid">
        {indicadoresTopo.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => lidarCliqueCard(item.key)}
            className={`performance-kpi-card ${classeKpiPorChave(item.key)} ${
              filtroResumoAtivo === item.key ? "performance-kpi-card-active" : ""
            }`}
          >
            <h3>{item.titulo}</h3>
            <p>{formatarNumero(item.valor)}</p>
            <span>{item.subtitulo}</span>
          </button>
        ))}
      </section>

      <section className="performance-kpi-secondary-grid">
        <div className="performance-soft-card">
          <h3>Dias com atividade</h3>
          <p>{formatarNumero(dadosPerformance.produtividade.dias_com_atividade)}</p>
          <span>Quantidade de dias com movimentação</span>
        </div>

        <div className="performance-soft-card">
          <h3>Média por dia</h3>
          <p>{formatarNumero(dadosPerformance.produtividade.media_por_dia)}</p>
          <span>Média de ações por dia com atividade</span>
        </div>

        <div className="performance-soft-card">
          <h3>Hora mais ativa</h3>
          <p>{dadosPerformance.produtividade.hora_mais_ativa}</p>
          <span>Faixa com maior concentração de ações</span>
        </div>

        <div className="performance-soft-card">
          <h3>Tabela mais movimentada</h3>
          <p className="performance-soft-card-text">
            {dadosPerformance.produtividade.tabela_mais_movimentada || "-"}
          </p>
          <span>Maior incidência operacional no período</span>
        </div>
      </section>

      <section className="performance-main-grid">
        <div className="performance-box performance-box-large">
          <div className="performance-section-title">
=======
          <div className="status-message error-message">{erro}</div>
        )}
      </div>

      <div className="cards-grid cards-grid-5">
        <div className="card-kpi card-kpi-premium">
          <h3>Total de ações</h3>
          <p>{dadosPerformance.resumo.total}</p>
          <span>Indicador principal do painel</span>
        </div>

        <div className="card-kpi card-kpi-success">
          <h3>Inclusões</h3>
          <p>{dadosPerformance.resumo.inclusoes}</p>
          <span>Registros incluídos</span>
        </div>

        <div className="card-kpi card-kpi-warning">
          <h3>Alterações</h3>
          <p>{dadosPerformance.resumo.alteracoes}</p>
          <span>Atualizações realizadas</span>
        </div>

        <div className="card-kpi card-kpi-danger">
          <h3>Exclusões</h3>
          <p>{dadosPerformance.resumo.exclusoes}</p>
          <span>Registros excluídos</span>
        </div>

        <div className="card-kpi card-kpi-purple">
          <h3>Cancelamentos</h3>
          <p>{dadosPerformance.resumo.cancelamentos}</p>
          <span>Ações canceladas</span>
        </div>
      </div>

      <div className="cards-grid">
        <div className="card-kpi card-kpi-soft">
          <h3>Dias com atividade</h3>
          <p>{dadosPerformance.produtividade.dias_com_atividade}</p>
          <span>Quantidade de dias com movimentação</span>
        </div>

        <div className="card-kpi card-kpi-soft">
          <h3>Média por dia</h3>
          <p>{dadosPerformance.produtividade.media_por_dia}</p>
          <span>Média de ações por dia com atividade</span>
        </div>

        <div className="card-kpi card-kpi-soft">
          <h3>Hora mais ativa</h3>
          <p>{dadosPerformance.produtividade.hora_mais_ativa}</p>
          <span>Faixa com maior concentração</span>
        </div>

        <div className="card-kpi card-kpi-soft">
          <h3>Tabela mais movimentada</h3>
          <p className="card-kpi-text">
            {dadosPerformance.produtividade.tabela_mais_movimentada}
          </p>
          <span>Maior incidência operacional</span>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="chart-box large premium-box">
          <div className="section-title-row">
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
            <div>
              <h3>Evolução das ações por dia</h3>
              <p>Tendência diária da movimentação operacional</p>
            </div>
          </div>

          {dadosPerformance.acoes_por_dia.length === 0 ? (
<<<<<<< HEAD
            <div className="performance-empty-state">
              Nenhum dado encontrado com os filtros aplicados.
            </div>
          ) : (
            <div className="performance-chart-scroll">
              <div className="performance-chart-bars performance-chart-bars-tall">
                {dadosPerformance.acoes_por_dia.map((item) => {
                  const valor = Number(item.total || 0);
                  const altura =
                    maiorDia > 0 ? Math.max(18, (valor / maiorDia) * 220) : 18;

                  return (
                    <div
                      className="performance-bar-column"
                      key={item.data_iso || item.dia}
                      title={`${item.dia} - ${formatarNumero(valor)} ações`}
                    >
                      <div className="performance-bar-value">
                        {formatarNumero(valor)}
                      </div>
                      <div
                        className="performance-bar performance-bar-primary"
                        style={{ height: `${altura}px` }}
                      />
                      <div className="performance-bar-label">{item.dia}</div>
                    </div>
                  );
                })}
              </div>
=======
            <div className="empty-state">
              Nenhum dado encontrado com os filtros aplicados.
            </div>
          ) : (
            <div className="simple-chart chart-tall">
              {dadosPerformance.acoes_por_dia.map((item) => (
                <div className="simple-bar-item" key={item.data_iso || item.dia}>
                  <div
                    className="simple-bar premium-bar"
                    style={{ height: `${(item.total / maiorDia) * 220}px` }}
                    title={`${item.dia} - ${item.total} ações`}
                  ></div>
                  <span>{item.dia}</span>
                </div>
              ))}
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
            </div>
          )}
        </div>

<<<<<<< HEAD
        <div className="performance-box">
          <div className="performance-section-title">
            <div>
              <h3>Distribuição por tipo</h3>
              <p>Participação percentual no volume total</p>
            </div>
          </div>

          <div className="performance-distribution-list">
            {distribuicaoAcoes.map((item) => (
              <div className="performance-distribution-item" key={item.key}>
                <div className="performance-distribution-header">
=======
        <div className="chart-box premium-box">
          <div className="section-title-row">
            <div>
              <h3>Distribuição por tipo de ação</h3>
              <p>Participação percentual dentro do volume total</p>
            </div>
          </div>

          <div className="distribution-list">
            {distribuicaoAcoes.map((item) => (
              <div className="distribution-item" key={item.label}>
                <div className="distribution-header">
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
                  <span>{item.label}</span>
                  <strong>{item.percentual}%</strong>
                </div>

<<<<<<< HEAD
                <div className="performance-distribution-track">
                  <div
                    className="performance-distribution-fill"
                    style={{
                      width: `${item.percentual}%`,
                      background: corDistribuicao(item.key),
                    }}
                  />
                </div>

                <small>{formatarNumero(item.valor)} registros</small>
=======
                <div className="distribution-bar-track">
                  <div
                    className={`distribution-bar-fill ${item.classe}`}
                    style={{ width: `${item.percentual}%` }}
                  ></div>
                </div>

                <small>{item.valor} registros</small>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
              </div>
            ))}
          </div>
        </div>
<<<<<<< HEAD
      </section>

      <section className="performance-two-columns">
        <div className="performance-box">
          <div className="performance-section-title">
=======
      </div>

      <div className="two-columns">
        <div className="chart-box premium-box">
          <div className="section-title-row">
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
            <div>
              <h3>Concentração por horário</h3>
              <p>Distribuição das ações ao longo do expediente</p>
            </div>
          </div>

          {dadosPerformance.acoes_por_horario.length === 0 ? (
<<<<<<< HEAD
            <div className="performance-empty-state">
              Nenhum dado encontrado com os filtros aplicados.
            </div>
          ) : (
            <div className="performance-chart-scroll">
              <div className="performance-chart-bars">
                {dadosPerformance.acoes_por_horario.map((item) => {
                  const valor = Number(item.total || 0);
                  const altura =
                    maiorHora > 0 ? Math.max(18, (valor / maiorHora) * 180) : 18;

                  return (
                    <div
                      className="performance-bar-column"
                      key={item.hora}
                      title={`${item.hora} - ${formatarNumero(valor)} ações`}
                    >
                      <div className="performance-bar-value">
                        {formatarNumero(valor)}
                      </div>
                      <div
                        className="performance-bar performance-bar-secondary"
                        style={{ height: `${altura}px` }}
                      />
                      <div className="performance-bar-label">{item.hora}</div>
                    </div>
                  );
                })}
              </div>
=======
            <div className="empty-state">
              Nenhum dado encontrado com os filtros aplicados.
            </div>
          ) : (
            <div className="simple-chart">
              {dadosPerformance.acoes_por_horario.map((item) => (
                <div className="simple-bar-item" key={item.hora}>
                  <div
                    className="simple-bar premium-bar"
                    style={{ height: `${(item.total / maiorHora) * 180}px` }}
                    title={`${item.hora} - ${item.total} ações`}
                  ></div>
                  <span>{item.hora}</span>
                </div>
              ))}
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
            </div>
          )}
        </div>

<<<<<<< HEAD
        <div className="performance-box">
          <div className="performance-section-title">
=======
        <div className="chart-box premium-box">
          <div className="section-title-row">
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
            <div>
              <h3>Leitura executiva</h3>
              <p>Resumo analítico para leitura gerencial rápida</p>
            </div>
          </div>

<<<<<<< HEAD
          <div className="performance-executive-grid">
            <div className="performance-executive-card">
=======
          <div className="executive-insights">
            <div className="executive-insight-card">
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
              <span>Volume operacional</span>
              <strong>{leituraExecutiva.mensagemVolume}</strong>
            </div>

<<<<<<< HEAD
            <div className="performance-executive-card">
=======
            <div className="executive-insight-card">
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
              <span>Produtividade</span>
              <strong>{leituraExecutiva.mensagemProdutividade}</strong>
            </div>

<<<<<<< HEAD
            <div className="performance-executive-card">
=======
            <div className="executive-insight-card">
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
              <span>Tipo predominante</span>
              <strong>{leituraExecutiva.tipoPredominante}</strong>
            </div>

<<<<<<< HEAD
            <div className="performance-executive-card">
              <span>Destaque do período</span>
              <strong>
                {leituraExecutiva.topFuncionario
                  ? `${leituraExecutiva.topFuncionario.nome} lidera com ${formatarNumero(
                      leituraExecutiva.topFuncionario.total
                    )} ações.`
=======
            <div className="executive-insight-card">
              <span>Destaque do período</span>
              <strong>
                {leituraExecutiva.topFuncionario
                  ? `${leituraExecutiva.topFuncionario.nome} lidera com ${leituraExecutiva.topFuncionario.total} ações.`
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
                  : "Sem colaborador de destaque no recorte atual."}
              </strong>
            </div>
          </div>
        </div>
<<<<<<< HEAD
      </section>

      <section className="performance-two-columns">
        <div className="performance-box">
          <div className="performance-section-title">
            <div>
              <h3>Top 10 colaboradores</h3>
              <p>Comparativo visual do volume por colaborador</p>
            </div>
          </div>

          {rankingTop10.length === 0 ? (
            <div className="performance-empty-state">
              Nenhum funcionário encontrado com os filtros aplicados.
            </div>
          ) : (
            <div className="performance-ranking-list">
              {rankingTop10.map((item, index) => (
                <div className="performance-ranking-item" key={`${item.nome}-${index}`}>
                  <div className="performance-ranking-top">
=======
      </div>

      <div className="two-columns">
        <div className="chart-box premium-box">
          <div className="section-title-row">
            <div>
              <h3>Ranking de colaboradores</h3>
              <p>Comparativo visual de volume por colaborador</p>
            </div>
          </div>

          {dadosPerformance.ranking_funcionarios.length === 0 ? (
            <div className="empty-state">
              Nenhum funcionário encontrado com os filtros aplicados.
            </div>
          ) : (
            <div className="ranking-visual-list">
              {dadosPerformance.ranking_funcionarios.map((item, index) => (
                <div className="ranking-visual-item" key={`${item.nome}-${index}`}>
                  <div className="ranking-visual-top">
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
                    <div>
                      <strong>{item.nome}</strong>
                      <span>{item.departamento || "-"}</span>
                    </div>
<<<<<<< HEAD
                    <div className="performance-ranking-value">
                      {formatarNumero(item.total)} ações
                    </div>
                  </div>

                  <div className="performance-ranking-track">
                    <div
                      className="performance-ranking-fill"
                      style={{
                        width: `${Math.max(
                          2,
                          (Number(item.total || 0) / maiorRanking) * 100
                        )}%`,
                      }}
                    />
=======
                    <div className="ranking-value">{item.total} ações</div>
                  </div>

                  <div className="ranking-bar-track">
                    <div
                      className="ranking-bar-fill"
                      style={{ width: `${(item.total / maiorRanking) * 100}%` }}
                    ></div>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

<<<<<<< HEAD
        <div className="performance-box">
          <div className="performance-section-title">
=======
        <div className="chart-box premium-box">
          <div className="section-title-row">
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
            <div>
              <h3>Resumo consolidado por colaborador</h3>
              <p>Visão executiva dos indicadores individuais</p>
            </div>
          </div>

<<<<<<< HEAD
          {tabelaResumoFiltrada.length === 0 ? (
            <div className="performance-empty-state">
              Nenhum dado encontrado para montar a tabela.
            </div>
          ) : (
            <div className="performance-table-wrapper">
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Funcionário</th>
=======
          {dadosPerformance.tabela_resumo.length === 0 ? (
            <div className="empty-state">
              Nenhum dado encontrado para montar a tabela.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table premium-table">
                <thead>
                  <tr>
                    <th>Funcionário</th>
                    <th>Departamento</th>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
                    <th>Total</th>
                    <th>Inclusões</th>
                    <th>Alterações</th>
                    <th>Exclusões</th>
                    <th>Cancelamentos</th>
                  </tr>
                </thead>

                <tbody>
<<<<<<< HEAD
                  {tabelaResumoFiltrada.map((item) => (
                    <tr key={`${item.funcionario}-${item.departamento || "-"}`}>
                      <td>{item.funcionario}</td>
                      <td>{formatarNumero(item.acoes)}</td>
                      <td>{formatarNumero(item.inclusoes)}</td>
                      <td>{formatarNumero(item.alteracoes)}</td>
                      <td>{formatarNumero(item.exclusoes)}</td>
                      <td>{formatarNumero(item.cancelamentos)}</td>
=======
                  {dadosPerformance.tabela_resumo.map((item) => (
                    <tr key={item.funcionario}>
                      <td>{item.funcionario}</td>
                      <td>{item.departamento || "-"}</td>
                      <td>{item.acoes}</td>
                      <td>{item.inclusoes}</td>
                      <td>{item.alteracoes}</td>
                      <td>{item.exclusoes}</td>
                      <td>{item.cancelamentos}</td>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
<<<<<<< HEAD
      </section>
=======
      </div>
>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
    </div>
  );
}

export default Performance;