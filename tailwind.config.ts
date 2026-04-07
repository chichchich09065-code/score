import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#d5e3f3",
        background: "#eff6ff",
        foreground: "#0f172a",
        accent: "#2563eb",
        accentDark: "#1d4ed8",
        card: "#ffffff",
        muted: "#6b7280",
        softBlue: "#dbeafe",
        deepBlue: "#0f172a",
      },
    },
  },
  plugins: [],
};

export default config;
