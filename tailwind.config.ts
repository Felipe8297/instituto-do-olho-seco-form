import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema "lágrima clínica" — frio, calmo, legível (foge do cream+terracota padrão)
        ink: "#0C2A2E",       // texto principal / teal-ardósia profundo
        mute: "#4A6467",      // texto secundário
        bg: "#EDF3F2",        // fundo geral, off-white frio
        card: "#FFFFFF",
        aqua: "#0E9AA7",      // primário (água/lágrima)
        "aqua-deep": "#0B7A85",
        mist: "#CFE3E2",      // bordas suaves
        "mist-2": "#E2EDEC",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.5rem",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(12, 42, 46, 0.18)",
        card: "0 2px 12px -4px rgba(12, 42, 46, 0.12)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
