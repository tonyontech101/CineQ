import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Near-black base with cool, stepped surfaces.
        ink: {
          DEFAULT: "#0A0A0C", // page background
          900: "#0A0A0C",
          800: "#131417", // surface / pill background
          700: "#1B1C20", // raised surface
          600: "#2A2C31", // borders
        },
        paper: {
          DEFAULT: "#F5F6F8", // primary text (cool white)
          muted: "#A6ABB3", // secondary text
          faint: "#7C818A", // tertiary text (AA on #0A0A0C)
        },
        // Cyan accent (repurposed "marquee" token so existing utilities update).
        marquee: {
          DEFAULT: "#5FC6E4",
          hover: "#84D6F0",
          soft: "rgba(95, 198, 228, 0.12)",
        },
        rating: {
          high: "#4ADE80",
          mid: "#5FC6E4",
          low: "#F87171",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
        panel: "16px",
        pill: "9999px",
      },
      maxWidth: {
        shell: "1600px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "hero-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "scale-in": "scale-in 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        "sheet-up": "sheet-up 260ms cubic-bezier(0.16, 1, 0.3, 1)",
        "hero-in": "hero-in 400ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
