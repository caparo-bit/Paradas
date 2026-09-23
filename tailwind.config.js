/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8e6",
          100: "#ffedb3",
          400: "#ffc61a",
          500: "#f5b400",
          600: "#cc9600",
          900: "#1a1400",
        },
      },
    },
  },
  plugins: [],
};
