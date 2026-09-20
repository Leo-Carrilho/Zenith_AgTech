const PAGE = {
  width: 210,
  height: 297,
  margin: 16,
  contentBottom: 271,
}

const COLORS = {
  green: [38, 105, 70],
  greenDark: [35, 58, 44],
  greenMuted: [91, 116, 101],
  greenSoft: [239, 246, 238],
  greenPale: [247, 250, 246],
  line: [205, 220, 207],
  white: [255, 255, 255],
  amber: [180, 120, 31],
  red: [177, 58, 58],
}

function setTextColor(doc, color) {
  doc.setTextColor(...color)
}

function setDrawColor(doc, color) {
  doc.setDrawColor(...color)
}

function setFillColor(doc, color) {
  doc.setFillColor(...color)
}

async function loadImageDataUrl(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Falha ao carregar a imagem do relatório: ${response.status}`)

  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function drawBrandHeader(doc, logoDataUrl) {
  setFillColor(doc, COLORS.green)
  doc.rect(0, 0, PAGE.width, 3.2, "F")

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", PAGE.margin, 10.5, 17, 17, undefined, "FAST")
  } else {
    setFillColor(doc, COLORS.greenSoft)
    doc.circle(PAGE.margin + 8.5, 19, 8.5, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    setTextColor(doc, COLORS.green)
    doc.text("Z", PAGE.margin + 8.5, 21, { align: "center" })
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(17)
  setTextColor(doc, COLORS.green)
  doc.text("ZENITH", 38, 17.3)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.text("Sua precisão agrícola no ponto mais alto", 38, 24.4)

  doc.setFontSize(7.8)
  setTextColor(doc, COLORS.greenMuted)
  doc.text("REGISTRO TÉCNICO | AGRICULTURA", PAGE.width - PAGE.margin, 17.2, { align: "right" })

  setDrawColor(doc, COLORS.line)
  doc.setLineWidth(0.25)
  doc.line(PAGE.margin, 34, PAGE.width - PAGE.margin, 34)
}

function drawFooter(doc, pageNumber, pageCount) {
  const footerY = 279
  setDrawColor(doc, COLORS.line)
  doc.setLineWidth(0.25)
  doc.line(PAGE.margin, footerY, PAGE.width - PAGE.margin, footerY)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(6.8)
  setTextColor(doc, COLORS.greenMuted)
  doc.text("ZENITH | Relatório gerado automaticamente pela plataforma Zenith.", PAGE.margin, footerY + 5.4)
  doc.text(`Página ${pageNumber} de ${pageCount}`, PAGE.width - PAGE.margin, footerY + 5.4, { align: "right" })

  doc.setFontSize(6.2)
  const disclaimer = doc.splitTextToSize(
    "Os resultados apresentados constituem apoio tecnológico à inspeção agrícola e devem ser interpretados em conjunto com avaliação de campo.",
    154
  )
  doc.text(disclaimer, PAGE.margin, footerY + 10.2, { lineHeightFactor: 1.25 })
}

function drawSectionHeading(doc, title, y) {
  setFillColor(doc, COLORS.green)
  doc.rect(PAGE.margin, y - 4.8, 1.3, 6.2, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10.2)
  setTextColor(doc, COLORS.green)
  doc.text(title, PAGE.margin + 4, y)
}

function drawSummaryCard(doc, { x, y, width, label, value, compact = false }) {
  setFillColor(doc, COLORS.greenPale)
  setDrawColor(doc, COLORS.line)
  doc.setLineWidth(0.3)
  doc.roundedRect(x, y, width, 31, 2.5, 2.5, "FD")

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  setTextColor(doc, COLORS.greenMuted)
  doc.text(label, x + 4, y + 7)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(compact ? 10 : 17)
  setTextColor(doc, COLORS.greenDark)
  const valueLines = doc.splitTextToSize(String(value), width - 8).slice(0, 2)
  doc.text(valueLines, x + 4, y + 18, { lineHeightFactor: 1.15 })
}

function confidenceTone(confidence) {
  if (confidence >= 80) return { accent: COLORS.green, pale: [235, 247, 237] }
  if (confidence >= 50) return { accent: COLORS.amber, pale: [253, 247, 232] }
  return { accent: COLORS.red, pale: [253, 239, 239] }
}

function drawDiagnosisCard(doc, item, index, y) {
  const confidence = Number(item.confidence) || 0
  const tone = confidenceTone(confidence)
  const titleLines = doc.splitTextToSize(item.name, 100).slice(0, 2)
  const titleExtra = Math.max(0, titleLines.length - 1) * 4.2
  const cardHeight = (item.isBatch ? 46 : 40) + titleExtra
  const x = PAGE.margin
  const width = PAGE.width - PAGE.margin * 2

  setFillColor(doc, COLORS.greenPale)
  setDrawColor(doc, COLORS.line)
  doc.setLineWidth(0.3)
  doc.roundedRect(x, y, width, cardHeight, 3, 3, "FD")

  setFillColor(doc, tone.accent)
  doc.roundedRect(x, y, 2.2, cardHeight, 1.1, 1.1, "F")

  setFillColor(doc, tone.pale)
  doc.circle(x + 9.5, y + 10.5, 5, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  setTextColor(doc, tone.accent)
  doc.text(String(index + 1).padStart(2, "0"), x + 9.5, y + 12, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10.5)
  setTextColor(doc, COLORS.greenDark)
  doc.text(titleLines, x + 18, y + 9.2, { lineHeightFactor: 1.12 })

  const pillText = item.confidenceText
  doc.setFontSize(7)
  const pillWidth = Math.max(25, doc.getTextWidth(pillText) + 8)
  setFillColor(doc, tone.pale)
  setDrawColor(doc, tone.accent)
  doc.roundedRect(x + width - pillWidth - 4, y + 5.3, pillWidth, 8.5, 4.2, 4.2, "FD")
  setTextColor(doc, tone.accent)
  doc.text(pillText, x + width - pillWidth / 2 - 4, y + 10.6, { align: "center" })

  const detailY = y + 18 + titleExtra
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.4)
  setTextColor(doc, COLORS.greenMuted)
  doc.text(`Data: ${item.date || "-"}`, x + 18, detailY)

  doc.setFont("helvetica", "bold")
  setTextColor(doc, COLORS.greenDark)
  doc.text("Confiança", x + 18, detailY + 8)
  doc.text(`${confidence}%`, x + width - 6, detailY + 8, { align: "right" })

  const progressX = x + 18
  const progressY = detailY + 10.8
  const progressWidth = width - 24
  setFillColor(doc, [224, 232, 225])
  doc.roundedRect(progressX, progressY, progressWidth, 2.2, 1.1, 1.1, "F")
  if (confidence > 0) {
    setFillColor(doc, tone.accent)
    doc.roundedRect(progressX, progressY, Math.max(2.2, progressWidth * Math.min(100, confidence) / 100), 2.2, 1.1, 1.1, "F")
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(6.8)
  setTextColor(doc, COLORS.greenMuted)
  if (item.isBatch) {
    doc.text(
      `Lote: ${item.imageCount} fotos | ${item.reliableCount} confiáveis | ${item.conditionCount} condições`,
      x + 18,
      detailY + 18
    )
  }

  const observationY = item.isBatch ? detailY + 25 : detailY + 18
  doc.setFontSize(6.6)
  doc.text(
    "Observação: use este resultado como apoio e acompanhe a planta nos próximos dias.",
    x + 18,
    observationY
  )

  return cardHeight
}

export async function createDiagnosticHistoryReport({
  items,
  totalDiagnostics,
  averageConfidence,
  mostCommonDisease,
  generatedAt = new Date(),
  logoDataUrl = null,
}) {
  const { jsPDF } = await import("jspdf")

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true })
  doc.setProperties({
    title: "Histórico de Diagnósticos",
    subject: "Relatório de triagem fitossanitária",
    author: "Zenith",
    creator: "Plataforma Zenith",
  })

  drawBrandHeader(doc, logoDataUrl)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  setTextColor(doc, COLORS.greenDark)
  doc.text("Histórico de Diagnósticos", PAGE.margin, 48)

  doc.setFontSize(8.2)
  doc.text("RELATÓRIO DE TRIAGEM FITOSSANITÁRIA | ZENITH", PAGE.margin, 62)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(`Gerado em: ${generatedAt.toLocaleString("pt-BR")}`, PAGE.margin, 71)

  drawSectionHeading(doc, "Resumo geral", 88)

  const summaryGap = 4
  const summaryWidth = (PAGE.width - PAGE.margin * 2 - summaryGap * 2) / 3
  drawSummaryCard(doc, {
    x: PAGE.margin,
    y: 97,
    width: summaryWidth,
    label: "Total de diagnósticos",
    value: totalDiagnostics,
  })
  drawSummaryCard(doc, {
    x: PAGE.margin + summaryWidth + summaryGap,
    y: 97,
    width: summaryWidth,
    label: "Confiança média",
    value: `${averageConfidence}%`,
  })
  drawSummaryCard(doc, {
    x: PAGE.margin + (summaryWidth + summaryGap) * 2,
    y: 97,
    width: summaryWidth,
    label: "Diagnóstico mais comum",
    value: mostCommonDisease,
    compact: true,
  })

  drawSectionHeading(doc, "Diagnósticos registrados", 145)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.3)
  setTextColor(doc, COLORS.greenMuted)
  doc.text("Resultados organizados por registro, com data e nível de confiança.", PAGE.margin, 154)

  let y = 163
  items.forEach((item, index) => {
    const titleLines = doc.splitTextToSize(item.name, 100).slice(0, 2)
    const cardHeight = (item.isBatch ? 46 : 40) + Math.max(0, titleLines.length - 1) * 4.2

    if (y + cardHeight > PAGE.contentBottom) {
      doc.addPage()
      drawBrandHeader(doc, logoDataUrl)
      drawSectionHeading(doc, "Diagnósticos registrados", 48)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8.3)
      setTextColor(doc, COLORS.greenMuted)
      doc.text("Continuação do histórico de triagem fitossanitária.", PAGE.margin, 57)
      y = 66
    }

    y += drawDiagnosisCard(doc, item, index, y) + 6
  })

  const pageCount = doc.getNumberOfPages()
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    doc.setPage(pageNumber)
    drawFooter(doc, pageNumber, pageCount)
  }

  return doc
}

export async function downloadDiagnosticHistoryReport(reportData) {
  const logoDataUrl = await loadImageDataUrl("/assets/icons/zenith-icon-180-v6.png").catch(() => null)
  const doc = await createDiagnosticHistoryReport({ ...reportData, logoDataUrl })
  const generatedAt = reportData.generatedAt || new Date()
  doc.save(`diagnosticos_${generatedAt.toISOString().slice(0, 10)}.pdf`)
}
