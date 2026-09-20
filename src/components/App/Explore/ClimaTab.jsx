import { useState, useEffect } from "react"
import { useFarm } from "./hooks/useFarm"
import { getWeatherBundleByCity } from "../../../services/weatherService"
import { useLanguage } from "../../../contexts/LanguageContext"
import "../../../styles/App/Explore.css"
import "../../../styles/App/ClimaTab.css"

const getLocationDateKey = (unixSeconds, timezoneOffset = 0) =>
  new Date((unixSeconds + timezoneOffset) * 1000).toISOString().slice(0, 10)

const formatLocationTime = (unixSeconds, timezoneOffset = 0, locale = "pt-BR") =>
  new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date((unixSeconds + timezoneOffset) * 1000))

const capitalize = (value = "") => value.charAt(0).toUpperCase() + value.slice(1)

const buildDailyForecast = (items = [], timezoneOffset = 0, referenceUnix = Date.now() / 1000, locale = "pt-BR", t) => {
  const todayKey = getLocationDateKey(referenceUnix, timezoneOffset)
  const tomorrowKey = getLocationDateKey(referenceUnix + 86400, timezoneOffset)
  const groupedDays = new Map()

  items.forEach((item) => {
    const dateKey = getLocationDateKey(item.dt, timezoneOffset)
    if (dateKey === todayKey) return

    if (!groupedDays.has(dateKey)) groupedDays.set(dateKey, [])
    groupedDays.get(dateKey).push(item)
  })

  return Array.from(groupedDays.entries()).slice(0, 5).map(([dateKey, dayItems]) => {
    const representative = dayItems.reduce((closest, item) => {
      const locationHour = new Date((item.dt + timezoneOffset) * 1000).getUTCHours()
      const closestHour = new Date((closest.dt + timezoneOffset) * 1000).getUTCHours()
      return Math.abs(locationHour - 12) < Math.abs(closestHour - 12) ? item : closest
    })
    const locationDate = new Date((representative.dt + timezoneOffset) * 1000)
    const weekday = new Intl.DateTimeFormat(locale, {
      weekday: "short",
      timeZone: "UTC",
    }).format(locationDate).replace(".", "")
    const date = new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC",
    }).format(locationDate)

    return {
      dateKey,
      dayLabel: dateKey === tomorrowKey ? t("climate.tomorrow") : capitalize(weekday),
      date,
      description: representative.weather?.[0]?.description || t("climate.dailyForecast"),
      icon: representative.weather?.[0]?.icon || "03d",
      tempMin: Math.round(Math.min(...dayItems.map((item) => item.main.temp_min))),
      tempMax: Math.round(Math.max(...dayItems.map((item) => item.main.temp_max))),
      rainChance: Math.round(Math.max(...dayItems.map((item) => (item.pop || 0) * 100))),
      rainVolume: dayItems.reduce((total, item) => total + (item.rain?.["3h"] || 0), 0),
    }
  })
}

const formatWeatherNumber = (value, maximumFractionDigits = 1, locale = "pt-BR") => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "N/D"
  return Number(value).toLocaleString(locale, { maximumFractionDigits })
}

