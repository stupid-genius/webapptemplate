const CopyWebpackPlugin = require('copy-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

function sanitizePackage(buffer, type){
	const packageJSON = JSON.parse(buffer.toString());
	delete packageJSON.devDependencies;
	delete packageJSON.repository;
	delete packageJSON.scripts;
	switch(type){
	case 'full':
		packageJSON.scripts = {
			'start': 'npx nodemon src/index.js'
		};
		break;
	case 'spa':
		packageJSON.scripts = {
			'start': 'npx http-server -p 8080'
		};
		break;
	}
	return JSON.stringify(packageJSON, null, '\t');
}

module.exports = [{
	devServer: {
		static: './dist/public',
		devMiddleware: {
			writeToDisk: true
		}
	},
	entry: './app/public/scripts/index.js',
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader']
			}
		]
	},
	name: 'full',
	output: {
		clean: true,
		filename: 'public/scripts/index.js',
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{
					context: 'app',
					from: 'public/*'
				},
				{
					context: 'app',
					from: 'public/images/*'
				},
				{
					context: 'app',
					from: 'src/*'
				},
				{
					context: 'app',
					from: 'views/*'
				},
				{
					from: 'package.json',
					to: 'package.json',
					transform(content){
						return sanitizePackage(content, 'full');
					}
				}
			]
		})
	]
},{
	devServer: {
		static: './dist/public',
		devMiddleware: {
			writeToDisk: true
		}
	},
	entry: './app/public/scripts/index.js',
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader']
			}
		]
	},
	name: 'spa',
	output: {
		clean: true,
		filename: 'public/scripts/index.js',
	},
	plugins: [
		new BrowserSyncPlugin({
			// browse to http://localhost:3000/ during development
			host: 'localhost',
			port: 3000,
			// proxy the Webpack Dev Server endpoint
			// (which should be serving on http://localhost:3100/)
			// through BrowserSync
			proxy: 'http://localhost:8080/'
		},{
			// prevent BrowserSync from reloading the page
			// and let Webpack Dev Server take care of this
			reload: false
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					context: 'app',
					from: 'public/*'
				},
				{
					context: 'app',
					from: 'public/images/*'
				},
				{
					from: 'package.json',
					to: 'package.json',
					transform(content){
						return sanitizePackage(content, 'spa');
					}
				}
			]
		})
	]
}];
