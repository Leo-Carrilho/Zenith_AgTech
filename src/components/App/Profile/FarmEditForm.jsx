// components/App/Profile/FarmEditForm.jsx
import { useState } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "../../../contexts/LanguageContext"

const FarmEditForm = ({ farmData, onSave, onCancel, saving }) => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: farmData?.name || "",
    area_total: farmData?.area_total || "",
    plantacao: farmData?.plantacao || "",
    municipio: farmData?.municipio || "",
    uf: farmData?.uf || "",
    bairro: farmData?.bairro || "",
    cep: farmData?.cep || "",
    data_aquisicao: farmData?.data_aquisicao || "",
    telefone: "",
    tipo_proprietario: farmData?.tipo_proprietario || "Proprietário"
  })

  const [errors, setErrors] = useState({})
  const [cepLoading, setCepLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const buscarEnderecoPorCep = async (baseData = formData) => {
    const cepLimpo = baseData.cep.replace(/\D/g, "")

    if (cepLimpo.length !== 8) return baseData

    try {
      setCepLoading(true)
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (data.erro) {
        setErrors(prev => ({ ...prev, cep: t("farm.postalNotFound") }))
        return baseData
      }

      const updatedData = {
        ...baseData,
        bairro: data.bairro || baseData.bairro,
        municipio: data.localidade || baseData.municipio,
        uf: data.uf || baseData.uf
      }

      setFormData(updatedData)

      setErrors(prev => ({
        ...prev,
        cep: "",
        municipio: "",
        uf: ""
      }))

      return updatedData
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
      setErrors(prev => ({ ...prev, cep: t("farm.postalLookupError") }))
      return baseData
    } finally {
      setCepLoading(false)
    }
  }

  const validateForm = (data = formData) => {
    const newErrors = {}

    if (!data.name.trim()) {
      newErrors.name = t("farm.nameRequired")
    }

    if (!data.area_total) {
      newErrors.area_total = t("farm.areaRequired")
    } else if (isNaN(data.area_total) || parseFloat(data.area_total) <= 0) {
      newErrors.area_total = t("farm.areaPositive")
    }

    if (!data.municipio.trim()) {
      newErrors.municipio = t("farm.cityRequired")
    }

    if (!data.uf.trim()) {
      newErrors.uf = t("farm.stateRequired")
    } else if (data.uf.length > 2) {
      newErrors.uf = t("farm.stateAbbreviation")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const updatedFormData = await buscarEnderecoPorCep(formData)
    setFormData(updatedFormData)

    if (validateForm(updatedFormData)) {
      onSave(updatedFormData)
    }
  }

  const ufList = [
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
    "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
    "RS","RO","RR","SC","SP","SE","TO"
  ]

  const culturaList = [
    "Soja","Milho","Café","Cana-de-açúcar","Algodão",
    "Trigo","Arroz","Feijão","Pastagem","Eucalipto",
    "Laranja","Outros"
  ]

  return (
    <motion.div 
      className="profile-card farm-edit-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >

      <div className="card-header">
        <h3 className="personal-info-title">{t("farm.edit")}</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-fields">

           <div className="edit-form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              {t("common.cancel")}
            </button>

            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? t("common.saving") : t("common.save")}
            </button>
          </div>

          {/* Nome */}
          <div className="input-group">
            <label className="input-label">{t("farm.nameField")}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`tech-input ${errors.name ? 'error' : ''}`}
              disabled={saving}
            />
          </div>
          {errors.name && <span className="error-message">{errors.name}</span>}

          {/* Área + Cultura */}
          <div className="input-row-tech">
            <div className="input-group">
              <label className="input-label">{t("farm.totalArea")} (ha)</label>
              <input
                type="number"
                name="area_total"
                value={formData.area_total}
                onChange={handleChange}
                className={`tech-input ${errors.area_total ? 'error' : ''}`}
                step="0.1"
                min="0"
                disabled={saving}
              />
            </div>

            <div className="input-group">
              <label className="input-label">{t("farm.crop")}</label>
              <select
                name="plantacao"
                value={formData.plantacao}
                onChange={handleChange}
                className="tech-select"
                disabled={saving}
              >
                <option value="">{t("common.select")}</option>
                {culturaList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Localização */}
          <div className="input-row-tech">
            <div className="input-group">
              <label className="input-label">{t("farm.city")}</label>
              <input
                type="text"
                name="municipio"
                value={formData.municipio}
                onChange={handleChange}
                className={`tech-input ${errors.municipio ? 'error' : ''}`}
                disabled={saving}
              />
            </div>

            <div className="input-group">
              <label className="input-label">UF</label>
              <select
                name="uf"
                value={formData.uf}
                onChange={handleChange}
                className={`tech-select ${errors.uf ? 'error' : ''}`}
                disabled={saving}
              >
                <option value="">{t("common.select")}</option>
                {ufList.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bairro + CEP */}
          <div className="input-row-tech">
            <div className="input-group">
              <label className="input-label">{t("farm.neighborhood")}</label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                className="tech-input"
                disabled={saving}
              />
            </div>

            <div className="input-group">
              <label className="input-label">{t("farm.postalCode")}</label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                onBlur={buscarEnderecoPorCep}
                className="tech-input"
                disabled={saving || cepLoading}
              />
              {cepLoading && <span className="error-message">{t("farm.searchingPostalCode")}</span>}
              {errors.cep && <span className="error-message">{errors.cep}</span>}
            </div>
          </div>

          {/* Telefone + Data */}
          <div className="input-row-tech">
            <div className="input-group">
              <label className="input-label">{t("personal.phone")}</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="tech-input"
                placeholder={farmData?.telefone_mascarado || t("farm.newPhone")}
                disabled={saving}
              />
            </div>

            <div className="input-group">
              <label className="input-label">{t("farm.acquisitionDate")}</label>
              <input
                type="date"
                name="data_aquisicao"
                value={formData.data_aquisicao}
                onChange={handleChange}
                className="tech-input"
                disabled={saving}
              />
            </div>
          </div>

          {/* Tipo */}
          <div className="input-group">
            <label className="input-label">{t("farm.ownerType")}</label>
            <select
              name="tipo_proprietario"
              value={formData.tipo_proprietario}
              onChange={handleChange}
              className="tech-select"
              disabled={saving}
            >
              <option value="Proprietário">{t("farm.owner")}</option>
              <option value="Arrendatário">{t("farm.tenant")}</option>
              <option value="Parceiro">{t("farm.partner")}</option>
              <option value="Comodatário">{t("farm.borrower")}</option>
              <option value="Outros">{t("farm.others")}</option>
            </select>
          </div>
         

        </div>
      </form>
    </motion.div>
  )
}

export default FarmEditForm
