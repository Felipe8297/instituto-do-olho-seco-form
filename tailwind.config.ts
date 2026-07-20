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
        // Identidade do Instituto do Olho Seco (navy + dourado)
        navy: "#192938",
        "navy-deep": "#111d27",
        "navy-mid": "#1e3347",
        amber: "#C9A66B",
        "amber-light": "#e0c08e",
        ink: "#1a1a2e", // texto principal
        mute: "#5a6478", // texto secundário
        line: "#dde3ed", // bordas
        "off-white": "#f7f8fa",
        card: "#ffffff",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "10px",
        lg: "18px",
      },
      boxShadow: {
        soft: "0 4px 24px rgba(25,41,56,.10)",
        lg: "0 12px 48px rgba(25,41,56,.16)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
