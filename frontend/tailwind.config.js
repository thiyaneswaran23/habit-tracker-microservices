/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5", // A professional Indigo for buttons
        secondary: "#10B981", // Success green for completed habits
      }
    },
  },
  plugins: [],
}