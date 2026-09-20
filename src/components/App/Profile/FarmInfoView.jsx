// components/App/Profile/FarmInfoView.jsx
import { motion } from "framer-motion"
import { useLanguage } from "../../../contexts/LanguageContext"

const FarmInfoView = ({ farmData, onAddFarm, onEditFarm, formatPhone }) => {
  const { locale, t } = useLanguage()

  if (!farmData) {
    return (
      <motion.div 
        className="empty-state-tech"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="empty-icon-container">
          <span className="material-symbols-outlined empty-icon">agriculture</span>
          <div className="empty-ring"></div>
          <div className="empty-ring-2"></div>
        </div>
        
        <h4>{t("farm.none")}</h4>
        <p>{t("farm.noneDescription")}</p>
        
        {onAddFarm && (
          <button className="empty-action-btn" onClick={onAddFarm}>
            <span className="material-symbols-outlined">add</span>
            {t("farm.register")}
          </button>
        )}
      </motion.div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return t("common.notInformed")
    const date = new Date(dateString)
    return date.toLocaleDateString(locale)
  }

  const formatArea = (area) => {
    if (!area) return t("common.notInformed")
    return `${parseFloat(area).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ha`
  }

  const farmInitial = (farmData.name || "F").trim().charAt(0).toLocaleUpperCase(locale) || "F"
  const location = [farmData.municipio, farmData.uf].filter(Boolean).join(" - ") || t("common.notInformed")
  const farmRows = [
    {
      icon: "agriculture",
      label: t("farm.name"),
      value: farmData.name || t("common.notInformed"),
    },
    {
      icon: "square_foot",
      label: t("farm.totalArea"),
      value: formatArea(farmData.area_total),
    },
    {
      icon: "grass",
      label: t("farm.crop"),
      value: farmData.plantacao || t("common.notInformed"),
    },
    {
      icon: "location_on",
      label: t("personal.location"),
      value: location,
    },
    {
      icon: "map",
      label: t("farm.district"),
      value: farmData.bairro || t("common.notInformed"),
    },
    {
      icon: "mail",
      label: t("farm.postalCode"),
      value: farmData.cep || t("common.notInformed"),
    },
    {
      icon: "call",
      label: t("personal.phone"),
      value: farmData.telefone_mascarado || (farmData.telefone ? formatPhone(farmData.telefone) : t("common.notInformed")),
    },
    {
      icon: "calendar_month",
      label: t("farm.acquisition"),
      value: farmData.data_aquisicao ? formatDate(farmData.data_aquisicao) : t("common.notInformed"),
    },
    {
      icon: "badge",
      label: t("farm.relationship"),
      value: farmData.tipo_proprietario || t("common.notInformed"),
    },
  ]

  return (
    <motion.div 
      className="profile-card farm-details"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-corner"></div>

      <div className="farm-account-summary">
        <span className="farm-account-avatar">{farmInitial}</span>
        <div className="farm-account-copy">
          <strong>{farmData.name || t("farm.fallbackName")}</strong>
          <span>{location}</span>
        </div>
      </div>

      <div className="farm-data-list">
        {farmRows.map((row) => (
          <button type="button" className="personal-data-row farm-data-row" onClick={onEditFarm} disabled={!onEditFarm} key={row.label}>
            <span className="personal-data-icon material-symbols-outlined" aria-hidden="true">{row.icon}</span>
            <span className="personal-data-copy">
              <small>{row.label}</small>
              <strong>{row.value}</strong>
            </span>
            {onEditFarm && <span className="personal-data-action material-symbols-outlined" aria-hidden="true">edit</span>}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export default FarmInfoView
