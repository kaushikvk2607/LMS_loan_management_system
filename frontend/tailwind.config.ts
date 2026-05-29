import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        surface: "#f7f7f2",
        pine: "#0f766e",
        coral: "#dc5f4b",
        wheat: "#f2d48f"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
