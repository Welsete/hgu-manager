/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Status disponibilidade Magic Tool (regra 7 dias)
        status: {
          available: '#22c55e', // verde
          warning: '#eab308',   // amarelo (5-7 dias)
          blocked: '#ef4444'    // vermelho (< 5 dias)
        }
      }
    }
  },
  plugins: []
}
