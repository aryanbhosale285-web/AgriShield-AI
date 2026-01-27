/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                nature: {
                    900: '#1a3a2e', // Deep forest green (bg)
                    800: '#163328', // Slightly lighter
                    700: '#2d5a4c', // Card bg
                    600: '#38725f',
                    500: '#438e75',
                    400: '#4ade80', // Action green (buttons)
                    300: '#6ee7b7',
                    200: '#a7f3d0',
                    100: '#d1fae5',
                }
            }
        },
    },
    plugins: [],
}
