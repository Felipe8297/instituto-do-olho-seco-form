// ============================================================================
// Fonte da verdade das regras de negócio: 24 perguntas pontuadas + faixas.
// (As escalas reutilizáveis são declaradas ANTES de QUESTIONS de propósito —
//  usá-las antes da declaração `const` quebraria por temporal dead zone.)
// ============================================================================

export type ViewType = "dropdown" | "botoes" | "caixinhas";

export interface Option {
  label: string;
  points: number;
}

export interface Question {
  id: string;
  section?: string; // cabeçalho da seção (aparece antes desta pergunta)
  text: string;
  view: ViewType;
  multi: boolean; // dropdown = true (múltipla escolha); demais = false
  options: Option[];
}

// --- Escalas reutilizáveis ---------------------------------------------------

const ESCALA_FREQ: Option[] = [
  // p9–p18 (botões)
  { label: "O tempo todo", points: 4 },
  { label: "A maior parte do tempo", points: 3 },
  { label: "A metade do tempo", points: 2 },
  { label: "Em alguns momentos", points: 1 },
  { label: "Em nenhum momento", points: 0 },
];

const ESCALA_FREQ2: Option[] = [
  // frequência (caixinhas 0–4)
  { label: "Nunca", points: 0 },
  { label: "Raramente", points: 1 },
  { label: "Às vezes", points: 2 },
  { label: "Frequentemente", points: 3 },
  { label: "Constantemente", points: 4 },
];

const ESCALA_INTENS: Option[] = [
  // intensidade (caixinhas 0–5)
  { label: "Nunca senti", points: 0 },
  { label: "Intensidade mínima", points: 1 },
  { label: "Pouco intenso", points: 2 },
  { label: "Intenso", points: 3 },
  { label: "Muito intenso", points: 4 },
  { label: "Intensidade máxima", points: 5 },
];

// --- Perguntas ---------------------------------------------------------------

