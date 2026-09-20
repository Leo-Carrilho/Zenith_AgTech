// components/Home/ExploreModules.jsx
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../../../contexts/LanguageContext"

const modules = [
  { 
    id: "diagnostico",
    path: "/explore", 
    tab: "diagnostico",
    icon: "eco", 
    labelKey: "modules.diagnosis",
    sublabelKey: "modules.diagnosisDescription",
    type: "diagnose" 
  },
  { 
    id: "clima",
    path: "/explore", 
    tab: "clima",
    icon: "cloud", 
    labelKey: "modules.weather",
    sublabelKey: "modules.weatherDescription",
    type: "weather" 
  },
  {
    id: "monitoramento",
    path: "/explore",
    tab: "monitoramento",
    icon: "monitoring",
    labelKey: "modules.monitoring",
    sublabelKey: "modules.monitoringDescription",
    type: "monitoring"
  },
  { 
    id: "diario",
    path: "/explore", 
    tab: "diario",
    icon: "menu_book", 
    labelKey: "modules.diary",
    sublabelKey: "modules.diaryDescription",
    type: "diary" 
  },
  { 
    id: "mapa",
    path: "/explore", 
    tab: "mapa",
    icon: "map", 
    labelKey: "modules.map",
    sublabelKey: "modules.mapDescription",
    type: "map" 
  },
  { 
    id: "estoque",
    path: "/explore", 
    tab: "estoque",
    icon: "inventory", 
    labelKey: "modules.stock",
    sublabelKey: "modules.stockDescription",
    type: "stock" 
  },
  { 
    id: "atividades",
    path: "/explore", 
    tab: "atividades",
    icon: "assignment", 
    labelKey: "modules.activities",
    sublabelKey: "modules.activitiesDescription",
    type: "reports"
  }
]

export default function ExploreModules({ onNavigate }) {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const handleNavigate = (module) => {
    // Se houver onNavigate prop, usa ela, senão usa navigate
    if (onNavigate) {
      onNavigate(module)
    } else {
      sessionStorage.setItem("zenithShowWhiteLoaderOnce", "true")
      navigate(module.path, { state: { activeTab: module.tab } })
    }
  }

  return (
    <section className="explore-section">
      <h2 className="section-title">
        <span className="material-symbols-outlined">explore</span>
        {t("modules.title")}
      </h2>

      <div className="explore-grid">
        {modules.map((module) => (
          <button
            key={module.id}
            className="explore-card glass"
            onClick={() => handleNavigate(module)}
          >
            <div className={`explore-icon ${module.type}`}>
              <span className="material-symbols-outlined">{module.icon}</span>
              <div className="icon-glow"></div>
            </div>
            <span className="explore-label">{t(module.labelKey)}</span>
            <span className="explore-sublabel">{t(module.sublabelKey)}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
