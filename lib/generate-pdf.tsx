import {
  Circle,
  Document,
  Image,
  Page,
  Path,
  pdf,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { QUESTIONS, SCORE_MAX_ESCALA, type ScoreBand } from "./form-config";

export interface ReportData {
  answers: Record<string, string[]>;
  score: number;
  band: ScoreBand;
  dateStr: string;
  patient?: { nome: string; idade: string; telefone: string };
  logoSrc?: string;
}

const NAVY = "#192938";
const NAVY_DEEP = "#111d27";
const AMBER = "#C9A66B";
const TEXT = "#1a1a2e";
const MUTE = "#5a6478";
const LINE = "#dde3ed";

const s = StyleSheet.create({
  page: { fontSize: 10, color: TEXT, fontFamily: "Helvetica" },
  headerBand: {
    backgroundColor: NAVY,
    paddingVertical: 18,
    paddingHorizontal: 34,
    borderBottomWidth: 3,
    borderBottomColor: AMBER,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { height: 26, objectFit: "contain" },
  headerRight: { alignItems: "flex-end" },
  headerTitle: { color: "#ffffff", fontSize: 11, fontFamily: "Helvetica-Bold" },
  headerDate: { color: "rgba(255,255,255,0.6)", fontSize: 8, marginTop: 2 },
  body: { paddingHorizontal: 34, paddingTop: 20, paddingBottom: 40 },
  patientBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    backgroundColor: "#f7f8fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 22,
  },
  patientItem: { width: "50%", marginBottom: 4 },
  patientLabel: { fontSize: 8, color: MUTE, textTransform: "uppercase", letterSpacing: 0.5 },
  patientValue: { fontSize: 12, color: TEXT, fontFamily: "Helvetica-Bold" },
  eyebrow: {
    fontSize: 9,
    color: AMBER,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  resultWrap: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  scoreBig: { fontSize: 44, fontFamily: "Helvetica-Bold", color: NAVY },
  bandLabel: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  msg: { fontSize: 11, lineHeight: 1.5, marginTop: 8, color: TEXT },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingVertical: 5,
  },
  cQ: { width: "52%", paddingRight: 8 },
  cA: { width: "48%", paddingRight: 8, color: TEXT },
  qText: { color: MUTE },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 34,
    right: 34,
    fontSize: 8,
    color: MUTE,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: LINE,
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
        <Path key={i} d={seg.d} stroke={seg.color} strokeWidth={16} strokeLinecap="round" fill="none" />
      ))}
      <Circle cx={knob.x} cy={knob.y} r={10} fill="#FFFFFF" />
      <Circle cx={knob.x} cy={knob.y} r={6} fill={band.color} />
    </Svg>
  );
}

function ReportDoc({ answers, score, band, dateStr, patient, logoSrc }: ReportData) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Cabeçalho navy com a logo */}
        <View style={s.headerBand} fixed>
          {logoSrc ? (
            <Image src={logoSrc} style={s.logo} />
          ) : (
            <Text style={{ color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 13 }}>
              Instituto do Olho Seco
            </Text>
          )}
          <View style={s.headerRight}>
            <Text style={s.headerTitle}>Relatório de Triagem — Olho Seco</Text>
            <Text style={s.headerDate}>{dateStr}</Text>
          </View>
        </View>

        <View style={s.body}>
          {/* Dados do paciente */}
          {patient && (patient.nome || patient.idade || patient.telefone) ? (
            <>
              <Text style={s.eyebrow}>Paciente</Text>
              <View style={s.patientBox}>
                <View style={s.patientItem}>
                  <Text style={s.patientLabel}>Nome</Text>
                  <Text style={s.patientValue}>{patient.nome || "—"}</Text>
                </View>
                <View style={s.patientItem}>
                  <Text style={s.patientLabel}>Idade</Text>
                  <Text style={s.patientValue}>{patient.idade || "—"}</Text>
                </View>
                <View style={s.patientItem}>
                  <Text style={s.patientLabel}>Telefone</Text>
                  <Text style={s.patientValue}>{patient.telefone || "—"}</Text>
                </View>
                <View style={s.patientItem}>
                  <Text style={s.patientLabel}>Data</Text>
                  <Text style={s.patientValue}>{dateStr}</Text>
                </View>
              </View>
            </>
          ) : null}

          {/* Resultado */}
          <Text style={s.eyebrow}>Resultado</Text>
          <View style={s.resultWrap}>
            <PdfGauge score={score} band={band} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={s.scoreBig}>
                {score}
                <Text style={{ fontSize: 14, color: MUTE }}> / {SCORE_MAX_ESCALA}</Text>
              </Text>
              <Text style={[s.bandLabel, { color: band.color }]}>{band.label}</Text>
              <Text style={s.msg}>{band.msg}</Text>
            </View>
          </View>

          {/* Respostas depois (sem coluna de pontos) */}
          <Text style={s.eyebrow}>Respostas</Text>
          <View style={s.row}>
            <Text style={[s.cQ, { fontFamily: "Helvetica-Bold", color: NAVY }]}>Pergunta</Text>
            <Text style={[s.cA, { fontFamily: "Helvetica-Bold", color: NAVY }]}>Resposta(s)</Text>
          </View>
          {QUESTIONS.map((q, i) => {
            const sel = answers[q.id] ?? [];
            return (
              <View key={q.id} style={s.row} wrap={false}>
                <Text style={s.cQ}>
                  <Text style={{ color: AMBER, fontFamily: "Helvetica-Bold" }}>{i + 1}. </Text>
                  <Text style={s.qText}>{q.text}</Text>
                </Text>
                <Text style={s.cA}>{sel.length ? sel.join(", ") : "—"}</Text>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}

/** Gera o PDF e devolve o conteúdo em base64 (sem o prefixo data:). */
export async function generatePdfBase64(data: ReportData): Promise<string> {
  const logoSrc =
    data.logoSrc ??
    (typeof window !== "undefined" ? `${window.location.origin}/logo.png` : undefined);
  const blob = await pdf(<ReportDoc {...data} logoSrc={logoSrc} />).toBlob();
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return dataUrl.split(",")[1] ?? "";
}
