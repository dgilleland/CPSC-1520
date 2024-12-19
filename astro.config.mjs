// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://dgilleland.github.io',
	base: '/CPSC-1520',
	integrations: [
		starlight({
			title: 'CPSC-1520-DG',
			social: {
				github: 'https://github.com/dgilleland/CPSC-1520',
			},
			sidebar: [
				{
					label: 'Tutorials',
					autogenerate: { directory: 'tutorials' },
				},
				{
					label: 'How-To Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
