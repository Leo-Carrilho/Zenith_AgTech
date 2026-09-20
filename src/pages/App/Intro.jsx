import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import {
  Activity,
  ArrowRight,
  Download,
  Globe2,
  Leaf,
  LogIn,
  Radar,
  ScanSearch,
  ShieldCheck,
  Smartphone,
} from "lucide-react"

import { auth } from "../../services/firebase"
import LoadingScreen from "../../components/App/Home/LoadingScreen"
import "../../styles/App/Intro.css"

const Logo = "/assets/image/Logo-redonda.png"
const SoyCutout = "/assets/image/soja-hero-cutout.png"
export const SITE_CHOICE_SESSION_KEY = "zenithContinueOnWebsite"

const highlights = [
  { icon: ShieldCheck, label: "Diagnóstico confiável" },
  { icon: Activity, label: "Acompanhamento contínuo" },
  { icon: Radar, label: "Decisões em tempo real" },
]

export default function Intro({ onInstallRequest, isInstalled = false }) {
  const navigate = useNavigate()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showAccessChoice, setShowAccessChoice] = useState(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true

    return !isStandalone && sessionStorage.getItem(SITE_CHOICE_SESSION_KEY) !== "true"
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
          window.navigator.standalone === true
        const choseWebsite = sessionStorage.getItem(SITE_CHOICE_SESSION_KEY) === "true"

        if (isStandalone || isInstalled || choseWebsite) {
          navigate("/home", { replace: true })
          return
        }

        setShowAccessChoice(true)
        setCheckingAuth(false)
        return
      }

      setCheckingAuth(false)
    })

    return unsubscribe
  }, [isInstalled, navigate])

  useEffect(() => {
    if (isInstalled) setShowAccessChoice(false)
  }, [isInstalled])

  const continueOnWebsite = () => {
    sessionStorage.setItem(SITE_CHOICE_SESSION_KEY, "true")

    if (auth.currentUser) {
      navigate("/home", { replace: true })
      return
    }

    setShowAccessChoice(false)
  }

  if (checkingAuth) return <LoadingScreen />

  if (showAccessChoice) {
    return (
      <main className="access-choice" data-system-bar-color="#123b27">
        <div className="access-choice__shade" aria-hidden="true" />

        <header className="access-choice__brand" aria-label="Zenith">
          <span className="access-choice__logo">
            <img src={Logo} alt="" draggable="false" />
          </span>
          <span>
            <strong>Zenith</strong>
            <small>Agricultura de precisão</small>
          </span>
        </header>

        <section className="access-choice__content" aria-labelledby="access-choice-title">
          <div className="access-choice__eyebrow">
            <Smartphone size={17} strokeWidth={2.1} aria-hidden="true" />
            <span>Zenith no seu dispositivo</span>
          </div>

          <h1 id="access-choice-title">Como você quer acessar?</h1>
          <p>
            Instale a Zenith para abrir direto pela tela inicial ou continue usando normalmente pelo navegador.
          </p>

          <div className="access-choice__actions">
            <button type="button" className="access-choice__button access-choice__button--install" onClick={onInstallRequest}>
              <Download size={20} strokeWidth={2.2} aria-hidden="true" />
              <span>Instalar aplicativo</span>
              <ArrowRight size={19} strokeWidth={2.2} aria-hidden="true" />
            </button>

            <button type="button" className="access-choice__button access-choice__button--web" onClick={continueOnWebsite}>
              <Globe2 size={20} strokeWidth={2.1} aria-hidden="true" />
              <span>Continuar pelo site</span>
            </button>
          </div>

          <small className="access-choice__note">
            Você também poderá instalar o aplicativo mais tarde pelo menu da Zenith.
          </small>
        </section>
      </main>
    )
  }

  return (
    <main className="intro" data-system-bar-color="#f4f8ef">
      <div className="intro-shell">
        <header className="intro-brand" aria-label="Zenith">
          <div className="intro-brand__mark">
            <img src={Logo} alt="" draggable="false" />
          </div>
          <div className="intro-brand__copy">
            <strong>Zenith</strong>
            <span>Agricultura de precisão</span>
          </div>
          <span className="intro-brand__icon" aria-hidden="true">
            <Leaf size={19} strokeWidth={2} />
          </span>
        </header>

        <section className="intro-layout">
          <div className="intro-visual" aria-label="Lavoura monitorada pela plataforma Zenith">
            <div className="intro-visual__shade" aria-hidden="true" />
            <div className="intro-visual__grid" aria-hidden="true" />

            <div className="intro-visual__tag">
              <ScanSearch size={16} strokeWidth={2.1} />
              <span>Inteligência aplicada ao campo</span>
            </div>

            <img
              className="intro-visual__soy"
              src={SoyCutout}
              alt="Vagem de soja"
              draggable="false"
            />

            <div className="intro-visual__caption">
              <span className="intro-visual__signal" aria-hidden="true" />
              <div>
                <strong>Monitoramento ativo</strong>
                <small>Dados do campo em uma única visão</small>
              </div>
            </div>
          </div>

          <div className="intro-content">
            <div className="intro-eyebrow">
              <Radar size={16} strokeWidth={2.2} />
              <span>Tecnologia para quem produz</span>
            </div>

            <h1>
              Seu campo, visto com <em>mais precisão.</em>
            </h1>

            <p className="intro-description">
              Monitore lavouras, organize a operação e transforme imagens e dados em decisões mais seguras para a sua produção.
            </p>

            <div className="intro-highlights" aria-label="Benefícios da plataforma">
              {highlights.map(({ icon: Icon, label }) => (
                <div className="intro-highlight" key={label}>
                  <span aria-hidden="true">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <small>{label}</small>
                </div>
              ))}
            </div>

            <div className="intro-actions">
              <button
                type="button"
                className="intro-button intro-button--primary"
                onClick={() => navigate("/register")}
              >
                <span>Começar agora</span>
                <ArrowRight size={19} strokeWidth={2.2} />
              </button>

              <button
                type="button"
                className="intro-button intro-button--secondary"
                onClick={() => navigate("/login")}
              >
                <LogIn size={18} strokeWidth={2.1} />
                <span>Já tenho uma conta</span>
              </button>
            </div>

            <p className="intro-footnote">
              Gestão agrícola, diagnóstico e monitoramento em uma experiência simples.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
