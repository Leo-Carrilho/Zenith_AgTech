export default function AnalysisLoader({ imageCount = 1 }) {
  const isBatch = imageCount > 1

  return (
    
    <div className="analysis-container">
      <div className="analysis-content">

        <div className="analysis-topbar">
          <div className="analysis-chip">
            <span className="material-symbols-outlined">auto_awesome</span>
            Inteligência artificial
          </div>

          <div className="analysis-status">
            <span className="analysis-status-dot"></span>
            Processando
          </div>
        </div>

        <div className="loader-wrapper">
          <div className="loader-orbit"></div>

          <div className="loader-ring">
            <div className="loader-ring-inner"></div>

            <div className="loader-core">
              <span className="material-symbols-outlined">neurology</span>
            </div>
          </div>

          <div className="scan-line"></div>

          <div className="pulse-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>

        <div className="analysis-copy">
          <h3>
            {isBatch ? `Analisando ${imageCount} imagens` : "Analisando imagem"}
          </h3>

          <p>
            {isBatch
              ? "Consolidando o levantamento e identificando padrões com inteligência artificial."
              : "Processando a imagem e preparando o diagnóstico com inteligência artificial."}
          </p>
        </div>

        <div className="progress-meta">
          <span>Análise em andamento</span>
          <span>Zenith IA</span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>

        <div className="analysis-steps">
          <div className="step step-active">
            <div className="step-icon">
              <span className="material-symbols-outlined">filter_center_focus</span>
            </div>
            <div className="step-text">
              <strong>Pré-processamento</strong>
              <span>Preparação da imagem</span>
            </div>
          </div>

          <div className="step">
            <div className="step-icon">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div className="step-text">
              <strong>Inferência</strong>
              <span>Leitura pela IA</span>
            </div>
          </div>

          <div className="step">
            <div className="step-icon">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <div className="step-text">
              <strong>{isBatch ? "Consolidação" : "Resultado final"}</strong>
              <span>Geração do diagnóstico</span>
            </div>
          </div>
        </div>

        <div className="analysis-footer">
          <span className="material-symbols-outlined">verified_user</span>
          <span>O resultado aparecerá automaticamente quando o processamento for concluído.</span>
        </div>
      </div>

      <style jsx>{`
        .analysis-container {
          width: 100%;
          max-width: 560px;

          margin: -55px auto 0;

          padding: 20px 16px 120px;

          display: flex;
          justify-content: center;
          box-sizing: border-box;
          user-select: none;
        }

        .analysis-content {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 22px 20px 18px;
          border-radius: 28px;
          border: 1px solid rgba(45, 97, 64, 0.12);
          background:
            radial-gradient(circle at 100% 0%, rgba(199, 230, 202, 0.46), transparent 32%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 250, 243, 0.98));
          box-shadow:
            0 20px 50px rgba(36, 77, 48, 0.08),
            0 6px 16px rgba(36, 77, 48, 0.05);
          animation: fadeScale 0.35s ease;
        }

        @keyframes fadeScale {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .analysis-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 18px;
        }

        .analysis-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 11px;
          border-radius: 999px;
          background: #edf7ea;
          color: #2f6945;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.01em;
        }

        .analysis-chip .material-symbols-outlined {
          font-size: 16px;
        }

        .analysis-status {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #6c7b71;
          font-size: 0.67rem;
          font-weight: 700;
        }

        .analysis-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4b9061;
          box-shadow: 0 0 0 5px rgba(75, 144, 97, 0.12);
          animation: statusPulse 1.6s ease-in-out infinite;
        }

        @keyframes statusPulse {
          50% {
            box-shadow: 0 0 0 9px rgba(75, 144, 97, 0);
          }
        }

        .loader-wrapper {
          position: relative;
          height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
          overflow: hidden;
        }

        .loader-orbit {
          position: absolute;
          width: 128px;
          height: 128px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124, 181, 137, 0.16), transparent 70%);
          filter: blur(4px);
          animation: orbitPulse 2s ease-in-out infinite;
        }

        @keyframes orbitPulse {
          50% {
            transform: scale(1.12);
            opacity: 0.68;
          }
        }

        .loader-ring {
          position: relative;
          width: 92px;
          height: 92px;
          display: grid;
          place-items: center;
        }

        .loader-ring-inner {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(45, 97, 64, 0.1);
        }

        .loader-ring-inner::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #39784f;
          border-right-color: #77af85;
          animation: spin 1.1s linear infinite;
        }

        .loader-ring-inner::after {
          content: "";
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          border: 1px dashed rgba(57, 120, 79, 0.22);
          animation: spinReverse 4.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spinReverse {
          to {
            transform: rotate(-360deg);
          }
        }

        .loader-core {
          position: relative;
          z-index: 2;
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid rgba(45, 97, 64, 0.1);
          background: linear-gradient(145deg, #ffffff, #e9f5e6);
          color: #326d48;
          box-shadow:
            0 10px 24px rgba(45, 97, 64, 0.12),
            inset 0 1px 0 #ffffff;
        }

        .loader-core .material-symbols-outlined {
          font-size: 28px;
        }

        .scan-line {
          position: absolute;
          width: 170px;
          height: 1px;
          left: 50%;
          top: 50%;
          background: linear-gradient(90deg, transparent, rgba(58, 120, 79, 0.55), transparent);
          box-shadow: 0 0 8px rgba(58, 120, 79, 0.18);
          animation: scanLine 2.5s ease-in-out infinite;
        }

        @keyframes scanLine {
          0%, 100% {
            transform: translate(-50%, -34px);
            opacity: 0;
          }
          20%, 80% {
            opacity: 1;
          }
          50% {
            transform: translate(-50%, 34px);
            opacity: 1;
          }
        }

        .pulse-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-top: 14px;
        }

        .dot {
          width: 7px;
          height: 7px;
          background: #54a06c;
          border-radius: 50%;
          opacity: 0.35;
          animation: pulse 1.2s ease-in-out infinite;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        .analysis-copy {
          max-width: 330px;
          margin: 0 auto;
          text-align: center;
        }

        .analysis-copy h3 {
          margin: 0;
          color: #173b25;
          font-size: 1.22rem;
          font-weight: 850;
          letter-spacing: -0.025em;
        }

        .analysis-copy p {
          margin: 8px 0 0;
          color: #748178;
          font-size: 0.76rem;
          font-weight: 550;
          line-height: 1.5;
        }

        .progress-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          margin-bottom: 8px;
          color: #869289;
          font-size: 0.6rem;
          font-weight: 700;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e5eee2;
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          width: 42%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #2e7046, #74ac82);
          animation: loading 2.3s ease-in-out infinite;
        }

        @keyframes loading {
          0% {
            transform: translateX(-120%);
          }
          55% {
            transform: translateX(85%);
          }
          100% {
            transform: translateX(220%);
          }
        }

        .analysis-steps {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 20px;
        }

        .analysis-steps::before {
          content: "";
          position: absolute;
          top: 21px;
          left: 16%;
          right: 16%;
          height: 1px;
          background: linear-gradient(90deg, rgba(62, 126, 82, 0.22), rgba(62, 126, 82, 0.07));
        }

        .step {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-width: 0;
        }

        .step-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          margin-bottom: 8px;
          border-radius: 13px;
          border: 1px solid #dce9d9;
          background: #f4f8f1;
          color: #78907e;
          box-shadow: 0 5px 13px rgba(45, 97, 64, 0.04);
        }

        .step-active .step-icon {
          border-color: rgba(45, 97, 64, 0.16);
          background: linear-gradient(145deg, #deefda, #f5fbf2);
          color: #2e7046;
          box-shadow: 0 7px 18px rgba(45, 97, 64, 0.1);
          animation: activeStep 1.6s ease-in-out infinite;
        }

        @keyframes activeStep {
          50% {
            transform: translateY(-2px);
          }
        }

        .step-icon .material-symbols-outlined {
          font-size: 20px;
        }

        .step-text strong {
          display: block;
          color: #405347;
          font-size: 0.64rem;
          font-weight: 800;
          line-height: 1.15;
        }

        .step-text span {
          display: block;
          margin-top: 2px;
          color: #95a199;
          font-size: 0.54rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .analysis-footer {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 20px;
          padding: 11px 12px;
          border: 1px solid rgba(45, 97, 64, 0.08);
          border-radius: 14px;
          background: rgba(235, 246, 231, 0.62);
          color: #66756b;
          font-size: 0.61rem;
          font-weight: 600;
          line-height: 1.45;
        }

        .analysis-footer .material-symbols-outlined {
          font-size: 16px;
          color: #4d8c61;
          flex: 0 0 auto;
          margin-top: 1px;
        }

        @media (max-width: 480px) {
          .analysis-container {
            padding: 18px 14px 120px;
          }

          .analysis-content {
            padding: 18px 16px;
            border-radius: 24px;
          }

          .loader-wrapper {
            height: 128px;
          }

          .loader-ring {
            width: 84px;
            height: 84px;
          }

          .loader-core {
            width: 50px;
            height: 50px;
          }

          .analysis-copy h3 {
            font-size: 1.08rem;
          }

          .analysis-copy p {
            font-size: 0.71rem;
          }

          .step-text strong {
            font-size: 0.58rem;
          }

          .step-text span {
            font-size: 0.5rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .analysis-content,
          .analysis-status-dot,
          .loader-orbit,
          .loader-ring-inner::before,
          .loader-ring-inner::after,
          .scan-line,
          .dot,
          .progress-fill,
          .step-active .step-icon {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}