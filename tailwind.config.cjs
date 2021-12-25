const config = {
	mode: 'jit',
	purge: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			borderRadius: {
				'circle': '50%'
			},
			colors: {
			},
			width: {
				'main-container': '1000px'
			}
		}
	},

	plugins: []
};

module.exports = config;
