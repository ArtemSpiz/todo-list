/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{vue,js,ts,jsx,tsx}',
		'./assets/img/**/*.{jpg,png}',
	],
	theme: {
		extend: {
			fontFamily: {
				custom: ['Racing Sans One', 'regular'],
			},
		},
	},
	plugins: [],
}
