'use strict';

module.exports = function(grunt){
	require('time-grunt')(grunt);
	require('jit-grunt')(grunt);
	grunt.initConfig({
		browserSync: {
			options: {
				background: true,
			},
			dev: {
				options: {
					files: ['app/**/*'],
					port: 9000,
					proxy: 'localhost:3000'
				},
			}
		},
		copy: {
			build:{
				files: [{
					expand: true,
					cwd: 'app',
					dest: 'build/',
					src: [
						'styles/**',
						'scripts/**',
						'**'
					]
				}, {
					expand: true,
					cwd: 'app/pages',
					dest: 'build/',
					src: '*.html'
				}
				]
			}
		},
		run: {
			start: {
				cmd: 'npm',
				args: ['start']
			}
		}
	});

	grunt.registerTask('serve', 'start local server', function (){
		grunt.task.run([
			'browserSync:dev',
			'run:start'
		]);
	});
	grunt.registerTask('build', 'create build', function(){
		grunt.task.run([
			'copy'
		]);
	});
};

