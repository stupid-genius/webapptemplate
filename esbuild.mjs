import * as esbuild from 'esbuild';

const scripts = await esbuild.build({
	entryPoints: ['app/public/scripts/index.js'],
	bundle: true,
	outdir: 'dist/public/scripts'
});
const styles = await esbuild.build({
	entryPoints: ['app/public/styles/main.css'],
	bundle: true,
	outdir: 'dist/public/styles'
});
console.log(scripts, styles);
