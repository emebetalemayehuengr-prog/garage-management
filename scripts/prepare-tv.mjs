import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = resolve(root, 'dist');
const configSource = resolve(root, 'tizen', 'config.xml');
const indexPath = resolve(dist, 'index.html');

await copyFile(configSource, resolve(dist, 'config.xml'));

const index = await readFile(indexPath, 'utf8');
if (/\b(?:src|href)="\/assets\//.test(index)) {
  throw new Error('TV preparation failed: index.html contains absolute asset paths.');
}

const tvBootstrap = `
<script>
  // Disable selection/context UI that can appear over a TV application.
  document.addEventListener('contextmenu', function (event) { event.preventDefault(); });
</script>`;

await writeFile(indexPath, index.replace('</body>', `${tvBootstrap}\n</body>`));

process.stdout.write(`Prepared Samsung TV web project: ${dist}\n`);
process.stdout.write('Next: npm run tv:package -- -CertificateProfile YOUR_PROFILE\n');
