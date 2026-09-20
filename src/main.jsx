import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import './index.css'

window.__zenithDeferredInstallPrompt = null

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  window.__zenithDeferredInstallPrompt = event
  window.dispatchEvent(new CustomEvent('zenith-install-prompt-ready', {
    detail: { prompt: event }
  }))
})

let refreshing = false
const isStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

function loadMaterialSymbols() {
  if (!document.fonts?.load) {
    document.documentElement.classList.remove("material-symbols-loading")
    return
  }

  document.fonts.load('20px "Material Symbols Outlined"')
    .then((fonts) => {
      if (fonts.length === 0) return
      document.documentElement.classList.remove("material-symbols-loading")
      document.documentElement.classList.add("material-symbols-ready")
    })
    .catch(() => {
      // Mantém os nomes internos dos ícones escondidos se a fonte não carregar.
    })
}

async function clearLegacyAppCaches() {
  if (!("caches" in window) || !navigator.onLine) return false

  try {
    const cacheNames = await caches.keys()
    const legacyCaches = cacheNames.filter((cacheName) => /^zenith-cache-v\d+$/i.test(cacheName))
    await Promise.all(legacyCaches.map((cacheName) => caches.delete(cacheName)))
    return legacyCaches.length > 0
  } catch {
    return false
  }
}

function registerServiceWorker() {
  if (import.meta.env.DEV || !("serviceWorker" in navigator)) return

  const register = () => {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" })
      .then((registration) => {
        console.log("Service Worker registrado")
        registration.update().catch(() => {})

        if (isStandaloneMode() && registration.waiting && navigator.serviceWorker.controller) {
          window.dispatchEvent(
            new CustomEvent("app-update-available", {
              detail: { registration, worker: registration.waiting }
            })
          )
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener("statechange", () => {
            if (
              isStandaloneMode() &&
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              window.dispatchEvent(
                new CustomEvent("app-update-available", {
                  detail: { registration, worker: newWorker }
                })
              )
            }
          })
        })
      })
      .catch((err) => {
        console.log("Erro ao registrar SW:", err)
      })
  }

  if (document.readyState === "complete") register()
  else window.addEventListener("load", register, { once: true })

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })
}

async function bootstrapApp() {
  loadMaterialSymbols()

  const removedLegacyCache = await clearLegacyAppCaches()
  const repairKey = "zenith-legacy-cache-repaired-v8"
  if (removedLegacyCache && sessionStorage.getItem(repairKey) !== "true") {
    sessionStorage.setItem(repairKey, "true")
    window.location.reload()
    return
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </React.StrictMode>
  )

  registerServiceWorker()
}

bootstrapApp()