export default function ClimaTab() {
  const { language, locale, t } = useLanguage()
  const { farmData, loading: farmLoading } = useFarm()

  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedRecommendation, setExpandedRecommendation] = useState(null)

  const fetchWeather = async (silent = false) => {
    if (!farmData) {
      if (!silent) {
        setError(t("climate.noFarm"))
        setLoading(false)
      }
      return
    }

    if (!farmData.municipio || !farmData.uf) {
      if (!silent) {
        setError(t("climate.incompleteLocation"))
        setLoading(false)
      }
      return
    }

    if (!silent) setLoading(true)

    try {
      const state = farmData.uf
      const { weather, forecast, location } = await getWeatherBundleByCity(
        farmData.municipio,
        state,
        language
      )

      const timezoneOffset = weather.timezone || 0

      let minTempDay = weather.main.temp
      let maxTempDay = weather.main.temp

      if (forecast && Number(forecast.cod) === 200) {
        const today = getLocationDateKey(weather.dt, timezoneOffset)
        const todayList = forecast.list.filter((item) =>
          getLocationDateKey(item.dt, timezoneOffset) === today
        )

        if (todayList.length > 0) {
          minTempDay = Math.min(...todayList.map((item) => item.main.temp_min))
          maxTempDay = Math.max(...todayList.map((item) => item.main.temp_max))
        }
      }

      setWeatherData({
          city: weather.name,
          state,
          farmName: farmData.name,

          temperature: Math.round(weather.main.temp),
          feelsLike: Math.round(weather.main.feels_like),

          tempMin: Math.round(minTempDay),
          tempMax: Math.round(maxTempDay),

          humidity: weather.main.humidity,
          pressure: weather.main.pressure,

          windSpeed: weather.wind.speed,
          windDeg: weather.wind.deg,
          windGust: weather.wind.gust ?? null,

          rain: weather.rain?.["1h"] ?? 0,

          description: weather.weather[0].description,
          icon: weather.weather[0].icon,
          clouds: weather.clouds.all,

          visibility: weather.visibility === undefined ? null : weather.visibility / 1000,

          sunrise: formatLocationTime(weather.sys.sunrise, timezoneOffset, locale),
          sunset: formatLocationTime(weather.sys.sunset, timezoneOffset, locale),

          date: new Intl.DateTimeFormat(locale, {
            weekday: "long",
            day: "numeric",
            month: "long",
            timeZone: "UTC",
          }).format(new Date((weather.dt + timezoneOffset) * 1000)),
          forecastDays: forecast && Number(forecast.cod) === 200
            ? buildDailyForecast(forecast.list, timezoneOffset, weather.dt, locale, t)
            : [],
          updatedAt: formatLocationTime(weather.dt, timezoneOffset, locale),
          sourceLocation: location.name,
          coordinates: location.lat !== null && location.lon !== null
            ? { latitude: location.lat, longitude: location.lon }
            : null,
        })
      setError(null)
    } catch (err) {
      console.error(err)
      if (!silent) {
        setError(
          err instanceof TypeError
            ? t("climate.noConnection")
            : (err.message || t("climate.fetchError"))
        )
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    if (farmLoading) return undefined

    fetchWeather()
    const refreshInterval = window.setInterval(() => fetchWeather(true), 10 * 60 * 1000)
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") fetchWeather(true)
    }

    document.addEventListener("visibilitychange", refreshWhenVisible)

    return () => {
      window.clearInterval(refreshInterval)
      document.removeEventListener("visibilitychange", refreshWhenVisible)
    }
  }, [farmData?.municipio, farmData?.uf, farmLoading, language, locale, t])

  const getWindDirection = (deg) => {
    if (!Number.isFinite(deg)) return "N/D"
    const dirs = language === "en"
      ? ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
      : ["N", "NE", "L", "SE", "S", "SO", "O", "NO"]
    return dirs[Math.round(deg / 45) % 8]
  }

  const getWeatherSymbol = (iconCode) => {
    const code = iconCode?.slice(0, 2)
    const symbols = {
      "01": "sunny",
      "02": "partly_cloudy_day",
      "03": "cloud",
      "04": "cloud",
      "09": "rainy",
      "10": "rainy",
      "11": "thunderstorm",
      "13": "weather_snowy",
      "50": "foggy",
    }

    return symbols[code] || "cloud"
  }

  const retry = () => fetchWeather()

  // Gerar recomendações
  const getRecommendations = () => {
    if (!weatherData) return []

    const recommendations = []

    // Solo seco
    if (weatherData.humidity < 50 && weatherData.rain === 0) {
      recommendations.push({
        kind: "humidity",
        type: "warning",
        icon: "water_drop",
        title: t("climate.drySoil"),
        message: t("climate.irrigationRecommended")
      })
    }

    // Alta umidade
    if (weatherData.humidity > 80) {
      recommendations.push({
        kind: "humidity",
        type: "warning",
        icon: "humidity_high",
        title: t("climate.highHumidity"),
        message: t("climate.fungusRisk")
      })
    }

    // Calor intenso
    if (weatherData.temperature > 32) {
      recommendations.push({
        kind: "temperature",
        type: "warning",
        icon: "whatshot",
        title: t("climate.intenseHeat"),
        message: t("climate.protectFromSun")
      })
    }

    // Temperatura baixa
    if (weatherData.temperature < 15) {
      recommendations.push({
        kind: "temperature",
        type: "warning",
        icon: "ac_unit",
        title: t("climate.lowTemperature"),
        message: t("climate.frostRisk")
      })
    }

    // Vento forte
    if (weatherData.windSpeed > 8) {
      recommendations.push({
        kind: "wind",
        type: "warning",
        icon: "wind_power",
        title: t("climate.strongWind"),
        message: t("climate.avoidSpraying")
      })
    }

    // Chuva forte
    if (weatherData.rain > 5) {
      recommendations.push({
        kind: "rain",
        type: "info",
        icon: "rainy",
        title: t("climate.heavyRain"),
        message: t("climate.checkDrainage")
      })
    }

    // Condições ideais
    if (weatherData.humidity >= 50 && weatherData.humidity <= 70 && 
        weatherData.temperature >= 20 && weatherData.temperature <= 30 && 
        weatherData.windSpeed <= 5 && weatherData.rain === 0) {
      recommendations.push({
        kind: "general",
        type: "success",
        icon: "sentiment_satisfied",
        title: t("climate.idealConditions"),
        message: t("climate.perfectForField")
      })
    }

    // 🌟 RECOMENDAÇÃO PADRÃO - Sempre mostrar pelo menos uma recomendação
    if (recommendations.length === 0) {
      recommendations.push({
        kind: "general",
        type: "info",
        icon: "agriculture",
        title: t("climate.stableWeather"),
        message: t("climate.normalConditions")
      })
    }

    return recommendations
  }

  // LOADING
  if (loading || farmLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--primary)' }}>cloud</span>
          </div>
          <h3 style={styles.loadingTitle}>{t("climate.searching")}</h3>
          <p style={styles.loadingText}>
            {farmData ? t("climate.fetchingFor", { city: farmData.municipio }) : t("climate.loading")}
          </p>
        </div>
      </div>
    )
  }

  // ERRO
  if (error || !weatherData) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--danger)' }}>error</span>
          </div>
          <h3 style={styles.errorTitle}>{t("climate.errorTitle")}</h3>
          <p style={styles.errorText}>{error || t("climate.noData")}</p>
          {farmData && (
            <button style={styles.retryButton} onClick={retry}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
              {t("climate.retry")}
            </button>
          )}
        </div>
      </div>
    )
  }

  const recommendations = getRecommendations()
  const updatedTime = weatherData.updatedAt
  const getRecommendationAccent = (type) => {
    if (type === "warning") return "#ffaa00"
    if (type === "success") return "#56a870"
    return "#0066ff"
  }

  const getRecommendationDetails = (kind) => {
    if (kind === "humidity") {
      return t("climate.humidityRainDetails", {
        humidity: weatherData.humidity,
        rain: formatWeatherNumber(weatherData.rain, 1, locale),
      })
    }
    if (kind === "temperature") {
      return t("climate.temperatureDetails", {
        temperature: weatherData.temperature,
        feelsLike: weatherData.feelsLike,
      })
    }
    if (kind === "wind") {
      return t("climate.windDetails", {
        wind: formatWeatherNumber(weatherData.windSpeed, 1, locale),
        gust: formatWeatherNumber(weatherData.windGust, 1, locale),
      })
    }
    if (kind === "rain") {
      return t("climate.rainDetails", {
        rain: formatWeatherNumber(weatherData.rain, 1, locale),
      })
    }
    return t("climate.generalDetails", {
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      wind: formatWeatherNumber(weatherData.windSpeed, 1, locale),
    })
  }

  return (
    <div className="climate-dashboard">
      <section className="climate-hero">
        <header className="climate-location">
          <h1>{weatherData.city}, {weatherData.state}</h1>
          <p>
            <span className="material-symbols-outlined" aria-hidden="true">calendar_today</span>
            {weatherData.date}
          </p>
        </header>

        <div className="climate-overview-card">
          <div className="climate-reading">
            <div className="climate-condition">
              <span
                className={`material-symbols-outlined climate-weather-icon climate-weather-icon--${weatherData.icon?.slice(0, 2) || "default"}`}
                aria-hidden="true"
              >
                {getWeatherSymbol(weatherData.icon)}
              </span>
              <strong>{weatherData.description}</strong>
            </div>
            <div className="climate-temperature" aria-label={t("climate.degreesCelsius", { value: weatherData.temperature })}>
              <strong>{weatherData.temperature}</strong>
              <span>°C</span>
            </div>
          </div>

          <div className="climate-highlights">
            <div>
              <span className="material-symbols-outlined climate-min-icon">arrow_downward</span>
              <small>{t("climate.minimum")}</small>
              <strong>{weatherData.tempMin}°</strong>
            </div>
            <div>
              <span className="material-symbols-outlined climate-max-icon">arrow_upward</span>
              <small>{t("climate.maximum")}</small>
              <strong>{weatherData.tempMax}°</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="climate-metrics" aria-labelledby="climate-metrics-title">
        <header className="climate-section-heading">
          <h2 id="climate-metrics-title">
            <span className="material-symbols-outlined" aria-hidden="true">monitoring</span>
            {t("climate.metrics")}
          </h2>
          <span className="climate-section-chip">{t("climate.today")}</span>
        </header>

        <div className="climate-stats" aria-label={t("climate.details")}>
          {[
            ["humidity_percentage", t("home.humidity"), `${weatherData.humidity}%`],
            ["air", t("home.wind"), `${formatWeatherNumber(weatherData.windSpeed, 1, locale)} m/s`, getWindDirection(weatherData.windDeg)],
            ["speed", t("climate.pressure"), `${weatherData.pressure} hPa`],
            ["rainy", t("climate.rain1h"), `${formatWeatherNumber(weatherData.rain, 1, locale)} mm`],
            ["airwave", t("climate.gust"), weatherData.windGust === null ? "N/D" : `${formatWeatherNumber(weatherData.windGust, 1, locale)} m/s`],
            ["visibility", t("climate.visibility"), `${formatWeatherNumber(weatherData.visibility, 1, locale)} km`],
            ["cloud", t("climate.clouds"), `${weatherData.clouds}%`],
            ["wb_twilight", t("climate.sunrise"), weatherData.sunrise],
            ["dark_mode", t("climate.sunset"), weatherData.sunset],
            ["update", t("climate.apiUpdated"), updatedTime],
          ].map(([icon, label, value, detail]) => (
            <article className="climate-stat-card" key={label}>
              <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
              <div>
                <small>{label}</small>
                <strong>{value}</strong>
                {detail && <em>{detail}</em>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="climate-forecast" aria-labelledby="climate-forecast-title">
        <header className="climate-section-heading">
          <h2 id="climate-forecast-title">
            <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
            {t("climate.nextDays")}
          </h2>
          <p>{t("climate.planningForecast")}</p>
        </header>

        {weatherData.forecastDays.length > 0 ? (
          <div className="climate-forecast-grid">
            {weatherData.forecastDays.map((day) => (
              <article className="climate-forecast-card" key={day.dateKey}>
                <header>
                  <div>
                    <strong>{day.dayLabel}</strong>
                    <small>{day.date}</small>
                  </div>
                  <span
                    className={`material-symbols-outlined climate-forecast-icon climate-weather-icon--${day.icon.slice(0, 2)}`}
                    aria-hidden="true"
                  >
                    {getWeatherSymbol(day.icon)}
                  </span>
                </header>
                <p>{day.description}</p>
                <div className="climate-forecast-temperature">
                  <strong>{day.tempMax}°</strong>
                  <span>{day.tempMin}°</span>
                </div>
                <footer>
                  <span className="material-symbols-outlined" aria-hidden="true">water_drop</span>
                  <strong>{day.rainChance}%</strong>
                  <span>· {formatWeatherNumber(day.rainVolume, 1, locale)} mm</span>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <div className="climate-forecast-empty">
            <span className="material-symbols-outlined" aria-hidden="true">cloud_off</span>
            {t("climate.forecastUnavailable")}
          </div>
        )}
      </section>

      <section className="climate-recommendations">
        <h2>
          <span className="material-symbols-outlined" aria-hidden="true">eco</span>
          {t("climate.recommendations")}
        </h2>
        <div className="climate-recommendation-list">
          {recommendations.map((rec, index) => (
            <article
              className={`climate-recommendation climate-recommendation--${rec.type} ${expandedRecommendation === index ? "is-expanded" : ""}`}
              key={`${rec.title}-${index}`}
              style={{ "--recommendation-accent": getRecommendationAccent(rec.type) }}
            >
              <span className="material-symbols-outlined" aria-hidden="true">{rec.icon}</span>
              <div>
                <strong>{rec.title}</strong>
                <p>{rec.message}</p>
              </div>
              <button
                type="button"
                className="climate-recommendation-details-button"
                aria-expanded={expandedRecommendation === index}
                onClick={() => setExpandedRecommendation(expandedRecommendation === index ? null : index)}
              >
                {expandedRecommendation === index ? t("climate.hide") : t("climate.viewDetails")}
                <span className="material-symbols-outlined" aria-hidden="true">
                  {expandedRecommendation === index ? "expand_less" : "chevron_right"}
                </span>
              </button>
              {expandedRecommendation === index && (
                <p className="climate-recommendation-details">
                  {getRecommendationDetails(rec.kind)}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <p className="climate-updated">
        <span className="material-symbols-outlined" aria-hidden="true">update</span>
        OpenWeather · {weatherData.sourceLocation} · {t("climate.updatedAt", { time: updatedTime })}
      </p>
    </div>
  )
}

// Estilos responsivos com design mais clean
const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '12px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    width: '100%',
    boxSizing: 'border-box',
  },

  // Card principal
  mainCard: {
    background: '#f7f5f0',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--border)',
    borderRadius: '28px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 10px 30px var(--primary-glow)',
    width: '100%',
    boxSizing: 'border-box',
  },
  mainCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  cityName: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: 'var(--g4)',
    margin: '0 0 4px 0',
    lineHeight: 1.2,
  },
  date: {
    fontSize: '0.85rem',
    color: 'var(--muted)',
    margin: 0,
    textTransform: 'capitalize',
    display: 'flex',
    alignItems: 'center',
  },
  weatherIcon: {
    textAlign: 'center',
    background: '#f7f5f0',
    boxShadow: '0 10px 30px var(--primary-glow)',
    padding: '12px 16px',
    borderRadius: '20px',
    border: '1px solid var(--border)',
    minWidth: '100px',
  },
  weatherSymbol: {
    display: 'block',
    fontSize: '38px',
    color: 'var(--g4)',
    lineHeight: 1,
    marginBottom: '8px',
  },
  weatherDesc: {
    fontSize: '0.8rem',
    color: 'var(--ink)',
    margin: '2px 0 0 0',
    textTransform: 'capitalize',
  },

  // Temperatura
  tempSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  tempCircle: {
    position: 'relative',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(145deg, var(--g4) 0%, var(--g5) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 18px 34px rgba(45, 97, 64, 0.28), inset 0 1px 0 rgba(255,255,255,0.18)',
    border: '1px solid rgba(255,255,255,0.18)',
  },
  tempValue: {
    fontSize: '3rem',
    fontWeight: '700',
    color: '#fff',
  },
  tempUnit: {
    fontSize: '1rem',
    color: '#fff',
    alignSelf: 'flex-start',
    marginTop: '20px',
  },
  tempDetails: {
    flex: 1,
    minWidth: '140px',
  },
  tempDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--muted)',
    marginBottom: '6px',
    fontSize: '0.9rem',
  },
  tempRange: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  tempRangeItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    maxWidth: '150px',
  },
  tempRangeLabel: {
    color: 'var(--muted)',
    fontSize: '0.78rem',
    fontWeight: '600',
  },
  tempRangeIcon: {
    fontSize: '16px',
    verticalAlign: 'middle',
  },
  tempMin: {
    color: 'var(--g4)',
    fontWeight: '700',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  tempMax: {
    color: '#d58a00',
    fontWeight: '700',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },

  // Grid de estatísticas
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  statCard: {
    background: '#f7f5f0',
    boxShadow: '0 10px 30px var(--primary-glow)',
    border: '1px solid var(--border)',
    borderRadius: '18px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'transform 0.2s',
  },
  statIcon: {
    fontSize: '22px',
    color: 'var(--primary)',
    minWidth: '32px',
  },
  statInfo: {
    flex: 1,
    minWidth: 0,
  },
  statLabel: {
    display: 'block',
    fontSize: '0.65rem',
    color: 'var(--muted)',
    marginBottom: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  statValue: {
    fontSize: '0.95rem',
    color: 'var(--ink)',
    fontWeight: '600',
    display: 'inline-block',
    marginRight: '4px',
  },
  statSub: {
    fontSize: '0.65rem',
    color: '#6b7280',
    marginLeft: '2px',
  },

  // Recomendações
  recommendationsCard: {
    background: '#f7f5f0',
    boxShadow: '0 10px 30px var(--primary-glow)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '28px',
    padding: '20px',
    marginBottom: '16px',
    width: '100%',
    boxSizing: 'border-box',
  },
  recommendationsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--ink)',
    fontSize: '1.1rem',
    margin: '0 0 16px 0',
    fontWeight: '500',
  },
  recommendationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  recommendation: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    background: '#f7f5f0',
    boxShadow: '0 10px 30px var(--primary-glow)',
    border: '1px solid var(--border)',
    borderRadius: '18px',
    transition: 'all 0.2s',
  },
  recommendationWarning: {
    borderLeft: '4px solid #ffaa00',
    background: 'rgba(255,170,0,0.05)',
  },
  recommendationSuccess: {
    borderLeft: '4px solid #56a870',
    background: 'rgba(86,168,112,0.08)',
  },
  recommendationInfo: {
    borderLeft: '4px solid #0066ff',
    background: 'rgba(0,102,255,0.05)',
  },
  recommendationIcon: {
    fontSize: '22px',
    color: 'var(--primary)',
    minWidth: '32px',
  },
  recommendationText: {
    flex: 1,
  },
  recommendationTitleText: {
    color: 'var(--g1)',
    display: 'block',
    fontWeight: '700',
    marginBottom: '2px',
  },
  recommendationMessage: {
    color: 'var(--g1)',
    margin: 0,
    fontSize: '0.9rem',
    lineHeight: 1.35,
  },

  // Loading e erro
  loadingContainer: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    width: '100%',
    boxSizing: 'border-box',
  },
  loadingCard: {
    background: '#f7f5f0',
    boxShadow: '0 10px 30px var(--primary-glow)',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--border)',
    borderRadius: '28px',
    padding: '32px 24px',
    textAlign: 'center',
    width: '100%',
    maxWidth: '280px',
  },
  loadingIcon: {
    marginBottom: '14px',
  },
  loadingTitle: {
    color: 'var(--ink)',
    margin: '0 0 6px 0',
    fontSize: '1.2rem',
  },
  loadingText: {
    color: 'var(--muted)',
    margin: 0,
    fontSize: '0.9rem',
  },
  errorCard: {
    background: '#f7f5f0',
    boxShadow: '0 10px 30px var(--primary-glow)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,68,68,0.2)',
    borderRadius: '28px',
    padding: '32px 24px',
    textAlign: 'center',
    width: '100%',
    maxWidth: '280px',
  },
  errorIcon: {
    marginBottom: '14px',
  },
  errorTitle: {
    color: '#ff4d4d',
    margin: '0 0 6px 0',
    fontSize: '1.2rem',
  },
  errorText: {
    color: 'var(--muted)',
    margin: '0 0 16px 0',
    fontSize: '0.9rem',
  },
  retryButton: {
    minHeight: '42px',
    background: '#2d6140',
    border: '1px solid #2d6140',
    borderRadius: '10px',
    padding: '10px 18px',
    color: '#fff',
    fontWeight: '750',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 8px 18px rgba(45, 97, 64, 0.18)',
  },

  // Footer
  footer: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    marginTop: '8px',
  },
}
