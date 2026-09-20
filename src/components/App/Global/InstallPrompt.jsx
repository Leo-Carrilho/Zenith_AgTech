import { motion } from "framer-motion"
import { useState } from "react"
import { FaDownload, FaTimes, FaAndroid, FaApple, FaCheckCircle } from 'react-icons/fa'
import '../../../styles/Global/InstallPrompt.css'

const InstallPrompt = ({ onInstall, onClose, isIOS, isAndroid, isChromeAndroid, hasPrompt }) => {
  const [showInstructions, setShowInstructions] = useState(false)
  const canInstallDirectly = hasPrompt && !isIOS
  const shouldOpenChrome = isAndroid && !isChromeAndroid && !hasPrompt

  const handleFallbackInstall = () => {
    if (shouldOpenChrome) {
      const targetUrl = new URL(window.location.href)
      targetUrl.searchParams.set("install", "true")
      targetUrl.searchParams.set("source", "install-choice")
      const scheme = targetUrl.protocol.replace(":", "")
      const targetPath = `${targetUrl.host}${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`
      window.location.href = `intent://${targetPath}#Intent;scheme=${scheme};package=com.android.chrome;end`
      return
    }

    setShowInstructions(true)
  }

  return (
    <motion.div 
      className="install-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="install-box"
        initial={{ scale: 0.9, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 40 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="close-btn" aria-label="Fechar instalação" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="icon">
          <FaDownload />
        </div>

        <h2>Instalar Zenith</h2>
        <p className="subtitle">
          Acesse mais rápido e sem navegador.
        </p>

        <button
          type="button"
          className="install-main-btn"
          onClick={canInstallDirectly ? onInstall : handleFallbackInstall}
        >
          <FaDownload /> {
            canInstallDirectly
              ? "Instalar aplicativo"
              : shouldOpenChrome
                ? "Instalar pelo Chrome"
                : "Ver como instalar"
          }
        </button>

        {!hasPrompt && (
          <div className={`hint${showInstructions ? " hint--expanded" : ""}`}>
            {showInstructions && isIOS ? (
              <ol className="install-steps">
                <li>Toque no botão <b>Compartilhar</b> do navegador.</li>
                <li>Escolha <b>Adicionar à Tela de Início</b>.</li>
                <li>Confirme tocando em <b>Adicionar</b>.</li>
              </ol>
            ) : showInstructions ? (
              <ol className="install-steps">
                <li>Abra o menu <b>⋮</b> do navegador.</li>
                <li>Toque em <b>Instalar app</b>.</li>
                <li>Confirme a instalação.</li>
              </ol>
            ) : isIOS ? (
              <>
                <FaApple /> Toque em <b>Compartilhar</b> → <b>Tela de Início</b>
              </>
            ) : (
              <>
                <FaAndroid /> Menu ⋮ → <b>Instalar app</b>
              </>
            )}
          </div>
        )}

        <div className="benefits">
          <span><FaCheckCircle aria-hidden="true" /> Acesso rápido</span>
          <span><FaCheckCircle aria-hidden="true" /> Tela inicial</span>
          <span><FaCheckCircle aria-hidden="true" /> Navegação segura</span>
        </div>

        <button type="button" className="later-btn" onClick={onClose}>
          Agora não
        </button>
      </motion.div>
    </motion.div>
  )
}

export default InstallPrompt
