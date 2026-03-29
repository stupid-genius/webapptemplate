import * as esbuild from 'esbuild';
import { exec } from 'child_process';
import process from 'process';
import readline from 'readline';

const devMode = process.env.NODE_ENV === 'development';

// const onBuild = {
// 	name: 'onBuild',
// 	setup(build){
// 		build.onEnd(result => {
// 			// console.log(result);
// 			exec('./tools/build.sh spa', (err, stdout, stderr) => {
// 				if(err || stderr){
// 					console.dir(err);
// 					console.error(stderr);
// 				}
// 				console.log(stdout);
// 			});
// 		});
// 	}
// };

// async function createContext(){
//         return await esbuild.context({
//                 entryPoints: ['app/client/scripts/index.js', 'app/client/styles/main.css'],
//                 // entryNames: '[dir]/[name]-[hash]',
//                 loader: {'.png': 'dataurl'},
//                 bundle: true,
//                 minify: !devMode,
//                 sourcemap: devMode,
//                 outbase: 'app/client',
//                 outdir: 'dist/client',
//                 plugins: [onBuild]
//         });
// }

const context = await esbuild.context({
	entryPoints: [
		'app/client/scripts/index.js',
		'app/client/styles/main.css'
	],
	// entryNames: '[dir]/[name]-[hash]',
	loader: {
		'.png': 'dataurl'
	},
	bundle: true,
	minify: !devMode,
	sourcemap: devMode,
	outbase: 'app/client',
	outdir: 'dist/client',
	// plugins: [onBuild]
});

if(process.argv.length === 2){
        const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                prompt: '> '
        });

        rl.prompt();

        rl.on('line', async (line) => {
                switch(line.trim()){
                        case 'build':
                                console.log('building...');
                                await context.rebuild();
                                break;
                        case 'exit':
                                rl.close();
                                break;
                        case 'restart':
                                console.log('restarting...');
                                await context.rebuild();
                                break;
                        case 'serve':
                                console.log('serving...');
                                console.log(await context.serve({
                                        servedir: 'dist/client',
                                        port: 3000
                                }));
                                break;
                        case 'watch':
                                console.log('watching...');
                                await context.watch();
                                break;
                        default:
                                console.error(`Unknown command: ${cmd}`);
                }
                rl.prompt();
        }).on('close', async () => {
                console.log((await context.dispose()) || 'context disposed');
                process.exit(0);
        });
        rl.on('SIGINT', () => {
                rl.close();
        });
}else{
        await context.rebuild();
        console.log((await context.dispose()) || 'context disposed');
}

