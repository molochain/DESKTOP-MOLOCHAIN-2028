import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "reveal-up": {
          from: { 
            opacity: "0", 
            transform: "translateY(20px)" 
          },
          to: { 
            opacity: "1", 
            transform: "translateY(0)" 
          },
        },
        "reveal-fade": {
          from: { 
            opacity: "0"
          },
          to: { 
            opacity: "1"
          },
        },
        "reveal-scale": {
          from: { 
            opacity: "0", 
            transform: "scale(0.95)" 
          },
          to: { 
            opacity: "1", 
            transform: "scale(1)" 
          },
        },
        "reveal-right": {
          from: { 
            opacity: "0", 
            transform: "translateX(-20px)" 
          },
          to: { 
            opacity: "1", 
            transform: "translateX(0)" 
          },
        },
        "reveal-left": {
          from: { 
            opacity: "0", 
            transform: "translateX(20px)" 
          },
          to: { 
            opacity: "1", 
            transform: "translateX(0)" 
          },
        },
        "reveal-staggered": {
          from: { 
            opacity: "0", 
            transform: "translateY(10px)" 
          },
          to: { 
            opacity: "1", 
            transform: "translateY(0)" 
          },
        },
        "ping-slow": {
          "0%": { 
            transform: "scale(1)", 
            opacity: "0.8" 
          },
          "70%, 100%": { 
            transform: "scale(1.7)", 
            opacity: "0" 
          },
        },
        "float": {
          "0%, 100%": { 
            transform: "translateY(0)" 
          },
          "50%": { 
            transform: "translateY(-5px)" 
          },
        },
        "pulse-subtle": {
          "0%, 100%": { 
            opacity: "1" 
          },
          "50%": { 
            opacity: "0.7" 
          },
        },
        "spinner": {
          to: {
            transform: "rotate(360deg)",
          },
        },
        "ripple": {
          "0%": {
            transform: "scale(0)",
            opacity: "0.8",
          },
          "100%": {
            transform: "scale(2)",
            opacity: "0",
          },
        },
        "shimmer": {
          "0%": {
            backgroundPosition: "-500px 0",
          },
          "100%": {
            backgroundPosition: "500px 0",
          },
        },
        "progress-indeterminate": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "50%": {
            transform: "translateX(0%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "wiggle": {
          "0%, 100%": {
            transform: "rotate(-3deg)",
          },
          "50%": {
            transform: "rotate(3deg)",
          },
        },
        "bounce-quick": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10%)",
          },
        },
        "dots": {
          "0%, 20%": {
            opacity: "0",
          },
          "50%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0",
          },
        },
        "dots-1": {
          "0%, 20%": {
            opacity: "0",
          },
          "50%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0",
          },
        },
        "dots-2": {
          "0%": {
            opacity: "0",
          },
          "33%": {
            opacity: "1",
          },
          "66%, 100%": {
            opacity: "0",
          },
        },
        "shift-background": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "reveal-up": "reveal-up 0.5s ease-out forwards",
        "reveal-fade": "reveal-fade 0.5s ease-out forwards",
        "reveal-scale": "reveal-scale 0.5s ease-out forwards",
        "reveal-right": "reveal-right 0.5s ease-out forwards",
        "reveal-left": "reveal-left 0.5s ease-out forwards",
        "reveal-staggered": "reveal-staggered 0.5s ease-out forwards",
        "ping-slow": "ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
        "spinner": "spinner 1s linear infinite",
        "ripple": "ripple 0.7s ease-out forwards",
        "shimmer": "shimmer 2s infinite linear",
        "progress-indeterminate": "progress-indeterminate 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1)",
        "wiggle": "wiggle 1s ease-in-out infinite",
        "bounce-quick": "bounce-quick 0.5s ease-in-out",
        "dots": "dots 1.4s infinite ease-in-out",
        "dots-1": "dots-1 1.4s 0.2s infinite ease-in-out",
        "dots-2": "dots-2 1.4s 0.4s infinite ease-in-out",
        "shift-background": "shift-background 3s ease infinite",
      },
      animationDelay: {
        "75": "75ms",
        "100": "100ms",
        "150": "150ms",
        "200": "200ms",
        "300": "300ms",
        "500": "500ms",
        "700": "700ms",
        "1000": "1000ms",
      },
      animationDuration: {
        "fast": "0.5s",
        "normal": "1s",
        "slow": "2s",
      },
      // Animation delay classes
      transitionDelay: {
        "100": "100ms",
        "200": "200ms",
        "300": "300ms",
        "400": "400ms",
        "500": "500ms",
        "700": "700ms",
        "1000": "1000ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
