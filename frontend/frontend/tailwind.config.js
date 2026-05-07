export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4DA8DA',
        aqua: '#7FD1B9',
        accent: '#F4A261',
        darkText: '#333333',
        lightText: '#777777',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #4DA8DA 0%, #7FD1B9 100%)',
      },
    },
  },
  plugins: [],
}
