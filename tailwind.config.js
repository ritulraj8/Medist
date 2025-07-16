/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",   // for /src/app directory
    "./src/pages/**/*.{js,ts,jsx,tsx}", // for /src/pages directory if exists
    "./src/components/**/*.{js,ts,jsx,tsx}", // for components
    "./app/**/*.{js,ts,jsx,tsx}",       // fallback for /app directory
    "./pages/**/*.{js,ts,jsx,tsx}",     // fallback for /pages directory
    "./components/**/*.{js,ts,jsx,tsx}",// fallback for components
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
