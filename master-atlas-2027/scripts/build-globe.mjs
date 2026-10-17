import path from 'node:path';
import {build} from 'esbuild';

const root=path.resolve(import.meta.dirname,'..');
await build({
  entryPoints:[path.join(root,'scripts/globe-client.js')],
  bundle:true,
  minify:true,
  format:'iife',
  platform:'browser',
  target:'es2020',
  outfile:path.join(root,'dist/globe.js'),
  logLevel:'info'
});
