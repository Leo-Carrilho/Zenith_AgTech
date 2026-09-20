import { useLanguage } from "../../../contexts/LanguageContext"

export default function PersonalInfoView({
  userData,
  user,
  onEdit,
  onChangePassword,
  passwordResetting,
}) {
  const { locale, t } = useLanguage()
  const roleLabels = {
    admin: t("personal.admin"),
    employee: t("personal.employee"),
    collaborator: t("personal.collaborator"),
  }
  const missingName = t("personal.nameMissing")
  const displayName = userData?.name || user?.displayName || missingName
  const initial = displayName === missingName
    ? "?"
    : displayName.trim().charAt(0).toLocaleUpperCase(locale)
  const location = [userData?.city, userData?.state].filter(Boolean).join(" - ")

  const infoItems = [
    { icon: "person", label: t("personal.name"), value: userData?.name },
    { icon: "mail", label: t("personal.email"), value: user?.email },
    { icon: "call", label: t("personal.phone"), value: userData?.phoneMasked || userData?.phone },
    { icon: "location_on", label: t("personal.location"), value: location },
    { icon: "badge", label: t("personal.role"), value: roleLabels[userData?.role] },
  ]

  return (
    <div className="personal-details">
      <div className="personal-account-summary">
        <div className="personal-account-avatar" aria-hidden="true">{initial}</div>
        <div className="personal-account-copy">
          <strong>{displayName}</strong>
          <span className={user?.emailVerified ? "is-verified" : "is-pending"}>
            <span className="material-symbols-outlined" aria-hidden="true">
              {user?.emailVerified ? "verified_user" : "info"}
            </span>
            {user?.emailVerified ? t("personal.verified") : t("personal.unverified")}
          </span>
        </div>
      </div>

      <div className="personal-data-list">
        {infoItems.map((item) => (
          <button type="button" className="personal-data-row" key={item.label} onClick={onEdit} disabled={!onEdit}>
            <span className="personal-data-icon material-symbols-outlined" aria-hidden="true">{item.icon}</span>
            <span className="personal-data-copy">
              <small>{item.label}</small>
              <strong>{item.value || t("common.notInformed")}</strong>
            </span>
            {onEdit && <span className="personal-data-action material-symbols-outlined" aria-hidden="true">edit</span>}
          </button>
        ))}

        <button
          type="button"
          className="personal-data-row password-row"
          onClick={onChangePassword}
          disabled={passwordResetting}
        >
          <span className="personal-data-icon material-symbols-outlined" aria-hidden="true">shield</span>
          <span className="personal-data-copy">
            <small>{t("personal.security")}</small>
            <strong>{passwordResetting ? t("personal.sendingEmail") : t("profile.changePassword")}</strong>
          </span>
          <span className="personal-data-action material-symbols-outlined" aria-hidden="true">chevron_right</span>
        </button>
      </div>
    </div>
  )
}
