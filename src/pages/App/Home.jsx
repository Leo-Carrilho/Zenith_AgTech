// Home.jsx
import { useEffect, useLayoutEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "../../services/firebase"
import { getWeatherByCity } from "../../services/weatherService"
import { query, where, getDocs, collection, onSnapshot } from "firebase/firestore"
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  CloudSunRain,
  Moon,
  Sun,
} from "lucide-react"

// Componentes
import ParticleBackground from "../../components/App/Home/ParticleBackground"
import MouseGlow from "../../components/App/Home/MouseGlow"
import FlightActionButton from "../../components/App/Home/FlightActionButton"
import ActivitiesList from "../../components/App/Home/ActivitiesList"
import ExploreModules from "../../components/App/Home/ExploreModules"
import AppFooter from "../../components/App/Global/AppFooter"
import MenuBar from "../../components/App/Global/MenuBar"
import AppHeader from "../../components/App/Global/AppHeader"  
import { getUserAccessProfile, isOperationalRole } from "../../services/accessControl"
import { useLanguage } from "../../contexts/LanguageContext"

import "../../styles/App/Home.css"

function getWeatherVisual(weather, t) {
  const code = Number(weather?.conditionCode)
  const isNight = weather?.conditionIcon?.endsWith("n")
  let Icon = isNight ? CloudMoon : CloudSun
  let variant = "partly-cloudy"

  if (Number.isFinite(code)) {
    if (code >= 200 && code < 300) {
      Icon = CloudLightning
      variant = "storm"
    } else if (code >= 300 && code < 600) {
      Icon = isNight ? CloudRain : CloudSunRain
      variant = "rain"
    } else if (code >= 600 && code < 700) {
      Icon = CloudSnow
      variant = "snow"
    } else if (code >= 700 && code < 800) {
      Icon = CloudFog
      variant = "fog"
    } else if (code === 800) {
      Icon = isNight ? Moon : Sun
      variant = isNight ? "night" : "sunny"
    } else if (code === 801) {
      Icon = isNight ? CloudMoon : CloudSun
      variant = "partly-cloudy"
    } else {
      Icon = Cloud
      variant = "cloudy"
    }
  }

  return {
    Icon,
    variant,
    label: weather?.conditionDescription || t("home.currentWeather")
  }
}

function readStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]")
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function parseActivityDate(activity) {
  if (!activity?.date) return new Date(Number(activity?.id) || 0)

  const date = new Date(`${activity.date}T00:00:00`)
  return Number.isNaN(date.getTime()) ? new Date(Number(activity?.id) || 0) : date
}

function parseDiagnosticDate(diagnostic) {
  if (diagnostic?.submittedAt) {
    const submittedDate = new Date(diagnostic.submittedAt)
    if (!Number.isNaN(submittedDate.getTime())) return submittedDate
  }

  const legacyDate = String(diagnostic?.date || "")
  const match = legacyDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/)

  if (match) {
    const [, day, month, year, hour = 0, minute = 0, second = 0] = match
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
  }

  return new Date(Number(diagnostic?.id) || 0)
}

function formatDiagnosticTimestamp(diagnostic, locale, t) {
  const date = parseDiagnosticDate(diagnostic)
  if (!date.getTime()) return { date: t("home.noRecord"), time: t("home.noImage") }

  return {
    date: date.toLocaleDateString(locale),
    time: t("home.atTime", { time: date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) }),
  }
}

