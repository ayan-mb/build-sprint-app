import { mkdirSync, copyFileSync } from 'node:fs';
mkdirSync('public', { recursive: true });
copyFileSync('DRAFT_STYLE.md', 'public/DRAFT_STYLE.md');
