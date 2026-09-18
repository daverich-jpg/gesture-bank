/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Near-black canvas + neutral dark surfaces (was bluish "ink")
        ink: {
          DEFAULT: '#0A0A0A',
          soft: '#151515',
          muted: '#1C1C1C',
        },
        paper: {
          DEFAULT: '#F4F4F4',
          card: '#FFFFFF',
        },
        // Single vivid lime accent extracted from the reference
        accent: {
          DEFAULT: '#A3E635',
          soft: '#BEF264',
          dim: '#84B92C',
        },
        positive: '#A3E635',
        negative: '#F0674F',
        hair: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '30px',
      },
      boxShadow: {
        float: '0 24px 70px -24px rgba(0,0,0,0.75)',
        card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 14px 44px -28px rgba(0,0,0,0.8)',
        glow: '0 10px 30px -8px rgba(163,230,53,0.35)',
      },
    },
  },
  plugins: [],
}
