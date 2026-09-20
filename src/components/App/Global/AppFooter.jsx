import { useNavigate } from "react-router-dom"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function AppFooter() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const navigationLinks = [
    { path: "/home", icon: "home", label: t("menu.home") },
    { path: "/explore", icon: "explore", label: t("menu.explore") },
    { path: "/admin/team", icon: "groups", label: t("menu.team") },
    { path: "/profile", icon: "person", label: t("menu.profile") },
  ]

  const capabilities = [
    { icon: "psychiatry", label: t("footer.aiScreening") },
    { icon: "monitoring", label: t("footer.monitoring") },
    { icon: "grid_view", label: t("footer.management") },
  ]

  const contacts = [
    {
      href: "tel:+5519971159598",
      icon: "call",
      label: t("footer.phone"),
      value: "(19) 97115-9598",
    },
    {
      href: "mailto:zenith.agroia@gmail.com",
      icon: "mail",
      label: t("footer.email"),
      value: "zenith.agroia@gmail.com",
    },
    {
      href: "https://www.instagram.com/zenith.agricola/",
      icon: "photo_camera",
      label: t("footer.instagram"),
      value: "@zenith.agricola",
      external: true,
    },
  ]

  const goToInternalPage = (path) => {
    sessionStorage.setItem("zenithShowWhiteLoaderOnce", "true")
    navigate(path)
  }

  return (
    <footer className="app-footer zenith-footer">
      <div className="zenith-footer__main">
        <section className="zenith-footer__brand">
          <div className="zenith-footer__brand-lockup">
            <img src="/assets/image/Logo-redonda.png" alt="" />
            <div>
              <strong>Zenith</strong>
              <span>{t("footer.brandTagline")}</span>
            </div>
          </div>

          <p>{t("footer.description")}</p>

          <ul className="zenith-footer__capabilities">
            {capabilities.map((capability) => (
              <li key={capability.label}>
                <span className="material-symbols-outlined" aria-hidden="true">{capability.icon}</span>
                <strong>{capability.label}</strong>
              </li>
            ))}
          </ul>
        </section>

        <nav className="zenith-footer__navigation" aria-label={t("footer.navigation")}>
          <h2>{t("footer.navigation")}</h2>
          <ul>
            {navigationLinks.map((link) => (
              <li key={link.path}>
                <button type="button" onClick={() => goToInternalPage(link.path)}>
                  <span className="material-symbols-outlined" aria-hidden="true">{link.icon}</span>
                  <strong>{link.label}</strong>
                  <span className="material-symbols-outlined" aria-hidden="true">north_east</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <section className="zenith-footer__contact">
          <h2>{t("footer.talkToZenith")}</h2>
          <div className="zenith-footer__contact-list">
            {contacts.map((contact) => (
              <a
                key={contact.href}
                href={contact.href}
                target={contact.external ? "_blank" : undefined}
                rel={contact.external ? "noreferrer" : undefined}
              >
                <span className="zenith-footer__contact-icon" aria-hidden="true">
                  <span className="material-symbols-outlined">{contact.icon}</span>
                </span>
                <span>
                  <small>{contact.label}</small>
                  <strong>{contact.value}</strong>
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>

      <div className="zenith-footer__project-band">
        <section className="zenith-footer__project">
          <span className="zenith-footer__project-icon" aria-hidden="true">
            <span className="material-symbols-outlined">school</span>
          </span>
          <div>
            <small>{t("footer.projectOrigin")}</small>
            <strong>{t("footer.projectTitle")}</strong>
            <p>{t("footer.projectDescription")}</p>
          </div>
        </section>

        <div className="zenith-footer__institutions" aria-label={t("footer.institutionalSupport")}>
          <img
            src="/assets/image/logo-etec-cps.png"
            alt="Etec Polivalente de Americana e Centro Paula Souza"
            loading="lazy"
          />
        </div>
      </div>

      <div className="zenith-footer__bottom">
        <p>{t("footer.rights")}</p>
        <p>
          <span className="material-symbols-outlined" aria-hidden="true">verified_user</span>
          {t("footer.fieldTechnology")}
        </p>
      </div>
    </footer>
  )
}
