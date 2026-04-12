// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import tailwindcss from '@tailwindcss/vite';

import svelte from '@astrojs/svelte';

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
            lastUpdated: true,
            customCss: [
                // Path to your Tailwind base styles:
                './src/tailwind.css',
                'katex/dist/katex.min.css',
            ],
            components: {
                Footer: './src/components/override/Footer.astro',
            },
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/dgilleland/CPSC-1520' }
            ],
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
                        { label: 'Lab Setup', slug: 'about/lab-setup' },
                        { label: 'Lab Updates', slug: 'about/lab-updates' },
                        { label: 'Dana\'s Docs', slug: 'about/dana-cpsc-1520' },
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
                {
                    label: 'Demos',
                    autogenerate: { directory: 'demos' },
                },
            ],
		}),
        svelte()
    ],
    markdown: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
    },
    vite: { 
        build: { sourcemap: true },
        plugins: [tailwindcss()]
    },
});