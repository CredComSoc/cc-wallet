/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				'ccgreen': '#0c5c44',
				'ccblack': '#040404',
			}
		}
	},

	plugins: [require('@tailwindcss/forms')]
};

module.exports = config;
