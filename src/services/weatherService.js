const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "d77668673cf15b7d0488f921007cbd6b"
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5"
const GEOCODING_API_URL = "https://api.openweathermap.org/geo/1.0"

function getWeatherApiLanguage(language = "pt-BR") {
  if (String(language).toLowerCase().startsWith("en")) return "en"
  if (String(language).toLowerCase().startsWith("es")) return "es"
  return "pt_br"
}

async function fetchWeatherJson(url) {
  const response = await fetch(url, { cache: "no-store" })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.message || "Não foi possível consultar os dados meteorológicos")
  }

  return data
}

async function resolveCityCoordinates(city, state) {
  const query = encodeURIComponent(`${city},${state},BR`)
  const locations = await fetchWeatherJson(
    `${GEOCODING_API_URL}/direct?q=${query}&limit=1&appid=${API_KEY}`
  )

  if (!locations.length) {
    throw new Error("Localização da fazenda não encontrada")
  }

  return locations[0]
}

export async function getWeatherBundleByCity(city, state, language = "pt-BR") {
  let location
  let target

  try {
    location = await resolveCityCoordinates(city, state)
    target = `lat=${location.lat}&lon=${location.lon}`
  } catch (geocodingError) {
    console.warn("Geocodificação indisponível; usando município como fallback:", geocodingError)
    location = { name: city, lat: null, lon: null }
    target = `q=${encodeURIComponent(`${city},${state},BR`)}`
  }

  const options = `appid=${API_KEY}&units=metric&lang=${getWeatherApiLanguage(language)}`
  const [weatherResult, forecastResult] = await Promise.allSettled([
    fetchWeatherJson(`${WEATHER_API_URL}/weather?${target}&${options}`),
    fetchWeatherJson(`${WEATHER_API_URL}/forecast?${target}&${options}`),
  ])

  if (weatherResult.status === "rejected") throw weatherResult.reason

  if (forecastResult.status === "rejected") {
    console.warn("Previsão meteorológica indisponível:", forecastResult.reason)
  }

  return {
    weather: weatherResult.value,
    forecast: forecastResult.status === "fulfilled" ? forecastResult.value : null,
    location,
  }
}

export async function getWeatherByCity(city, state, language = "pt-BR") {
  try {
    let target

    try {
      const location = await resolveCityCoordinates(city, state)
      target = `lat=${location.lat}&lon=${location.lon}`
    } catch {
      target = `q=${encodeURIComponent(`${city},${state},BR`)}`
    }

    const data = await fetchWeatherJson(
      `${WEATHER_API_URL}/weather?${target}&appid=${API_KEY}&units=metric&lang=${getWeatherApiLanguage(language)}`
    )

    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      conditionCode: data.weather?.[0]?.id,
      conditionIcon: data.weather?.[0]?.icon,
      conditionDescription: data.weather?.[0]?.description || "Clima atual"
    }
  } catch (error) {
    console.error("Erro ao buscar clima:", error)
    return null
  }
}
