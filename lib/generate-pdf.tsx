import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Circle,
  pdf,
} from "@react-pdf/renderer";
import { QUESTIONS, SCORE_MAX_ESCALA, type ScoreBand } from "./form-config";

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
    color: "#0B7A85",
  },
  resultWrap: { flexDirection: "row", alignItems: "center", marginBottom: 22 },
  scoreBig: { fontSize: 44, fontFamily: "Helvetica-Bold", color: "#0C2A2E" },
  bandLabel: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  msg: { fontSize: 11, lineHeight: 1.5, marginTop: 8, color: "#0C2A2E" },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2EDEC",
    paddingVertical: 5,
  },
  cQ: { width: "52%", paddingRight: 8 },
  cA: { width: "48%", paddingRight: 8, color: "#0C2A2E" },
  qText: { color: "#4A6467" },
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

// --- Gauge (arco semicircular) para o PDF, em 4 segmentos coloridos ----------
const G_CX = 90;
const G_CY = 92;
const G_R = 72;

function pointAt(t: number) {
  const a = Math.PI * (1 - t);
  return { x: G_CX + G_R * Math.cos(a), y: G_CY - G_R * Math.sin(a) };
}
function arc(t0: number, t1: number) {
  const p0 = pointAt(t0);
  const p1 = pointAt(t1);
  return `M ${p0.x} ${p0.y} A ${G_R} ${G_R} 0 0 1 ${p1.x} ${p1.y}`;
}

const SEGMENTS = [
  { d: arc(0, 0.25), color: "#22c55e" },
  { d: arc(0.25, 0.5), color: "#eab308" },
  { d: arc(0.5, 0.75), color: "#f97316" },
  { d: arc(0.75, 1), color: "#ef4444" },
];

function PdfGauge({ score, band }: { score: number; band: ScoreBand }) {
  const frac = Math.max(0, Math.min(score / SCORE_MAX_ESCALA, 1));
  const knob = pointAt(frac);
  return (
    <Svg width={180} height={120} viewBox="0 0 180 120">
      {SEGMENTS.map((seg, i) => (
        <Path
          key={i}
          d={seg.d}
          stroke={seg.color}
          strokeWidth={16}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      <Circle cx={knob.x} cy={knob.y} r={10} fill="#FFFFFF" />
      <Circle cx={knob.x} cy={knob.y} r={6} fill={band.color} />
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

        {/* Resultado primeiro */}
        <Text style={s.sectionTitle}>Resultado</Text>
        <View style={s.resultWrap}>
          <PdfGauge score={score} band={band} />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={s.scoreBig}>
              {score}
              <Text style={{ fontSize: 14, color: "#4A6467" }}> / {SCORE_MAX_ESCALA}</Text>
            </Text>
            <Text style={[s.bandLabel, { color: band.color }]}>{band.label}</Text>
            <Text style={s.msg}>{band.msg}</Text>
          </View>
        </View>

        {/* Respostas depois (sem coluna de pontos) */}
        <Text style={s.sectionTitle}>Respostas</Text>
        <View style={s.row}>
          <Text style={[s.cQ, { fontFamily: "Helvetica-Bold" }]}>Pergunta</Text>
          <Text style={[s.cA, { fontFamily: "Helvetica-Bold" }]}>Resposta(s)</Text>
        </View>
        {QUESTIONS.map((q, i) => {
          const sel = answers[q.id] ?? [];
          return (
            <View key={q.id} style={s.row} wrap={false}>
              <Text style={s.cQ}>
                <Text style={{ color: "#0B7A85" }}>{i + 1}. </Text>
                <Text style={s.qText}>{q.text}</Text>
              </Text>
              <Text style={s.cA}>{sel.length ? sel.join(", ") : "—"}</Text>
            </View>
          );
        })}

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
  return dataUrl.split(",")[1] ?? "";
}
