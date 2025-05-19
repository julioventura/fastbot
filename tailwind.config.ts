
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brightblue: {
          DEFAULT: "#0766FF",
          50: "#E5EEFF",
          100: "#CCE0FF",
          200: "#99C0FF",
          300: "#5C96FF",
          400: "#1F6DFF",
          500: "#0766FF",
          600: "#0050D6",
          700: "#003BA0",
          800: "#002970",
          900: "#00163D",
        },
        brightpurple: {
          DEFAULT: "#9013FE",
          50: "#F0E5FF",
          100: "#DDCCFF",
          200: "#C599FF",
          300: "#A966FF",
          400: "#9733FF",
          500: "#9013FE",
          600: "#7700E0",
          700: "#5D00AD",
          800: "#42007A",
          900: "#280048",
        },
        teal: {
          DEFAULT: "#009898",
          50: "#E5FFFF",
          100: "#CCF7F7",
          200: "#99EDED",
          300: "#66E3E3",
          400: "#33D9D9",
          500: "#00CFCF",
          600: "#009898",
          700: "#006161",
          800: "#003A3A",
          900: "#001414",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(90deg, #0766FF 0%, #9013FE 100%)',
        'blue-gradient': 'linear-gradient(180deg, rgba(7, 102, 255, 0.05) 0%, rgba(7, 102, 255, 0) 100%)',
        'purple-gradient': 'linear-gradient(180deg, rgba(144, 19, 254, 0.05) 0%, rgba(144, 19, 254, 0) 100%)',
        'card-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%)',
      },
      boxShadow: {
        'card': '0px 8px 16px rgba(0, 0, 0, 0.05)',
        'button': '0px 4px 10px rgba(7, 102, 255, 0.3)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
