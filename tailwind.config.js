/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Dinédit palette ──────────────────────────────────────────────────
        // Base : fond blanc, encre nuit, accent or.
        // Les flyers / visuels d'events apportent leur propre coloration.
        bone: '#FFFFFF',          // fond
        nuit: {
          DEFAULT: '#1B2A4A',
          light: '#2C3D62',
          dark: '#11192E',
        },
        gold: {
          DEFAULT: '#C9A063',
          light: '#D6B583',
          dark: '#A88546',
        },
        ink: '#1B2A4A',           // alias sémantique (encre principale)

        // ── Aliases de compatibilité (chassis hérité) ────────────────────────
        primary: {
          DEFAULT: '#1B2A4A',
          light: '#2C3D62',
          dark: '#11192E',
        },
        accent: '#C9A063',
        dark: '#1B2A4A',
        darker: '#FFFFFF',
      },

      fontFamily: {
        // Typo Dinédit — sobre, classique, posée.
        // Cormorant Garamond pour les titres, Inter pour le corps.
        // À ajuster si une charte typographique Dinédit émerge.
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        script: ['"Cormorant Garamond"', 'serif'],
      },

      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
