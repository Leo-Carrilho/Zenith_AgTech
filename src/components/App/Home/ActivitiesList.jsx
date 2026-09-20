// components/Home/ActivitiesList.jsx
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import DroneIcon from "../Global/DroneIcon"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function ActivitiesList({ hasFarm, onViewAll, onRegister }) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [recentDiagnostics, setRecentDiagnostics] = useState([])

  // Carregar histórico de diagnósticos
  useEffect(() => {
    const saved = localStorage.getItem("diagnosticHistory")
    if (saved) {
      const history = JSON.parse(saved)
      // Pegar os 3 diagnósticos mais recentes
      setRecentDiagnostics(history.slice(0, 3))
    }
  }, [])

  if (!hasFarm) {
    return (
      <div className="empty-state glass">
        <div className="empty-icon">
          <span className="material-symbols-outlined">inbox</span>
          <div className="empty-icon-ring"></div>
        </div>
        <h3>{t("activities.none")}</h3>
        <p>{t("activities.noneDescription")}</p>
        <button className="empty-action-btn" onClick={onRegister}>
          <span className="material-symbols-outlined">add</span>
          <span>{t("activities.registerFarm")}</span>
          <div className="btn-glow"></div>
        </button>
      </div>
    )
  }

  // Função para navegar para a página de atividades
  const goToActivities = () => {
    sessionStorage.setItem("zenithShowWhiteLoaderOnce", "true")
    navigate("/explore", { state: { activeTab: "atividades" } })
  }

  // Função para navegar para o histórico completo de diagnósticos
  const goToHistory = () => {
    sessionStorage.setItem("zenithShowWhiteLoaderOnce", "true")
    navigate("/explore", { state: { activeTab: "diagnostico", showHistory: true } })
  }

  const goToMap = () => {
    sessionStorage.setItem("zenithShowWhiteLoaderOnce", "true")
    navigate("/explore", { state: { activeTab: "mapa" } })
  }

  return (
    <div className="activities-list">
      {/* Último Diagnóstico - Agora vai para Atividades */}
      {recentDiagnostics.length > 0 && (
        <div className="activity-card" onClick={goToActivities}>
          <div className="activity-icon atividades">
            <span className="material-symbols-outlined">assignment</span>
            <div className="icon-pulse"></div>
          </div>
          <div className="activity-content">
            <div className="activity-header">
              <h4 className="activity-title">{t("activities.field")}</h4>
              <span className="activity-time">{t("activities.manageTasks")}</span>
            </div>
            <p className="activity-description">
              {t("activities.fieldDescription")}
            </p>
            <div className="activity-metrics">
              <div className="metric">
                <span className="material-symbols-outlined">checklist</span>
                <span>{t("activities.pendingTasks")}</span>
              </div>
              <div className="metric">
                <span className="material-symbols-outlined">chevron_right</span>
                <span>{t("activities.clickAccess")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mais Diagnósticos - Vai para o histórico */}
      {recentDiagnostics.length > 1 && (
        <div className="activity-card" onClick={goToHistory}>
          <div className="activity-icon diagnosticos">
            <span className="material-symbols-outlined">history</span>
            <div className="icon-pulse"></div>
          </div>
          <div className="activity-content">
            <div className="activity-header">
              <h4 className="activity-title">{t("activities.recentDiagnostics")}</h4>
              <span className="activity-time">{t("home.viewAll")} →</span>
            </div>
            <p className="activity-description">
              {recentDiagnostics.slice(0, 2).map((diag, idx) => (
                <span key={idx}>
                  {diag.disease} ({diag.confidence}%)
                  {idx < recentDiagnostics.slice(0, 2).length - 1 && " • "}
                </span>
              ))}
            </p>
            <div className="activity-metrics">
              <div className="metric">
                <span className="material-symbols-outlined">inventory</span>
                <span>{t("activities.savedDiagnostics", { count: recentDiagnostics.length })}</span>
              </div>
              <div className="metric">
                <span className="material-symbols-outlined">trending_up</span>
                <span>{t("activities.clickViewAll")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voo de Mapeamento - Vai para o mapa */}
      <div className="activity-card" onClick={goToMap}>
        <div className="activity-icon mapeamento">
          <DroneIcon className="activity-drone-icon" />
          <div className="icon-pulse"></div>
        </div>
        <div className="activity-content">
          <div className="activity-header">
            <h4 className="activity-title">{t("activities.mappingFlight")}</h4>
            <span className="activity-time">{t("activities.twoHoursAgo")}</span>
          </div>
          <p className="activity-description">{t("activities.mappingDescription")}</p>
          <div className="activity-metrics">
            <div className="metric">
              <span className="material-symbols-outlined">map</span>
              <span>{t("activities.viewMap")}</span>
            </div>
            <div className="metric">
              <span className="material-symbols-outlined">chevron_right</span>
              <span>{t("activities.clickAccess")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
