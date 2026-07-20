# Triagem de Olho Seco — Tablet (Instituto do Olho Seco)

App de página única, **mobile-first para tablet**, com 24 perguntas pontuadas, termômetro de
resultado, geração de PDF, envio por e-mail e reset automático de 30s (modo kiosk).

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zustand · @react-pdf/renderer ·
Resend (via rota Next.js).

---

## Rodar localmente

```bash
pnpm install
pnpm dev        # abre em http://localhost:3000
```

`pnpm build && pnpm start` para o modo produção.

---

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável                   | Para quê                                             | Exemplo                       |
| -------------------------- | --------------------------------------------------- | ----------------------------- |
| `RESEND_API_KEY`           | Chave da API Resend (**só servidor**)               | `re_xxxxx`                    |
| `RESEND_FROM`              | Remetente do e-mail                                  | `onboarding@resend.dev`       |
| `REPORT_EMAIL`             | Destinatário (fallback no servidor)                 | `felipe8297@gmail.com`        |
| `NEXT_PUBLIC_REPORT_EMAIL` | Destinatário exposto ao front (sobrepõe o de cima)  | `felipe8297@gmail.com`        |

> A `RESEND_API_KEY` **nunca** vai para o navegador — o envio acontece na rota
> `app/api/send-report/route.ts`, no servidor.

---

## Estrutura

```
app/
  page.tsx                  # Home + consentimento LGPD (hero)
  form/page.tsx             # Wizard (1 pergunta por tela)
  result/page.tsx           # Termômetro + mensagem + envio + timer kiosk 30s
  api/send-report/route.ts  # Envia o PDF via Resend (server-side)
components/                  # Thermometer, ProgressBar, Question{Buttons,Boxes,Dropdown}
lib/
  form-config.ts            # 24 perguntas + faixas (fonte da verdade)
  scoring.ts                # calcScore / getBand
  generate-pdf.tsx          # PDF com termômetro embutido
store/useFormStore.ts       # estado (Zustand)
```

## Regras de negócio (resumo)

- Score = soma dos pontos das respostas marcadas.
- Múltipla escolha (`dropdown`): "Não" é exclusivo (desmarca as demais).
- Faixas: 0–19 Normal · 20–29 Leve · 30–39 Moderado · 40+ Grave.
- Termômetro visual escalado até 60 (faixas de texto fixas em 20/30/40).
- Todas as perguntas são obrigatórias para avançar.
- Reset automático 30s após inatividade na tela de resultado.
