/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        "background-elevated": "var(--background-elevated)",
        "background-deep": "var(--background-deep)",
        foreground: "var(--foreground)",
        "foreground-muted": "var(--foreground-muted)",
        surface: "var(--surface)",
        "surface-light": "var(--surface-light)",
        "surface-glass": "var(--surface-glass)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          secondary: "var(--accent-secondary)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        brand: {
          indigo: "var(--cm-indigo)",
          violet: "var(--cm-deep-violet)",
          aqua: "var(--cm-aqua)",
          cyan: "var(--cm-cyan)",
          soft: "var(--cm-soft-white)",
          cool: "var(--cm-cool-gray)",
          navy: "var(--cm-navy-text)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        floating: "var(--shadow-floating)",
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        headline: ["var(--font-headline)"],
        body: ["var(--font-body)"],
        "heading-ar": ["var(--font-heading-ar)"],
        "body-ar": ["var(--font-body-ar)"],
        "heading-en": ["var(--font-heading-en)"],
        "body-en": ["var(--font-body-en)"],
      },
      fontSize: {
        "display-xl": [
          "clamp(2.25rem, 4.5vw, 3.75rem)",
          { lineHeight: "1.15", fontWeight: "700" },
        ],
        "display-lg": [
          "clamp(1.85rem, 3.5vw, 2.75rem)",
          { lineHeight: "1.2", fontWeight: "700" },
        ],
        "display-md": [
          "clamp(1.5rem, 2.5vw, 2rem)",
          { lineHeight: "1.25", fontWeight: "600" },
        ],
      },
      zIndex: {
        elevated: "var(--z-elevated)",
        sticky: "var(--z-sticky)",
        header: "var(--z-header)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
      },
      spacing: {
        nav: "var(--nav-height)",
        "nav-compact": "var(--nav-height-compact)",
        section: "var(--section-space)",
      },
      transitionDuration: {
        fast: "var(--motion-fast)",
        base: "var(--motion-base)",
        slow: "var(--motion-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        emphasized: "var(--ease-emphasized)",
      },
      animation: {
        "fade-in": "fadeIn var(--motion-base) var(--ease-standard)",
        "slide-up": "slideUp var(--motion-base) var(--ease-emphasized)",
        "slide-down": "slideDown var(--motion-base) var(--ease-emphasized)",
        float: "float var(--motion-ambient) var(--ease-standard) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
