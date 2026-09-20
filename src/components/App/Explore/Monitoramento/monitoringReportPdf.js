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
    "Os resultados apresentados constituem apoio tecnológico ao monitoramento agrícola e devem ser interpretados em conjunto com avaliação de campo.",
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

function drawSummaryCard(doc, { x, y, width, label, value }) {
  setFillColor(doc, COLORS.greenPale)
  setDrawColor(doc, COLORS.line)
  doc.setLineWidth(0.3)
  doc.roundedRect(x, y, width, 31, 2.5, 2.5, "FD")

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  setTextColor(doc, COLORS.greenMuted)
  doc.text(label, x + 4, y + 7)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(17)
  setTextColor(doc, COLORS.greenDark)
  doc.text(String(value), x + 4, y + 19)
}

function statusTone(status) {
  if (status === "Crítico") return { accent: COLORS.red, pale: [253, 239, 239] }
  if (status === "Atenção") return { accent: COLORS.amber, pale: [253, 247, 232] }
  return { accent: COLORS.green, pale: [235, 247, 237] }
}

function formatMetric(value, fallback) {
  return value == null ? fallback : `${value}%`
}

function drawMetric(doc, { x, y, width, label, value }) {
  setFillColor(doc, [252, 253, 251])
  setDrawColor(doc, [222, 232, 223])
  doc.setLineWidth(0.25)
  doc.roundedRect(x, y, width, 14, 1.8, 1.8, "FD")

  doc.setFont("helvetica", "normal")
  doc.setFontSize(6.5)
  setTextColor(doc, COLORS.greenMuted)
  doc.text(label, x + width / 2, y + 5, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9.5)
  setTextColor(doc, COLORS.greenDark)
  doc.text(value, x + width / 2, y + 11, { align: "center" })
}

function drawAnalysisCard(doc, item, index, y) {
  const tone = statusTone(item.status)
  const x = PAGE.margin
  const width = PAGE.width - PAGE.margin * 2
  const height = 48

  setFillColor(doc, COLORS.greenPale)
  setDrawColor(doc, COLORS.line)
  doc.setLineWidth(0.3)
  doc.roundedRect(x, y, width, height, 3, 3, "FD")

  setFillColor(doc, tone.accent)
  doc.roundedRect(x, y, 2.2, height, 1.1, 1.1, "F")

  setFillColor(doc, tone.pale)
  doc.circle(x + 9.5, y + 10.5, 5, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  setTextColor(doc, tone.accent)
  doc.text(String(index + 1).padStart(2, "0"), x + 9.5, y + 12, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10.5)
  setTextColor(doc, COLORS.greenDark)
  doc.text("Análise do talhão", x + 18, y + 9.5)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.3)
  setTextColor(doc, COLORS.greenMuted)
  doc.text(`Data: ${item.date || "-"}`, x + 18, y + 17)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  const pillWidth = Math.max(24, doc.getTextWidth(item.status) + 9)
  setFillColor(doc, tone.pale)
  setDrawColor(doc, tone.accent)
  doc.roundedRect(x + width - pillWidth - 4, y + 5.3, pillWidth, 8.5, 4.2, 4.2, "FD")
  setTextColor(doc, tone.accent)
  doc.text(item.status, x + width - pillWidth / 2 - 4, y + 10.6, { align: "center" })

  const metricsX = x + 18
  const metricsY = y + 22
  const metricGap = 2.5
  const metricWidth = (width - 24 - metricGap * 2) / 3
  drawMetric(doc, {
    x: metricsX,
    y: metricsY,
    width: metricWidth,
    label: "Cobertura",
    value: formatMetric(item.coverage, "Não calculada"),
  })
  drawMetric(doc, {
    x: metricsX + metricWidth + metricGap,
    y: metricsY,
    width: metricWidth,
    label: "Uniformidade",
    value: formatMetric(item.uniformity, "Não calculada"),
  })
  drawMetric(doc, {
    x: metricsX + (metricWidth + metricGap) * 2,
    y: metricsY,
    width: metricWidth,
    label: "Alinhamento",
    value: formatMetric(item.alignment, "Não calculado"),
  })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(6.8)
  setTextColor(doc, COLORS.greenMuted)
  doc.text(`Fileiras: ${item.rowsDetected ? "Identificadas" : "Não identificadas"}`, x + 18, y + 43.3)

  return height
}

export async function createMonitoringHistoryReport({
  items,
  totalAnalyses,
  averageAlignment,
  generatedAt = new Date(),
  logoDataUrl = null,
}) {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true })

  doc.setProperties({
    title: "Histórico de Alinhamento da Plantação",
    subject: "Relatório de monitoramento agrícola",
    author: "Zenith",
    creator: "Plataforma Zenith",
  })

  drawBrandHeader(doc, logoDataUrl)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  setTextColor(doc, COLORS.greenDark)
  doc.text("Histórico de Alinhamento da Plantação", PAGE.margin, 48)

  doc.setFontSize(8.2)
  doc.text("RELATÓRIO DE MONITORAMENTO AGRÍCOLA | ZENITH", PAGE.margin, 62)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(`Gerado em: ${generatedAt.toLocaleString("pt-BR")}`, PAGE.margin, 71)

  drawSectionHeading(doc, "Resumo geral", 88)

  const summaryGap = 4
  const summaryWidth = (PAGE.width - PAGE.margin * 2 - summaryGap) / 2
  drawSummaryCard(doc, {
    x: PAGE.margin,
    y: 97,
    width: summaryWidth,
    label: "Total de análises",
    value: totalAnalyses,
  })
  drawSummaryCard(doc, {
    x: PAGE.margin + summaryWidth + summaryGap,
    y: 97,
    width: summaryWidth,
    label: "Alinhamento médio",
    value: averageAlignment == null ? "Não calculado" : `${averageAlignment}%`,
  })

  drawSectionHeading(doc, "Resultados do monitoramento", 145)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.3)
  setTextColor(doc, COLORS.greenMuted)
  doc.text("Leituras de cobertura, uniformidade e alinhamento registradas por análise.", PAGE.margin, 154)

  let y = 163
  items.forEach((item, index) => {
    if (y + 48 > PAGE.contentBottom) {
      doc.addPage()
      drawBrandHeader(doc, logoDataUrl)
      drawSectionHeading(doc, "Resultados do monitoramento", 48)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8.3)
      setTextColor(doc, COLORS.greenMuted)
      doc.text("Continuação do histórico de alinhamento da plantação.", PAGE.margin, 57)
      y = 66
    }

    y += drawAnalysisCard(doc, item, index, y) + 6
  })

  const pageCount = doc.getNumberOfPages()
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    doc.setPage(pageNumber)
    drawFooter(doc, pageNumber, pageCount)
  }

  return doc
}

export async function downloadMonitoringHistoryReport(reportData) {
  const logoDataUrl = await loadImageDataUrl("/assets/icons/zenith-icon-180-v6.png").catch(() => null)
  const doc = await createMonitoringHistoryReport({ ...reportData, logoDataUrl })
  const generatedAt = reportData.generatedAt || new Date()
  doc.save(`historico_alinhamento_${generatedAt.toISOString().slice(0, 10)}.pdf`)
}