export const QUESTIONS: Question[] = [
  {
    id: "p1",
    section: "Histórico ocular",
    text: "Qual o motivo da consulta e sua queixa principal?",
    view: "dropdown",
    multi: true,
    options: [
      { label: "Consulta de Rotina/Retorno", points: 0 },
      { label: "Ardência e Lacrimejamento", points: 5 },
      { label: "Blefarite", points: 5 },
      { label: "Desconforto e Secura Ocular", points: 5 },
      { label: "Dor ao acordar", points: 5 },
      { label: "Fotofobia (Sensibilidade à Luz)", points: 5 },
      { label: "Indicação de Tratamento (IPL)", points: 5 },
      { label: "Outros", points: 5 },
    ],
  },
  {
    id: "p2",
    text: "Tem diagnóstico de doenças oculares?",
    view: "dropdown",
    multi: true,
    options: [
      { label: "Não", points: 0 },
      { label: "Calázio", points: 1 },
      { label: "Ceratite de Córnea", points: 1 },
      { label: "Ceratocone", points: 1 },
      { label: "Glaucoma", points: 1 },
      { label: "Pterígio", points: 1 },
      { label: "Terçol", points: 1 },
      { label: "Úlcera de Córnea", points: 1 },
      { label: "Outras", points: 1 },
    ],
  },
  {
    id: "p3",
    text: "Já fez alguma cirurgia nos olhos?",
    view: "dropdown",
    multi: true,
    options: [
      { label: "Não", points: 0 },
      { label: "Catarata", points: 2 },
      { label: "Glaucoma", points: 1 },
      { label: "Plástica Ocular (Pálpebras)", points: 1 },
      { label: "Refrativa", points: 2 },
      { label: "Retina", points: 1 },
      { label: "Outras", points: 1 },
    ],
  },
  {
    id: "p4",
    text: "Usuário de Lente de Contato?",
    view: "botoes",
    multi: false,
    options: [
      { label: "Sim", points: 1 },
      { label: "Não", points: 0 },
    ],
  },
  {
    id: "p5",
    text: "Faz uso de colírio (lágrima artificial)?",
    view: "dropdown",
    multi: true,
    options: [
      { label: "Não", points: 0 },
      { label: "Antialérgico (Coceira/Vermelhidão)", points: 2 },
      { label: "Higiene para as pálpebras", points: 2 },
      { label: "Lubrificante (Lágrimas artificiais)", points: 2 },
      { label: "Ômega 3", points: 2 },
      { label: "Vermelhidão (Claril, Lerin, Moura Brasil)", points: 2 },
      { label: "Outros", points: 2 },
    ],
  },
  {
    id: "p6",
    text: "Está fazendo uso de medicação controlada?",
    view: "dropdown",
    multi: true,
    options: [
      { label: "Não", points: 0 },
      { label: "Anti-histamínicos/Antitiroidianos", points: 1 },
      { label: "Anticoncepcional (Pílulas Orais/DIU/Outros)", points: 1 },
      { label: "Antidepressivos/Ansiolíticos/Para dormir ou Insônia", points: 1 },
      { label: "Doxaciclina", points: 2 },
      { label: "Medicamento para Calvície/Finasterida", points: 1 },
      { label: "Pressão Arterial", points: 1 },
      { label: "Pressão Ocular (Glaucoma)", points: 1 },
      { label: "Roacutan", points: 1 },
      { label: "Outras", points: 1 },
    ],
  },
  {
    id: "p7",
    text: "Tem diagnóstico de doença sistêmica?",
    view: "dropdown",
    multi: true,
    options: [
      { label: "Não", points: 0 },
      { label: "Diabetes Mellitus (Tipos 1 e 2)", points: 1 },
      { label: "Doença de Sjögren/Stevens-Johnson", points: 5 },
      { label: "Doenças Infecciosas Sistêmicas/Renais Crônicas", points: 1 },
      { label: "Doenças: Lúpus, Artrite Reumatoide e Psoríase", points: 1 },
      { label: "Rosácea/Rosácea Ocular", points: 2 },
      { label: "Outras", points: 1 },
    ],
  },
  {
    id: "p8",
    text: "Já fez algum tratamento para olho seco?",
    view: "dropdown",
    multi: true,
    options: [
      { label: "Não", points: 0 },
      { label: "Blephex/AbMax", points: 1 },
      { label: "Jettplasma", points: 1 },
      { label: "Luz Intensa Pulsada (IPL)", points: 2 },
      { label: "Plug Lacrimal", points: 2 },
      { label: "Termo Aquecimento (Lipflow/iLux)", points: 2 },
      { label: "Outros", points: 1 },
    ],
  },

  // === SEÇÃO: sensações nos últimos sete dias ===
  {
    id: "p9",
    section: "Nos últimos sete dias, você teve alguma dessas sensações?",
    text: "Olhos sensíveis à luz?",
    view: "botoes",
    multi: false,
    options: ESCALA_FREQ,
  },
  {
    id: "p10",
    section: "Nos últimos sete dias, você teve alguma dessas sensações?",
    text: "Sensação de areia nos olhos?",
    view: "botoes",
    multi: false,
    options: ESCALA_FREQ,
  },
  {
    id: "p11",
    section: "Nos últimos sete dias, você teve alguma dessas sensações?",
    text: "Dor ou irritação nos olhos?",
    view: "botoes",
    multi: false,
    options: ESCALA_FREQ,
  },
  {
    id: "p12",
    section: "Nos últimos sete dias, você teve alguma dessas sensações?",
    text: "Visão embaçada ou olhos cansados?",
    view: "botoes",
    multi: false,
    options: ESCALA_FREQ,
  },

  // === SEÇÃO: dificuldades em tarefas ===
  {
    id: "p13",
    section: "Nos últimos sete dias, você teve dificuldades para realizar as seguintes tarefas?",
    text: "Dificuldades para ler?",
    view: "botoes",
    multi: false,
    options: ESCALA_FREQ,
  },
  {
    id: "p14",
    section: "Nos últimos sete dias, você teve dificuldades para realizar as seguintes tarefas?",
    text: "Dificuldades para dirigir à noite?",
    view: "botoes",
    multi: false,
    options: ESCALA_FREQ,
  },
  {
    id: "p15",
    section: "Nos últimos sete dias, você teve dificuldades para realizar as seguintes tarefas?",
    text: "Dificuldades para usar Celular/Tablet, Computador, TV?",
    view: "botoes",
    multi: false,
    options: ESCALA_FREQ,
  },

  // === SEÇÃO: incômodo em situações ===
  {
    id: "p16",
    section: "Nos últimos sete dias, seus olhos o incomodaram em algumas dessas situações?",
    text: "Incômodo em lugares com vento?",
    view: "botoes",
    multi: false,
    options: ESCALA_FREQ,
  },
  {
    id: "p17",
    section: "Nos últimos sete dias, seus olhos o incomodaram em algumas dessas situações?",
    text: "Incômodo em lugares muito secos ou com pó?",
    view: "botoes",
    multi: false,
    options: ESCALA_FREQ,
  },
  {
    id: "p18",
    section: "Nos últimos sete dias, seus olhos o incomodaram em algumas dessas situações?",
    text: "Incômodo em lugares com ar-condicionado?",
    view: "botoes",
    multi: false,
    options: ESCALA_FREQ,
  },

  {
    id: "p19",
    text: "Durante um dia típico do mês passado, com qual frequência sentiu Desconforto Ocular?",
    view: "dropdown",
    multi: false,
    options: ESCALA_FREQ2,
  },
  {
    id: "p20",
    text: "Qual foi a intensidade do Desconforto Ocular no fim do dia, antes de se deitar?",
    view: "dropdown",
    multi: false,
    options: ESCALA_INTENS,
  },
  {
    id: "p21",
    text: "Durante um dia típico do mês passado, com qual frequência sentiu Ressecamento Ocular?",
    view: "dropdown",
    multi: false,
    options: ESCALA_FREQ2,
  },
  {
    id: "p22",
    text: "Qual foi a intensidade do Ressecamento no fim do dia, antes de se deitar?",
    view: "dropdown",
    multi: false,
    options: ESCALA_INTENS,
  },
  {
    id: "p23",
    text: "Durante um dia típico do mês passado, com qual frequência sentiu os olhos Lacrimejarem?",
    view: "dropdown",
    multi: false,
    options: ESCALA_FREQ2,
  },
  {
    id: "p24",
    text: "Qual foi a intensidade do Lacrimejamento no fim do dia, antes de se deitar?",
    view: "dropdown",
    multi: false,
    options: ESCALA_INTENS,
  },

];

