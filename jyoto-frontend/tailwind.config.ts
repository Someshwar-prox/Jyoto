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
        abyssal: "#050507",
        neonCyan: "#00f3ff",
        electricLime: "#ccff00",
        vividOrange: "#ff6b00",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        'glow-pulse': 'glow-pulse 8s infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { transform: 'scale(1) translate(0, 0)', opacity: '0.3' },
          '100%': { transform: 'scale(1.2) translate(5%, 5%)', opacity: '0.6' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      backdropBlur: {
        "3xl": "64px",
      },
    },
  },
  plugins: [],
};
export default config;
