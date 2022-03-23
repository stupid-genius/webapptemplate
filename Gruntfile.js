'use strict';

module.exports = function(grunt){
	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);

	const config = {
		build: 'build'
	};

	grunt.initConfig({
		config: config,
		browserSync: {
			options: {
				background: true,
				open: false
			},
			dev: {
				options: {
					files: ['app/**/*'],
					port: 9000,
					proxy: 'localhost:3000'
				},
			}
		},
		wiredep: {
			app: {
				// ignorePath: '../public/',
				src: [
					'app/views/bundle.ejs',
					'app/public/*.html'
				],
			},
			options: {
				directory: 'app/public/bower_components'
			}
		},
		run: {
			clean: {
				cmd: 'rm',
				args: ['-rf', '<%= config.build %>/']
			},
			start: {
				cmd: 'npm',
				args: ['run', 'nodemon']
			}
		},
		useminPrepare: {
			options: {
				dest: '<%= config.build %>/public'
			},
			html: [
				'app/views/bundle.ejs',
				'app/public/index.html'
			]
		},
		usemin: {
			css: ['<%= config.build %>/public/styles/{,*/}*.css'],
			html: [
				'<%= config.build %>/views/{,*/}*.ejs',
				'<%= config.build %>/public/{,*/}*.html'
			],
			options: {
				assetsDirs: ['<%= config.build %>/public/images'],
			}
		},
		htmlmin: {
			build: {
				options: {
					removeCommentsFromCDATA: true,
					collapseWhitespace: true,
					collapseBooleanAttributes: true,
					// removeAttributeQuotes: true,
					// removeRedundantAttributes: true,
					// useShortDoctype: true,
					removeEmptyAttributes: true,
					// removeOptionalTags: true
				},
				files: [{
					expand: true,
					cwd: '<%= config.build %>',
					src: ['public/*.html', 'views/*.ejs'],
					dest: '<%= config.build %>'
				}]
			}
		},
		imagemin: {
			full: {
				files: [{
					expand: true,
					cwd: 'app/public/images',
					src: '{,*/}*.{gif,ico,jpeg,jpg,png}',
					dest: '<%= config.build %>/public/images'
				}]
			},
			spa: {
				files: [{
					expand: true,
					cwd: 'app/public/images',
					src: '{,*/}*.{gif,jpeg,jpg,png}',
					dest: '<%= config.build %>/public/images'
				},{
					expand: true,
					cwd: 'app/public/images',
					src: '{,*/}*.ico',
					dest: '<%= config.build %>'
				}]
			}
		},
		copy: {
			full:{
				files: [{
					expand: true,
					cwd: 'app',
					dest: '<%= config.build %>/',
					src: [
						'{.*,*}',
						'public/*.*',
						'src/**',
						'views/**'
					]
				}]
			},
			spa: {
				files: [{
					expand: true,
					cwd: 'app/public',
					dest: '<%= config.build %>/public',
					src: [
						// '{.*,*}',
						'*.*'
					]
				}]
			}
		},
		compress: {
			build: {
				options: {
					archive: function() {
						var packageJSON = grunt.file.readJSON('package.json');
						return `dist/${packageJSON.name}-${packageJSON.version}.zip`;
					}
				},
				files: [{
					expand: true,
					cwd: '<%= config.build %>',
					src: ['**'],
					dest: ''
				}]
			}
		},
		build: {
			full: [
				'run:clean',
				'useminPrepare',
				'concat:generated',
				'cssmin:generated',
				'uglify:generated',
				'imagemin:full',
				'copy:full',
				'usemin',
				'htmlmin',
				'buildPackageJSON:full'
			],
			spa: [
				'run:clean',
				'useminPrepareSPA',
				'useminPrepare',
				'concat:generated',
				'cssmin:generated',
				'uglify:generated',
				'imagemin:spa',
				'copy:spa',
				'usemin',
				'htmlmin',
				'postBuild',
				'buildPackageJSON:spa'
			]
		}
	});

	grunt.registerMultiTask('build', 'create build', function(){
		grunt.task.run(this.data);
	});
	grunt.registerTask('buildPackageJSON', 'build deployment package.json', function(type){
		const packageJSON = grunt.file.readJSON('package.json');
		delete packageJSON.devDependencies;
		delete packageJSON.eslintConfig;
		delete packageJSON.main;
		delete packageJSON.repository;
		delete packageJSON.scripts;
		switch(type){
		case 'full':
			packageJSON.scripts = {
				'start': 'npx nodemon src/index.js'
			};
			break;
		case 'spa':
			delete packageJSON.engines;
			delete packageJSON.dependencies;
			delete packageJSON.overrides;
			packageJSON.scripts = {
				'start': 'npx http-server -p 8000'
			};
			break;
		}
		grunt.file.write(`${config.build}/package.json`, JSON.stringify(packageJSON, null, '\t'));
	});
	grunt.registerTask('useminPrepareSPA', 'configure useminPrepare for SPA build', function(){
		grunt.config('useminPrepare.options.dest', config.build);
	});
	grunt.registerTask('postBuild', 'cleanup SPA build', function(){
		grunt.file.copy(`${config.build}/public`, config.build);
		grunt.file.delete(`${config.build}/public`);
	});
	grunt.registerTask('serve', 'start local server', function(){
		grunt.task.run([
			'browserSync:dev',
			'run:start'
		]);
	});
	grunt.registerTask('zip', 'build deployment archive', 'compress');
	grunt.registerTask('default', 'serve');
};

