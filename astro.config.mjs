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
			  baseUrl: 'https://github.com/dgilleland/CPSC-1520/edit/main/',
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
					label: 'About',
					collapsed: true,
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Start Here', slug: 'about/start-here' },
						{ label: 'Change Log', slug: 'about/change-log' },
						{ label: 'The Roadmap', slug: 'about/roadmap' },
						// An external link to the NASA website opening in a new tab.
						{
							label: 'JavaScript Reference',
							link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
							attrs: { target: '_blank', style: 'font-style: italic' },
							badge: { text: 'MDN', variant: 'note' }
						},
						{ label: 'Bonus Resources', slug: 'about/bonus' },
					],
				},
				{
					label: 'Tutorials',
					autogenerate: { directory: 'tutorials' },
				},
				{
					label: 'How-To Guides',
					autogenerate: { directory: 'guides' },
				},
				{
					label: 'Explanations',
					autogenerate: { directory: 'explanations' },
					collapsed: false,
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
					collapsed: false,
				},
			],
		}),
		tailwind({
			// Disable the default base styles:
			applyBaseStyles: false,
		})
	],
});