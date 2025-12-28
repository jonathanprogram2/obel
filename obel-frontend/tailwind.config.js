/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Manrope"', '"Nimbus Sans"', 'system-ui', 'sans-serif'],
                // Explicit aliases
                nimbus: ['"Nimbus Sans"', 'sans-serif'],
                manrope: ['"Manrope"', 'system-ui', 'sans-serif'],
                orbitron: ['"Orbitron"', 'sans-serif'],
            },
        },
    },
    plugins: [],
};