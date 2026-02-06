import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        script: ['var(--font-great-vibes)', 'Great Vibes', 'cursive'],
        'playfair-italic': ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      colors: {
        cream: '#fbfafb',
        muted: '#86819e',
        'muted-dark': '#625d73',
        brand: '#594ba0',
        surface: '#41394f',
        'page-bg': '#261f32',
        'on-dark': '#fbfafb',
        'on-brand': '#fbfafb',
        primary: '#261f32',
        secondary: '#625d73',
        anthracite: '#41394f',
        'rich-black': '#261f32',
        'vivid-yellow': '#594ba0',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(38,31,50,0.12)',
        'soft-hover': '0 12px 40px rgba(89,75,160,0.2)',
        'card-hover': '0 20px 50px rgba(38,31,50,0.2)',
      },
    },
  },
  plugins: [],
}
export default config
