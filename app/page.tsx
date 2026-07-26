"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/store/useFormStore";

function maskCpf(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// Valida CPF pelos dígitos verificadores (mesma regra que o Sivoe aplica).
function cpfValido(value: string): boolean {
  const c = value.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  const dv = (base: string, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += +base[i] * (pesoInicial - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(c.slice(0, 9), 10) === +c[9] && dv(c.slice(0, 10), 11) === +c[10];
}

// Máscara de data no padrão brasileiro: dd/mm/aaaa.
function maskData(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length > 2) out += "/" + d.slice(2, 4);
  if (d.length > 4) out += "/" + d.slice(4, 8);
  return out;
}

// "15/06/1981" (BR) -> "1981-06-15" (ISO). Retorna "" se incompleta/inválida.
function brParaIso(br: string): string {
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  const d = +dd, mo = +mm, y = +yyyy;
  const dt = new Date(y, mo - 1, d);
  // rejeita datas impossíveis (ex.: 31/02) que o Date "rola" para o mês seguinte
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return "";
  if (dt > new Date()) return "";
  return `${yyyy}-${mm}-${dd}`;
}

// "1981-06-15" (ISO) -> "15/06/1981" (BR), para inicializar o campo visível.
function isoParaBr(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

// Idade (anos completos) a partir da data de nascimento YYYY-MM-DD.
function idadeDe(dataNascimento: string): string {
  if (!dataNascimento) return "";
  const dob = new Date(dataNascimento + "T00:00:00");
  if (isNaN(dob.getTime())) return "";
  const hoje = new Date();
  let idade = hoje.getFullYear() - dob.getFullYear();
  const m = hoje.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < dob.getDate())) idade--;
  return idade >= 0 && idade <= 120 ? String(idade) : "";
}

function maskTelefone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, a, b, c) => (c ? `(${a}) ${b}-${c}` : b ? `(${a}) ${b}` : `(${a}`));
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, a, b, c) => (c ? `(${a}) ${b}-${c}` : `(${a}) ${b}`));
}

export default function Home() {
  const router = useRouter();
  const reset = useFormStore((s) => s.reset);
  const setConsent = useFormStore((s) => s.setConsent);
  const patient = useFormStore((s) => s.patient);
  const setPatient = useFormStore((s) => s.setPatient);

  // Valor visível do campo de data no padrão BR (dd/mm/aaaa). O store guarda ISO.
  const [nascBr, setNascBr] = useState(() => isoParaBr(patient.dataNascimento));

  // Toda vez que voltamos à Home, começamos do zero (kiosk).
  useEffect(() => {
    reset();
    setNascBr("");
  }, [reset]);

  function onDataChange(value: string) {
    const br = maskData(value);
    setNascBr(br);
    const iso = brParaIso(br);
    setPatient({ dataNascimento: iso, idade: idadeDe(iso) });
  }

  const nome = patient.nome.trim();
  const dataNascimento = patient.dataNascimento.trim();
  const telefone = patient.telefone.trim();
  const cpf = patient.cpf.trim();
  const cpfDigits = cpf.replace(/\D/g, "");
  const cpfInvalido = cpfDigits.length === 11 && !cpfValido(cpf);
  const podeIniciar =
    nome.length >= 2 && idadeDe(dataNascimento) !== "" && telefone.length >= 8 && cpfValido(cpf);

  function iniciar() {
    if (!podeIniciar) return;
    setConsent(true);
    router.push("/form");
  }

  return (
    <main className="flex min-h-dvh flex-col items-center overflow-y-auto bg-off-white px-6 py-10 text-center">
      <div className="flex w-full max-w-xl flex-col items-center">
        <img
          src="/logo.png"
          alt="Instituto do Olho Seco"
          className="h-14 w-auto animate-fadeUp sm:h-16"
        />

        <div className="mt-7 flex w-full animate-fadeUp flex-col gap-4 rounded-xl border border-line bg-card p-5 text-left shadow-soft">
          <Field label="Nome completo">
            <input
              type="text"
              value={patient.nome}
              onChange={(e) => setPatient({ nome: e.target.value })}
              autoComplete="off"
              autoCapitalize="words"
              placeholder="Digite seu nome"
              className="input-triagem"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="CPF">
              <input
                type="text"
                inputMode="numeric"
                value={patient.cpf}
                onChange={(e) => setPatient({ cpf: maskCpf(e.target.value) })}
                autoComplete="off"
                placeholder="000.000.000-00"
                className="input-triagem"
              />
              {cpfInvalido && (
                <span className="mt-1 block text-xs font-medium text-red-600">CPF inválido — confira os números.</span>
              )}
            </Field>

            <Field label="Data de nascimento">
              <input
                type="text"
                inputMode="numeric"
                value={nascBr}
                onChange={(e) => onDataChange(e.target.value)}
                autoComplete="off"
                placeholder="dd/mm/aaaa"
                className="input-triagem"
              />
            </Field>
          </div>

          <Field label="Telefone com DDD">
            <input
              type="tel"
              inputMode="tel"
              value={patient.telefone}
              onChange={(e) => setPatient({ telefone: maskTelefone(e.target.value) })}
              autoComplete="off"
              placeholder="(11) 90000-0000"
              className="input-triagem"
            />
          </Field>
        </div>

        <button
          type="button"
          onClick={iniciar}
          disabled={!podeIniciar}
          className="mt-6 w-full touch-target rounded-lg bg-amber px-8 text-xl font-semibold text-graphite-deep shadow-lg transition-all enabled:hover:bg-amber-light enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-line disabled:text-mute disabled:shadow-none"
          style={{ minHeight: 72 }}
        >
          Iniciar check in consulta
        </button>

        <p className="mb-2 mt-5 max-w-md text-sm font-light text-mute">
          Esta triagem não substitui uma avaliação médica.
        </p>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-graphite">{label}</span>
      {children}
    </label>
  );
}