function isHealthyDiagnosis(disease) {
  const normalized = String(disease || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

  return ["saudavel", "healthy", "sem doenca", "normal"].some((term) => (
    normalized.includes(term)
  ))
}

function isValidDiagnosis(disease) {
  const normalized = String(disease || "").toLowerCase()
  return normalized && ![
    "desconhecido",
    "não identificado",
    "nao identificado",
    "formato não reconhecido",
    "formato nao reconhecido",
    "erro ao analisar imagem",
  ].includes(normalized)
}

const HOME_REVEAL_SELECTOR = [
  ".weather-stat-pill",
  ".home-field-card",
  ".quick-summary-card",
  ".flight-action-btn",
  ".admin-team-card",
  ".activity-card",
  ".empty-state",
  ".explore-card",
].join(", ")

export default function Home({ onInstallRequest, isInstalled = false }) {
  const { language, locale, t } = useLanguage()
  const [userData, setUserData] = useState(null)
  const [farmData, setFarmData] = useState(null)
  const [weather, setWeather] = useState(null)
  const [activities, setActivities] = useState([])
  const [diagnosticHistory, setDiagnosticHistory] = useState([])
  const [lastAiImageSubmission, setLastAiImageSubmission] = useState(null)
  const navigate = useNavigate()
  const goToInternalPage = (path, options) => {
    sessionStorage.setItem("zenithShowWhiteLoaderOnce", "true")
    navigate(path, options)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return
      }

      try {
        const accessProfile = await getUserAccessProfile(user.uid)
        setUserData(accessProfile)

        const q = query(
          collection(db, "farms"),
          where("ownerId", "==", user.uid)
        )

        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          const farm = snapshot.docs[0].data()
          setFarmData(farm)

          if (farm.municipio && farm.uf) {
            const weatherData = await getWeatherByCity(farm.municipio, farm.uf, language)
            setWeather(weatherData)
          }
        } else {
          setFarmData(null)
          setWeather(null)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      }
    })

    return () => unsubscribe()
  }, [language])

  useEffect(() => {
    const syncLocalData = () => {
      setDiagnosticHistory(readStoredArray("diagnosticHistory"))
      setLastAiImageSubmission(localStorage.getItem("lastAiImageSubmission"))
    }

    syncLocalData()
    window.addEventListener("storage", syncLocalData)
    window.addEventListener("focus", syncLocalData)

    return () => {
      window.removeEventListener("storage", syncLocalData)
      window.removeEventListener("focus", syncLocalData)
    }
  }, [])

  useEffect(() => {
    let unsubscribeActivities = null

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeActivities?.()
      unsubscribeActivities = null

      if (!user) {
        setActivities([])
        return
      }

      unsubscribeActivities = onSnapshot(
        query(collection(db, "activities"), where("ownerId", "==", user.uid)),
        (snapshot) => {
          setActivities(snapshot.docs.map((activityDoc) => ({
            id: activityDoc.id,
            ...activityDoc.data(),
          })))
        },
        (error) => {
          console.error("Erro ao sincronizar atividades da home:", error)
          setActivities([])
        }
      )
    })

    return () => {
      unsubscribeAuth()
      unsubscribeActivities?.()
    }
  }, [])

  useLayoutEffect(() => {
    const container = document.querySelector(".home-container")
    if (!container) return undefined

    const shouldReduceEffects = window.matchMedia(
      "(max-width: 768px), (pointer: coarse), (prefers-reduced-motion: reduce)"
    ).matches
    if (shouldReduceEffects) return undefined

    const trackedElements = new Set()
    const observedElements = new WeakSet()
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const revealElement = (element) => {
      element.classList.add("is-visible")
      observer.unobserve(element)

      const finishReveal = () => {
        element.classList.remove("home-scroll-reveal", "is-visible")
        element.style.removeProperty("--home-reveal-delay")
      }

      if (prefersReducedMotion) {
        finishReveal()
      } else {
        element.addEventListener("transitionend", finishReveal, { once: true })
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) revealElement(entry.target)
      })
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -7% 0px",
    })

    const registerElements = (root = container) => {
      const elements = []
      if (root instanceof Element && root.matches(HOME_REVEAL_SELECTOR)) elements.push(root)
      elements.push(...root.querySelectorAll(HOME_REVEAL_SELECTOR))

      elements.forEach((element, index) => {
        if (observedElements.has(element)) return
        observedElements.add(element)
        trackedElements.add(element)
        element.style.setProperty("--home-reveal-delay", `${(index % 3) * 65}ms`)
        element.classList.add("home-scroll-reveal")
        observer.observe(element)
      })
    }

    registerElements()

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) registerElements(node)
        })
      })
    })

    mutationObserver.observe(container, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
      trackedElements.forEach((element) => {
        element.classList.remove("home-scroll-reveal", "is-visible")
        element.style.removeProperty("--home-reveal-delay")
      })
    }
  }, [])

  const hasFarm = !!farmData
  const userName = userData?.name?.split(' ')[0]
  const cityName = farmData?.municipio && farmData?.uf
    ? `${farmData.municipio}, ${farmData.uf}`
    : farmData?.municipio
  const currentTemperature = hasFarm && weather?.temperature !== undefined ? weather.temperature : "--"
  const humidityValue = hasFarm && weather?.humidity !== undefined ? `${weather.humidity}%` : "--"
  const farmArea = farmData?.area_total ? `${farmData.area_total} ha` : "--"
  const fieldYield = farmData?.produtividade || farmData?.rendimento || "7200 kg/ha"
  const cropName = farmData?.plantacao || farmData?.crop || "Soja"
  const weatherVisual = getWeatherVisual(weather, t)
  const WeatherConditionIcon = weatherVisual.Icon
  const latestDiagnosis = [...diagnosticHistory]
    .sort((a, b) => parseDiagnosticDate(b) - parseDiagnosticDate(a))[0]
  const lastFlightSummary = formatDiagnosticTimestamp(
    lastAiImageSubmission ? { submittedAt: lastAiImageSubmission } : latestDiagnosis,
    locale,
    t
  )
  const diagnosisIsValid = isValidDiagnosis(latestDiagnosis?.disease)
  const diagnosisIsHealthy = diagnosisIsValid && isHealthyDiagnosis(latestDiagnosis?.disease)
  const overdueActivities = activities.filter((activity) => {
    if (!activity?.date || ["concluida", "cancelada"].includes(activity.status)) return false
    const dueDate = parseActivityDate(activity)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dueDate < today
  })
  const hasWeatherAlert = Number(weather?.conditionCode) >= 200 && Number(weather?.conditionCode) < 300
  const alertCount = overdueActivities.length + (diagnosisIsValid && !diagnosisIsHealthy ? 1 : 0) + (hasWeatherAlert ? 1 : 0)
  const healthSummary = !hasFarm
    ? { value: t("home.awaiting"), detail: t("home.registerFarmShort") }
    : !latestDiagnosis
      ? { value: t("home.noAnalysis"), detail: t("home.makeDiagnosis") }
      : !diagnosisIsValid
        ? { value: t("home.inconclusive"), detail: t("home.repeatAnalysis") }
        : diagnosisIsHealthy
          ? { value: t("home.good"), detail: t("home.confidence", { value: latestDiagnosis.confidence ?? "--" }) }
          : { value: t("home.attention"), detail: String(latestDiagnosis.disease).replaceAll("_", " ") }
  const alertSummary = !hasFarm
    ? { value: t("home.noData"), detail: t("home.registerFarmShort") }
    : alertCount === 0
      ? { value: t("home.noAlerts"), detail: t("home.allGood") }
      : {
          value: `${alertCount} ${alertCount === 1 ? t("home.alert") : t("home.alertPlural")}`,
          detail: hasWeatherAlert
            ? weather.conditionDescription
            : overdueActivities.length > 0
              ? `${overdueActivities.length} ${overdueActivities.length === 1 ? t("home.overdueActivity") : t("home.overdueActivities")}`
              : String(latestDiagnosis.disease).replaceAll("_", " "),
        }
  const weatherStats = [
    { icon: "device_thermostat", label: t("home.soil"), value: hasFarm ? "+23 °C" : "--" },
    { icon: "humidity_percentage", label: t("home.humidity"), value: humidityValue },
    { icon: "air", label: t("home.wind"), value: hasFarm ? "7 m/s" : "--" },
    { icon: "rainy", label: t("home.precipitation"), value: hasFarm ? "0 mm" : "--" },
  ]

  return (
    <>
      <ParticleBackground />
      <MouseGlow />

      <main className="home-shell" data-system-bar-color="#f7f5f0">
        <AppHeader
          userName={userName}
          hasFarm={hasFarm}
          farmName={farmData?.name}
          cityName={cityName}
          onRegister={() => navigate("/cadastrar-fazenda")}
          showNotification={true}
          showHomeContent={true}
        />
      
        <div className="home-container">
        <section className="home-weather-hero">
          <div className="weather-background-details" aria-hidden="true">
            <span className="weather-bg-leaf weather-bg-leaf--one"></span>
            <span className="weather-bg-leaf weather-bg-leaf--two"></span>
            <span className="weather-bg-leaf weather-bg-leaf--three"></span>
            <span className="weather-bg-leaf weather-bg-leaf--four"></span>
            <span className="weather-bg-spark weather-bg-spark--one"></span>
            <span className="weather-bg-spark weather-bg-spark--two"></span>
          </div>
          <div className="weather-hero-top">
            <div>
              <div className="weather-reading">
                <div className="weather-main-value">
                  <strong>{currentTemperature}</strong>
                  {currentTemperature !== "--" && <span>°</span>}
                </div>
                <span
                  className={`weather-condition-art weather-condition-art--${weatherVisual.variant}`}
                  role="img"
                  aria-label={weatherVisual.label}
                  title={weatherVisual.label}
                >
                  <WeatherConditionIcon aria-hidden="true" strokeWidth={2.15} />
                </span>
              </div>
              <p>{weatherVisual.label}</p>
              <strong className="weather-farm-label">
                {farmData?.name || t("header.registerFarm")}
              </strong>
            </div>

            <div className="weather-illustration" aria-hidden="true">
              <img src="/assets/image/soja-hero-cutout.png" alt="" />
              <span className="soy-tip-detail"></span>
              <span className="soy-leaf-fade"></span>
            </div>
          </div>

          <div className="weather-stat-grid">
            {weatherStats.map((stat) => (
              <article className="weather-stat-pill" key={stat.label}>
                <span className="material-symbols-outlined">{stat.icon}</span>
                <div>
                  <small>{stat.label}</small>
                  <strong>{stat.value}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-field-card">
          <div className="field-card-header">
            <div className="field-orb">
              <span className="material-symbols-outlined">agriculture</span>
            </div>
            <div>
              <strong>{farmData?.name || t("home.myFarm")}</strong>
              <span>
                <span className="material-symbols-outlined">location_on</span>
                {cityName || t("home.locationMissing")}
              </span>
            </div>
            <em>{fieldYield}</em>
          </div>

          <div className="field-image-wrap">
            <img src="/assets/image/Fundo_landing.jpg" alt="" />
            <div className="field-image-overlay">
              <span>{cropName}</span>
              <strong>{farmArea}</strong>
            </div>
          </div>
        </section>

        <section className="home-quick-summary" aria-labelledby="quick-summary-title">
          <h2 id="quick-summary-title" className="section-title">
            <span className="material-symbols-outlined">insights</span>
            {t("home.quickSummary")}
          </h2>
          <div className="quick-summary-grid">
            <article className="quick-summary-card">
              <div className="quick-summary-heading">
                <span className="material-symbols-outlined">flight</span>
                <small>{t("home.lastFlight")}</small>
              </div>
              <strong>{lastFlightSummary.date}</strong>
              <p>{lastFlightSummary.time}</p>
            </article>

            <article className="quick-summary-card">
              <div className="quick-summary-heading">
                <span className="material-symbols-outlined">eco</span>
                <small>{t("home.cropHealth")}</small>
              </div>
              <strong>{healthSummary.value}</strong>
              <p>{healthSummary.detail}</p>
            </article>

            <article className="quick-summary-card quick-summary-card--alert">
              <div className="quick-summary-heading">
                <span className="material-symbols-outlined">warning</span>
                <small>{t("home.alerts")}</small>
              </div>
              <strong>{alertSummary.value}</strong>
              <p>{alertSummary.detail}</p>
            </article>
          </div>
        </section>

        {hasFarm && (
          <FlightActionButton
            onNavigate={() => goToInternalPage("/explore", { state: { activeTab: "diagnostico" } })}
          />
        )}

        {!isInstalled && onInstallRequest && (
          <section className="install-app-section">
            <button className="install-app-trigger" type="button" onClick={onInstallRequest}>
              <span className="install-app-trigger__icon" aria-hidden="true">
                <span className="material-symbols-outlined">download</span>
              </span>
              <span className="install-app-trigger__text">
                <strong>{t("home.downloadApp")}</strong>
                <small>{t("home.installZenith")}</small>
              </span>
              <span className="install-app-trigger__arrow material-symbols-outlined" aria-hidden="true">
                chevron_right
              </span>
            </button>
          </section>
        )}

        {!isOperationalRole(userData?.role) && (
          <section className="admin-team-section">
            <button
              className="admin-team-card"
              onClick={() => goToInternalPage("/admin/team")}
            >
              <span className="material-symbols-outlined">groups</span>
              <div>
                <strong>{t("home.teamDashboard")}</strong>
                <p>{t("home.teamDashboardDescription")}</p>
              </div>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </section>
        )}

        <section className="activities-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="material-symbols-outlined">history</span>
              {t("home.recentActivities")}
            </h2>
            {hasFarm && (
              <button 
                className="view-all-btn" 
                onClick={() => goToInternalPage("/explore", { state: { activeTab: "atividades" } })}
              >
                <span>{t("home.viewAll")}</span>
                <span className="material-symbols-outlined">arrow_forward</span>
                <div className="btn-glow"></div>
              </button>
            )}
          </div>

          <ActivitiesList 
            hasFarm={hasFarm}
            onViewAll={() => goToInternalPage("/explore", { state: { activeTab: "atividades" } })}
            onRegister={() => navigate("/cadastrar-fazenda")}
          />
        </section>

        <ExploreModules />
        <AppFooter />
        </div>
      </main>

      <MenuBar />
    </>
  )
}
