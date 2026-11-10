import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    category: z.string(),
    status: z.string(),
    role: z.string(),
    technologies: z.array(z.string()),
    repository: z.url(),
    diagram: z.enum(['soc', 'egis']),
    visibility: z.enum(['preview', 'private']).default('private'),
    factRefs: z.array(z.string()),
  }),
});

export const collections = { projects };
