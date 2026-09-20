// pages/App/Explore.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import AppHeader from "../../components/App/Global/AppHeader";
import MenuBar from "../../components/App/Global/MenuBar";

import DiagnosticoTab from "../../components/App/Explore/Diagnostico/DiagnosticoTab";
import MonitoramentoView from "../../components/App/Explore/Monitoramento/MonitoramentoView"; // ✅ NOVO
import ClimaTab from "../../components/App/Explore/ClimaTab";
import DiarioTab from "../../components/App/Explore/DiarioTab";
import MapaTab from "../../components/App/Explore/MapaTab";
import EstoqueTab from "../../components/App/Explore/EstoqueTab";
import AtividadesTab from "../../components/App/Explore/AtividadesTab";
import LegislacaoDronesTab from "../../components/App/Explore/LegislacaoDronesTab";

import ParticleBackground from "../../components/App/Home/ParticleBackground";
import { useLanguage } from "../../contexts/LanguageContext";

import "../../styles/App/Explore.css";

// ================= TABS =================
const tabs = [
  { id: "diagnostico", labelKey: "modules.diagnosis", icon: "eco" },
  { id: "monitoramento", labelKey: "modules.monitoring", icon: "psychiatry" },
  { id: "clima", labelKey: "modules.weather", icon: "cloud" },
  { id: "diario", labelKey: "modules.diary", icon: "menu_book" },
  { id: "mapa", labelKey: "modules.map", icon: "map" },
  { id: "estoque", labelKey: "modules.stock", icon: "inventory" },
  { id: "atividades", labelKey: "modules.activities", icon: "assignment" },
  { id: "legislacao", labelKey: "modules.legislation", icon: "gavel" }
];

function normalizeTab(tabId) {
  return tabId;
}

export default function Explore() {
  const location = useLocation();
  const { t } = useLanguage();

  // 🔒 valida tabs válidas
  const validTabs = tabs.map((t) => t.id);

  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("activeExploreTab");
    const normalizedTab = normalizeTab(savedTab);
    return validTabs.includes(normalizedTab) ? normalizedTab : "diagnostico";
  });

  // ================= CONTROLADOR DE TAB =================
  useEffect(() => {
    const requestedTab = normalizeTab(location.state?.activeTab);

    if (requestedTab && validTabs.includes(requestedTab)) {
      setActiveTab(requestedTab);
      localStorage.setItem("activeExploreTab", requestedTab);
    } else {
      const savedTab = normalizeTab(localStorage.getItem("activeExploreTab"));
      if (savedTab && validTabs.includes(savedTab)) {
        setActiveTab(savedTab);
      }
    }
  }, [location]);

  useEffect(() => {
    localStorage.setItem("activeExploreTab", activeTab);
    window.dispatchEvent(new Event("system-bar-color-change"));
  }, [activeTab]);

  // ================= RENDER =================
  const renderTab = () => {
    switch (activeTab) {
      case "diagnostico":
        return <DiagnosticoTab active />;

      case "monitoramento":
        return <MonitoramentoView />;

      case "clima":
        return <ClimaTab />;

      case "diario":
        return <DiarioTab />;

      case "mapa":
        return <MapaTab />;

      case "estoque":
        return <EstoqueTab />;

      case "atividades":
        return <AtividadesTab />;

      case "legislacao":
        return <LegislacaoDronesTab />;

      default:
        return <DiagnosticoTab />;
    }
  };

  return (
    <div
      className={`explore-container explore-container--${activeTab}`}
      data-system-bar-color={["diagnostico", "monitoramento", "clima", "diario", "mapa", "estoque", "atividades", "legislacao"].includes(activeTab) ? "#f4f9ef" : "#3f8a5d"}
    >
      <ParticleBackground />

      

      {/* ================= TABS UI ================= */}
      <div
        className="explore-tabs-header"
        data-system-bar-color={["diagnostico", "monitoramento", "clima", "diario", "mapa", "estoque", "atividades", "legislacao"].includes(activeTab) ? "#f4f9ef" : "#3f8a5d"}
      >
        <div className="explore-tabs-modern">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab={tab.id}
              className={`explore-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="explore-tab-icon material-symbols-outlined">
                {tab.icon}
              </span>
              <span className="explore-tab-label">{t(tab.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= CONTEÚDO ================= */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="tab-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "diagnostico" && (
            <aside className="desktop-feature-notice" role="note" aria-label={t("explore.multispectralDescription")}>
              <span className="desktop-feature-notice__icon" aria-hidden="true">
                <span className="material-symbols-outlined">desktop_windows</span>
              </span>
              <div className="desktop-feature-notice__copy">
                <strong>{t("explore.multispectral")}</strong>
                <p>{t("explore.multispectralDescription")}</p>
              </div>
              <span className="desktop-feature-notice__badge">Desktop</span>
            </aside>
          )}
          {renderTab()}
        </motion.div>
      </AnimatePresence>

      <MenuBar />
    </div>
  );
}
