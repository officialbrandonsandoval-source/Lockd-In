import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          bg: "#0A0A0A",
          "bg-secondary": "#141414",
          card: "#1A1A1A",
          border: "#2A2A2A",
          gold: "#C9A84C",
          accent: "#E8E0D0",
          text: "#F5F0E8",
          "text-secondary": "#8A8578",
          danger: "#8B2500",
          success: "#2D5A27",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      animation: {
        shimmer: "shimmer 2.5s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201, 168, 76, 0)" },
          "50%": { boxShadow: "0 0 16px 4px rgba(201, 168, 76, 0.3)" },
        },
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #C9A84C 0%, #E8E0D0 50%, #C9A84C 100%)",
        "dark-gradient":
          "linear-gradient(180deg, #0A0A0A 0%, #141414 100%)",
        "shimmer-gradient":
          "linear-gradient(90deg, transparent 0%, rgba(201, 168, 76, 0.08) 50%, transparent 100%)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        gold: "0 0 12px rgba(201, 168, 76, 0.15)",
        "gold-lg": "0 0 24px rgba(201, 168, 76, 0.25)",
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 8px 32px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
