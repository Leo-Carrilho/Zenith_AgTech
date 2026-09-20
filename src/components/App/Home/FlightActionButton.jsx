// components/Home/FlightActionButton.jsx
import DroneIcon from "../Global/DroneIcon"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function FlightActionButton({ onNavigate }) {
  const { t } = useLanguage()

  return (
    <section className="action-section">
      <button className="flight-action-btn glass" onClick={onNavigate}>
        <div className="btn-content">
          <div className="btn-icon-wrapper">
            <DroneIcon className="btn-drone-icon" />
            <div className="btn-icon-glow"></div>
          </div>
          <div className="btn-text">
            <span className="btn-title">{t("home.startMonitoring")}</span>
          </div>
          <div className="btn-arrow-wrapper">
            <span className="material-symbols-outlined btn-arrow">arrow_forward</span>
          </div>
        </div>
        <div className="btn-progress">
          <div className="progress-bar" style={{ width: '0%' }}></div>
        </div>
      </button>
    </section>
  )
}
