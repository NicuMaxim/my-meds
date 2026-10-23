import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// Only generated output belonging to this project, never the database directory.
rmSync(fileURLToPath(new URL('../dist/', import.meta.url)), { recursive: true, force: true });
