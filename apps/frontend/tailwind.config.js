/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0720", // Deep dark purple
        surface: "#1e1035", // Rich purple for cards/sidebar
        primary: "#a855f7", // Purple 500
        secondary: "#7c3aed", // Violet 600 (Darker purple for gradient)
        success: "#10b981", // Green
        danger: "#ef4444", // Red
      }
    },
  },
  plugins: [],
}
