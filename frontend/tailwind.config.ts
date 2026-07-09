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
        script: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        'playfair-italic': ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#ffffff',
        muted: '#767d88',
        'muted-dark': '#404040',
        brand: '#ffffff',
        surface: '#1a1a1a',
        'page-bg': '#000000',
        'on-dark': '#ffffff',
        'on-brand': '#030303',
        primary: '#0c0c0c',
        secondary: '#767d88',
        anthracite: '#1a1a1a',
        'rich-black': '#000000',
        'vivid-yellow': '#c9ccd1',
      },
      boxShadow: {
        soft: 'none',
        'soft-hover': 'none',
        'card-hover': 'none',
      },
    },
  },
  plugins: [],
}
export default config
