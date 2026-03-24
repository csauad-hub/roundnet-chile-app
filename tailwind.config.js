/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        blue: { 50:'#EEF2FB',100:'#D5DFFE',500:'#2550B8',600:'#1A3A8F',700:'#0E2570',900:'#060F30' },
        red: { 50:'#FDF0F2',500:'#C8102E',600:'#A30020' },
      },
      fontFamily: { sans:['var(--font-inter)','system-ui','sans-serif'], display:['var(--font-montserrat)','system-ui','sans-serif'] },
      animation: { 'float':'float 3s ease-in-out infinite','fade-in':'fadeIn 0.25s ease' },
      keyframes: {
        float:{'0%, 100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-8px)'}},
        fadeIn:{from:{opacity:'0',transform:'translateY(6px)'},to:{opacity:'1',transform:'translateY(0)'}},
      },
    },
  },
  plugins: [],
}