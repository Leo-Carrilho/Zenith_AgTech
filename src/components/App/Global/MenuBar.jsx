import { useEffect, useRef, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../../../services/firebase"
import { ACCOUNT_ROLES, getUserAccessProfile, isOperationalRole } from "../../../services/accessControl"
import { useLanguage } from "../../../contexts/LanguageContext"
import "../../../styles/Global/MenuBar.css"

const adminItems = [
  { path: "/home", icon: "home", labelKey: "menu.home" },
  { path: "/admin/team", icon: "groups", labelKey: "menu.team" },
  { action: "create", icon: "add", labelKey: "menu.add", isPrimary: true },
  { path: "/explore", hash: "#mapa", icon: "grid_view", labelKey: "menu.explore" },
  { path: "/profile", icon: "person", labelKey: "menu.profile" },
]

const createActions = [
  { path: "/admin/team", hash: "#novo-funcionario", icon: "person_add", labelKey: "menu.newEmployee" },
  { path: "/admin/team", hash: "#nova-tarefa", icon: "assignment_add", labelKey: "menu.newTask" },
  { path: "/admin/team", hash: "#configurar-drone", icon: "flight", labelKey: "menu.configureDrone" },
]

const employeeItems = [
  { path: "/funcionarios", icon: "assignment", labelKey: "menu.tasks" },
  { path: "/profile", icon: "person", labelKey: "menu.profile" },
]

export default function MenuBar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { t } = useLanguage()
  const lastScrollYRef = useRef(0)
  const tickingRef = useRef(false)
  const createMenuRef = useRef(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false)
  const [role, setRole] = useState(ACCOUNT_ROLES.ADMIN)
  const items = isOperationalRole(role) ? employeeItems : adminItems
  const isActive = ({ path, hash, action }) => {
    if (action) return false
    if (hash) return location.pathname === path && location.hash === hash
    return location.pathname === path && !location.hash
  }
  const goToInternalPage = ({ path, hash }) => {
    setIsCreateMenuOpen(false)
    if (location.pathname === path && location.hash === (hash || "")) return
    sessionStorage.setItem("zenithShowWhiteLoaderOnce", "true")
    navigate(`${path}${hash || ""}`)
  }

  useEffect(() => {
    if (!isCreateMenuOpen) return undefined

    const closeMenu = (event) => {
      if (!createMenuRef.current?.contains(event.target)) setIsCreateMenuOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsCreateMenuOpen(false)
    }

    document.addEventListener("pointerdown", closeMenu)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("pointerdown", closeMenu)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [isCreateMenuOpen])

  useEffect(() => {
    setIsCreateMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    const shouldKeepVisible = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches
    if (shouldKeepVisible) {
      setIsVisible(true)
      return undefined
    }

    lastScrollYRef.current = window.scrollY

    const handleScroll = () => {
      if (tickingRef.current) return

      tickingRef.current = true
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        const scrollDelta = currentScrollY - lastScrollYRef.current
        const isNearTop = currentScrollY < 12

        if (isNearTop) {
          setIsVisible(true)
        } else if (scrollDelta > 8) {
          setIsVisible(false)
        } else if (scrollDelta < -8) {
          setIsVisible(true)
        }

        lastScrollYRef.current = currentScrollY
        tickingRef.current = false
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    const loadRole = async (currentUser = auth.currentUser) => {
      if (!currentUser) return
      const profile = await getUserAccessProfile(currentUser.uid)
      setRole(profile?.role || ACCOUNT_ROLES.ADMIN)
    }

    const handleRoleUpdated = () => loadRole()
    const unsubscribe = onAuthStateChanged(auth, loadRole)
    window.addEventListener("zenith-user-role-updated", handleRoleUpdated)

    return () => {
      unsubscribe()
      window.removeEventListener("zenith-user-role-updated", handleRoleUpdated)
    }
  }, [])

  return (
    <nav
      ref={createMenuRef}
      className={`nav ${isVisible ? "nav--visible" : "nav--hidden"}${isCreateMenuOpen ? " nav--create-open" : ""}`}
    >
      {isCreateMenuOpen && !isOperationalRole(role) && (
        <div className="nav__create-menu" role="menu" aria-label={t("menu.teamActions")}>
          {createActions.map((action) => (
            <button key={action.hash} type="button" role="menuitem" onClick={() => goToInternalPage(action)}>
              <span className="material-symbols-outlined" aria-hidden="true">{action.icon}</span>
              <span>{t(action.labelKey)}</span>
            </button>
          ))}
        </div>
      )}
      <ul className="nav__items" style={{ "--nav-item-count": items.length }}>
        {items.map((item) => {
          const { path, hash, action, icon, labelKey, isPrimary } = item
          const label = t(labelKey)
          const active = isActive(item)
          return (
            <li
              key={action || `${path}${hash || ""}`}
              className={`nav__item${active ? " nav__item--active" : ""}${isPrimary ? " nav__item--primary" : ""}`}
            >
              <button
                className={`nav__item-btn${active ? " nav__item-btn--active" : ""}${isPrimary ? " nav__item-btn--primary" : ""}`}
                onClick={() => action === "create" ? setIsCreateMenuOpen((open) => !open) : goToInternalPage(item)}
                aria-current={active ? "page" : undefined}
                aria-label={label}
                aria-expanded={action === "create" ? isCreateMenuOpen : undefined}
                aria-haspopup={action === "create" ? "menu" : undefined}
              >
                <span className="material-symbols-outlined">{icon}</span>
                {!isPrimary && <span className="nav__label">{label}</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
