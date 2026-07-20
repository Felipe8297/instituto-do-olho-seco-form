import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Rect,
  Circle,
  Line,
  pdf,
} from "@react-pdf/renderer";
import { QUESTIONS, SCORE_MAX_ESCALA, BAND_TICKS, type ScoreBand } from "./form-config";
import { questionPoints } from "./scoring";

export interface ReportData {
  answers: Record<string, string[]>;
  score: number;
  band: ScoreBand;
  dateStr: string;
}

const s = StyleSheet.create({
  page: { padding: 34, fontSize: 10, color: "#0C2A2E", fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: "#0E9AA7",
    paddingBottom: 10,
    marginBottom: 16,
  },
  brand: { fontSize: 9, color: "#0B7A85", letterSpacing: 1, textTransform: "uppercase" },
  title: { fontSize: 17, fontFamily: "Helvetica-Bold", marginTop: 2 },
  date: { fontSize: 9, color: "#4A6467" },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    marginTop: 6,
    color: "#0B7A85",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2EDEC",
    paddingVertical: 5,
  },
  cQ: { width: "46%", paddingRight: 8 },
  cA: { width: "44%", paddingRight: 8, color: "#0C2A2E" },
  cP: { width: "10%", textAlign: "right", fontFamily: "Helvetica-Bold" },
  qText: { color: "#4A6467" },
  resultWrap: { flexDirection: "row", marginTop: 8, alignItems: "center" },
  bandLabel: { fontSize: 22, fontFamily: "Helvetica-Bold" },
  scoreBig: { fontSize: 40, fontFamily: "Helvetica-Bold", color: "#0C2A2E" },
  msg: { fontSize: 11, lineHeight: 1.5, marginTop: 8, color: "#0C2A2E" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 34,
    right: 34,
    fontSize: 8,
    color: "#4A6467",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#E2EDEC",
    paddingTop: 8,
  },
});

// Termômetro estático para o PDF.
function PdfThermometer({ score, band }: { score: number; band: ScoreBand }) {
  const TOP = 20;
  const BOTTOM = 150;
  const CX = 34;
  const W = 22;
  const frac = Math.max(0, Math.min(score / SCORE_MAX_ESCALA, 1));
  const range = BOTTOM - TOP;
  const fillH = frac * range;
  const fillY = BOTTOM - fillH;
  const tickY = (v: number) => BOTTOM - (v / SCORE_MAX_ESCALA) * range;

  return (
    <Svg width={110} height={220} viewBox="0 0 110 220">
      <Rect x={CX - W / 2} y={TOP} width={W} height={BOTTOM - TOP + 4} rx={W / 2} fill="#E2EDEC" />
      <Circle cx={CX} cy={BOTTOM + 22} r={20} fill="#E2EDEC" />
      <Circle cx={CX} cy={BOTTOM + 22} r={15} fill={band.color} />
      <Rect
        x={CX - W / 2 + 4}
        y={fillY}
        width={W - 8}
        height={fillH + 24}
        rx={(W - 8) / 2}
        fill={band.color}
      />
      {BAND_TICKS.map((v) => (
        <Line
          key={v}
          x1={CX + W / 2 + 2}
          y1={tickY(v)}
          x2={CX + W / 2 + 12}
          y2={tickY(v)}
          strokeWidth={1.5}
          stroke="#4A6467"
        />
      ))}
    </Svg>
  );
}

function ReportDoc({ answers, score, band, dateStr }: ReportData) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.brand}>Instituto do Olho Seco</Text>
            <Text style={s.title}>Relatório de Triagem — Olho Seco</Text>
          </View>
          <Text style={s.date}>{dateStr}</Text>
        </View>

        <Text style={s.sectionTitle}>Respostas</Text>
        <View style={s.row}>
          <Text style={[s.cQ, { fontFamily: "Helvetica-Bold" }]}>Pergunta</Text>
          <Text style={[s.cA, { fontFamily: "Helvetica-Bold" }]}>Resposta(s)</Text>
          <Text style={s.cP}>Pts</Text>
        </View>
        {QUESTIONS.map((q, i) => {
          const sel = answers[q.id] ?? [];
          const pts = questionPoints(q.id, sel);
          return (
            <View key={q.id} style={s.row} wrap={false}>
              <Text style={s.cQ}>
                <Text style={{ color: "#0B7A85" }}>{i + 1}. </Text>
                <Text style={s.qText}>{q.text}</Text>
              </Text>
              <Text style={s.cA}>{sel.length ? sel.join(", ") : "—"}</Text>
              <Text style={s.cP}>{pts}</Text>
            </View>
          );
        })}

        <Text style={[s.sectionTitle, { marginTop: 18 }]}>Resultado</Text>
        <View style={s.resultWrap}>
          <PdfThermometer score={score} band={band} />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={s.scoreBig}>{score}</Text>
            <Text style={[s.bandLabel, { color: band.color }]}>{band.label}</Text>
            <Text style={s.msg}>{band.msg}</Text>
          </View>
        </View>

        <Text style={s.footer} fixed>
          Este relatório é uma triagem e não substitui avaliação médica.
        </Text>
      </Page>
    </Document>
  );
}

/** Gera o PDF e devolve o conteúdo em base64 (sem o prefixo data:). */
export async function generatePdfBase64(data: ReportData): Promise<string> {
  const blob = await pdf(<ReportDoc {...data} />).toBlob();
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  // remove "data:application/pdf;base64,"
  return dataUrl.split(",")[1] ?? "";
}
