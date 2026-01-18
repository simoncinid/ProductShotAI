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
        'rich-black': '#101820',
        'vivid-yellow': '#FEE715',
        brand: '#FFC93A',
        primary: '#111111',
        secondary: '#4B5563',
        anthracite: '#111827',
        'page-bg': '#F5F5F7',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(15,23,42,0.08)',
        'soft-hover': '0 12px 40px rgba(15,23,42,0.12)',
        'card-hover': '0 20px 50px rgba(15,23,42,0.15)',
      },
    },
  },
  plugins: [],
}
export default config
