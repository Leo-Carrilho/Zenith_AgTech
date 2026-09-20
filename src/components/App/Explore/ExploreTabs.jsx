import { useLanguage } from "../../../contexts/LanguageContext"

const tabs = [
  { id: "diagnostico", icon: "eco", labelKey: "modules.diagnosis" },
  { id: "monitoramento", icon: "analytics", labelKey: "modules.monitoring" },
  { id: "clima", icon: "cloud", labelKey: "modules.weather" },
  { id: "diario", icon: "menu_book", labelKey: "modules.diary" },
  { id: "mapa", icon: "map", labelKey: "modules.map" },
  { id: "estoque", icon: "inventory", labelKey: "modules.stock" },
  { id: "atividades", icon: "assignment", labelKey: "modules.activities" },
  { id: "legislacao", icon: "gavel", labelKey: "modules.legislation" }
];

export default function ExploreTabs({ activeTab, onTabChange }) {
  const { t } = useLanguage()

  return (
    <div className="explore-tabs-header">
      <div className="explore-tabs-modern" role="tablist" aria-label={t("explore.modules")}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`explore-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="material-symbols-outlined explore-tab-icon">{tab.icon}</span>
            <span className="explore-tab-label">{t(tab.labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
