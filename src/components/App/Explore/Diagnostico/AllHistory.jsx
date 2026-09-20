import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { formatDiagnosisName } from "./diagnosisLabels"
import { downloadDiagnosticHistoryReport } from "./diagnosticReportPdf"
import "../../../../styles/App/AllHistory.css"

export default function AllHistory({ onBack }) {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" })
    try {
      const saved = localStorage.getItem("diagnosticHistory")
      if (saved) setHistory(JSON.parse(saved))
    } catch {
      setHistory([])
    }
  }, [])

  const getDisplayName = (item) => formatDiagnosisName(item?.disease || item?.resultado || "Diagnóstico")
  const getConfidence = (item) => Math.max(0, Math.min(100, Math.round(Number(item?.confidence) || 0)))

  const getConfidenceClass = (confidence) => {
    if (confidence >= 80) return "high"
    if (confidence >= 50) return "medium"
    return "low"
  }

  const getConfidenceText = (confidence) => {
    if (confidence >= 80) return "Alta confiança"
    if (confidence >= 50) return "Média confiança"
    return "Baixa confiança"
  }

  const filteredHistory = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return [...history]
      .filter((item) => {
        const confidence = getConfidence(item)
        return (
          (!search || getDisplayName(item).toLowerCase().includes(search)) &&
          (filterType === "all" ||
            (filterType === "high" && confidence >= 80) ||
            (filterType === "medium" && confidence >= 50 && confidence < 80) ||
            (filterType === "low" && confidence < 50))
        )
      })
      .sort((a, b) => {
        if (sortBy === "confidence") return getConfidence(b) - getConfidence(a)
        if (sortBy === "name") return getDisplayName(a).localeCompare(getDisplayName(b))
        return Number(b.id || 0) - Number(a.id || 0)
      })
  }, [filterType, history, searchTerm, sortBy])

  const saveHistory = (updatedHistory) => {
    setHistory(updatedHistory)
    localStorage.setItem("diagnosticHistory", JSON.stringify(updatedHistory))
  }

  const deleteDiagnostic = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este diagnóstico?")) {
      saveHistory(history.filter((item) => item.id !== id))
    }
  }

  const clearAllHistory = () => {
    if (window.confirm("Tem certeza que deseja excluir TODO o histórico? Esta ação não pode ser desfeita.")) {
      saveHistory([])
    }
  }

  const totalDiagnostics = history.length
  const averageConfidence = history.length > 0
    ? Math.round(history.reduce((acc, item) => acc + getConfidence(item), 0) / history.length)
    : 0
  const mostCommonDisease = history.length > 0
    ? Object.entries(history.reduce((acc, item) => {
        const name = getDisplayName(item)
        acc[name] = (acc[name] || 0) + 1
        return acc
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || "Nenhum"
    : "Nenhum"

  const exportHistory = async () => {
    const items = history.map((item) => {
      const confidence = getConfidence(item)
      return {
        name: getDisplayName(item),
        date: item.date || "-",
        confidence,
        confidenceText: getConfidenceText(confidence),
        isBatch: item.type === "batch",
        imageCount: item.imageCount || 0,
        reliableCount: item.reliableCount || 0,
        conditionCount: item.conditionCount || 0,
      }
    })

    try {
      await downloadDiagnosticHistoryReport({
        items,
        totalDiagnostics,
        averageConfidence,
        mostCommonDisease,
      })
    } catch (error) {
      console.error("Não foi possível gerar o relatório de diagnósticos.", error)
      window.alert("Não foi possível gerar o relatório agora. Tente novamente.")
    }
  }

  return (
    <div className="all-history-container">
      <div className="history-header">
        <button className="back-button" onClick={onBack || (() => navigate(-1))} aria-label="Voltar">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1>Histórico de Diagnósticos</h1>
        <div className="header-actions">
          {history.length > 0 && (
            <>
              <button className="export-button" onClick={exportHistory} aria-label="Exportar relatório">
                <span className="material-symbols-outlined">download</span>
              </button>
              <button className="clear-button" onClick={clearAllHistory} aria-label="Limpar histórico">
                <span className="material-symbols-outlined">delete_sweep</span>
              </button>
            </>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="stats-cards">
          <div className="stat-card">
            <span className="material-symbols-outlined">analytics</span>
            <div className="stat-info">
              <strong>{totalDiagnostics}</strong>
              <p>Total de diagnósticos</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="material-symbols-outlined">verified</span>
            <div className="stat-info">
              <strong>{averageConfidence}%</strong>
              <p>Confiança média</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="material-symbols-outlined">eco</span>
            <div className="stat-info">
              <strong>{mostCommonDisease}</strong>
              <p>Mais comum</p>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="filters-section">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Buscar por doença..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="filter-buttons">
            <button aria-pressed={filterType === "all"} className={`filter-btn ${filterType === "all" ? "active" : ""}`} onClick={() => setFilterType("all")}>Todos</button>
            <button aria-pressed={filterType === "high"} className={`filter-btn high ${filterType === "high" ? "active" : ""}`} onClick={() => setFilterType("high")}>Alta confiança</button>
            <button aria-pressed={filterType === "medium"} className={`filter-btn medium ${filterType === "medium" ? "active" : ""}`} onClick={() => setFilterType("medium")}>Média confiança</button>
            <button aria-pressed={filterType === "low"} className={`filter-btn low ${filterType === "low" ? "active" : ""}`} onClick={() => setFilterType("low")}>Baixa confiança</button>
          </div>

          <div className="sort-buttons">
            <span>Ordenar por:</span>
            <button aria-pressed={sortBy === "date"} className={`sort-btn ${sortBy === "date" ? "active" : ""}`} onClick={() => setSortBy("date")}>Data</button>
            <button aria-pressed={sortBy === "confidence"} className={`sort-btn ${sortBy === "confidence" ? "active" : ""}`} onClick={() => setSortBy("confidence")}>Confiança</button>
            <button aria-pressed={sortBy === "name"} className={`sort-btn ${sortBy === "name" ? "active" : ""}`} onClick={() => setSortBy("name")}>Nome</button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="history-results-heading">
          <div>
            <span className="material-symbols-outlined" aria-hidden="true">history</span>
            <h2>Diagnósticos</h2>
          </div>
          <span>{filteredHistory.length} {filteredHistory.length === 1 ? "resultado" : "resultados"}</span>
        </div>
      )}

      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <span className="material-symbols-outlined">history</span>
            </div>
            <h3>Nenhum diagnóstico encontrado</h3>
            {searchTerm || filterType !== "all" ? (
              <p>Tente ajustar os filtros ou a busca</p>
            ) : (
              <p>Realize seu primeiro diagnóstico tirando uma foto ou selecionando da galeria</p>
            )}
            <button className="new-diagnostic-btn" onClick={onBack || (() => navigate(-1))}>
              <span className="material-symbols-outlined">add</span>
              Novo diagnóstico
            </button>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const confidence = getConfidence(item)
            return (
              <div key={item.id} className={`history-card ${getConfidenceClass(confidence)}`}>
                <div className="history-card-content">
                  <div className="history-card-icon">
                    <span className="material-symbols-outlined">{item.type === "batch" ? "flight" : "eco"}</span>
                  </div>
                  <div className="history-card-info">
                    <h3>{getDisplayName(item)}</h3>
                    {item.type === "batch" && (
                      <div className="batch-history-meta">
                        <span><strong>{item.imageCount || 0}</strong> fotos</span>
                        <span><strong>{item.reliableCount || 0}</strong> confiáveis</span>
                        <span><strong>{item.conditionCount || 0}</strong> condições</span>
                      </div>
                    )}
                    <div className="history-card-meta">
                      <span className="date">
                        <span className="material-symbols-outlined">schedule</span>
                        {item.date}
                      </span>
                      <span className={`confidence-badge ${getConfidenceClass(confidence)}`}>
                        {getConfidenceText(confidence)}
                      </span>
                    </div>
                    <div className="confidence-bar-container">
                      <div className="confidence-bar-label">
                        <span>{item.type === "batch" ? "Confiança média" : "Confiança"}</span>
                        <span>{confidence}%</span>
                      </div>
                      <div className="confidence-bar">
                        <div className="confidence-fill" style={{ width: `${confidence}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <button className="delete-item-btn" onClick={() => deleteDiagnostic(item.id)} aria-label="Excluir diagnóstico">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
