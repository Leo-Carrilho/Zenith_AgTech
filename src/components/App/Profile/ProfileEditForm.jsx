// components/Profile/ProfileEditForm.jsx
import { useLanguage } from "../../../contexts/LanguageContext"

const profileIcons = ["👨‍🌾", "🚜", "🌱", "🌽", "🌻", "🐄", "🐓", "🍎", "🌾", "🧑‍🌾", "🌿", "🍊", "🐝", "🚛", "🏡"]

export default function ProfileEditForm({ formData, onChange, onIconSelect }) {
  const { t } = useLanguage()

  return (
    <div className="profile-card glass edit-card">
      <div className="card-corner"></div>
      
      <div className="card-content">
        {/* Icon Selector */}
        <div className="icon-selector-tech">
          <label>
            <span className="material-symbols-outlined">emoji_emotions</span>
            {t("editor.chooseIcon")}
          </label>
          <div className="icon-grid-tech">
            {profileIcons.map((icon, index) => (
              <button
                key={index}
                className={`icon-option-tech ${formData.profileIcon === icon ? 'selected' : ''}`}
                onClick={() => onIconSelect(icon)}
                type="button"
              >
                {icon}
                {formData.profileIcon === icon && <div className="icon-selected-glow"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="form-fields">
          <div className="input-group">
            <span className="material-symbols-outlined">manage_accounts</span>
            <input
              className="tech-input"
              name="name"
              value={formData.name}
              placeholder={t("personal.name")}
              onChange={onChange}
            />
            <div className="input-glow"></div>
          </div>

          <div className="input-group">
            <span className="material-symbols-outlined">cake</span>
            <input
              className="tech-input"
              type="number"
              name="age"
              value={formData.age}
              placeholder={t("editor.age")}
              min="0"
              max="120"
              onChange={onChange}
            />
            <div className="input-glow"></div>
          </div>

          <div className="input-group">
            <span className="material-symbols-outlined">call</span>
            <input
              className="tech-input"
              name="phone"
              value={formData.phone}
              placeholder={t("personal.phone")}
              onChange={onChange}
            />
            <div className="input-glow"></div>
          </div>

          <div className="input-group">
            <span className="material-symbols-outlined">square_foot</span>
            <input
              className="tech-input"
              type="number"
              name="hectares"
              value={formData.hectares}
              placeholder={t("editor.totalHectares")}
              min="0"
              step="0.1"
              onChange={onChange}
            />
            <div className="input-glow"></div>
          </div>

          <div className="input-row-tech">
            <div className="input-group">
              <span className="material-symbols-outlined">location_city</span>
              <input
                className="tech-input"
                name="city"
                value={formData.city}
                placeholder={t("editor.city")}
                onChange={onChange}
              />
              <div className="input-glow"></div>
            </div>
            <div className="input-group small">
              <span className="material-symbols-outlined">pin</span>
              <input
                className="tech-input"
                name="state"
                value={formData.state}
                placeholder={t("editor.state")}
                maxLength="2"
                onChange={onChange}
              />
              <div className="input-glow"></div>
            </div>
          </div>
        </div>

        <div className="info-note">
          <span className="material-symbols-outlined">info</span>
          <p>{t("editor.note")}</p>
        </div>
      </div>
    </div>
  )
}