// --- Faixas de resultado -----------------------------------------------------

export interface ScoreBand {
  min: number;
  max: number;
  label: string;
  color: string;
  msg: string;
}

export const SCORE_BANDS: ScoreBand[] = [
  {
    min: 0,
    max: 19,
    label: "Normal",
    color: "#22c55e",
    msg: "De acordo com suas respostas, você não apresenta sintomas anormais.",
  },
  {
    min: 20,
    max: 39,
    label: "Leve",
    color: "#eab308",
    msg: "De acordo com suas respostas, você apresenta leves sintomas de desconforto ocular, sugerimos informar ao seu médico sobre essa condição e como tratá-la.",
  },
  {
    min: 40,
    max: 59,
    label: "Moderado",
    color: "#f97316",
    msg: "De acordo com suas respostas, você apresenta sintomas anormais de desconforto ocular, relacionados a doença de olho seco. Sugerimos informar ao seu médico sobre essa condição e como tratá-la.",
  },
  {
    min: 60,
    max: 9999,
    label: "Grave",
    color: "#ef4444",
    msg: "De acordo com suas respostas, você apresenta sintomas anormais e graves, relacionados a doença  de olho seco. Sugerimos informar ao seu médico sobre essa condição e como tratá-la. ",
  },
];

// Usado só para preencher o termômetro visualmente (o texto usa faixas fixas).
export const SCORE_MAX_ESCALA = 100;

// Marcadores das faixas desenhados na régua do termômetro.
export const BAND_TICKS = [20, 40, 60];

// Segundos até o reset automático (modo kiosk).
export const KIOSK_RESET_SECONDS = 30;
