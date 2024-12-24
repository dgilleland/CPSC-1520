// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    site: 'https://dgilleland.github.io',
    base: '/CPSC-1520',
    integrations: [
		starlight({
			title: 'CPSC-1520-DG',
			editLink: {
			  baseUrl: 'https://github.com/dgilleland/CPSC-1520/edit/main/docs/',
			},
			customCss: [
			// Path to your Tailwind base styles:
			'./src/tailwind.css',
			],
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
						{ label: 'Lab Submission', slug: 'guides/lab-submission' },
					],
				},
				{
					label: 'Explanations',
					autogenerate: { directory: 'explanations' },
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
		tailwind({
			// Disable the default base styles:
			applyBaseStyles: false,
		})
	],
});