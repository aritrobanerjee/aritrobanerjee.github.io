/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ededed',
        muted: '#71717a',
        'subtle-border': '#222225',
        'subtle-hover': '#161618',
      },
      fontFamily: {
        sans: [
          'Geist',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'Geist Mono',
          'SF Mono',
          'Fira Code',
          'ui-monospace',
          'monospace'
        ],
      },
      maxWidth: {
        'portfolio': '580px',
      },
      letterSpacing: {
        'tightest': '-0.035em',
        'tighter': '-0.02em',
        'tight': '-0.01em',
      }
    },
  },
  plugins: [],
}
