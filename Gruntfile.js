module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        watch: {
            dev: {
                files: [
                    'Gruntfile.js',
                    'public/js/modules/**/*.js',
                    'public/less/*.css',
                    'public/less/*.less'
                ],
                tasks: [
                    'jshint',
                    'concat:dist',
                    'clean',
                    'less',
                    'concat_css'
                ],
                options: {
                    spawn: false
                }
            },
            prod: {
                files: [
                    'Gruntfile.js',
                    'public/js/modules/**/*.js',
                    'public/less/*.css',
                    'public/less/*.less'
                ],
                tasks: [
                    'jshint',
                    'concat:dist',
                    'uglify:dist',
                    'clean',
                    'less',
                    'concat_css',
                    'cssmin'
                ],
                options: {
                    spawn: false
                }
            }
        },
        jshint: {
            all: [
                'Gruntfile.js',
                'public/js/modules/controllers/*.js',
                'public/js/modules/services/*.js'
            ]
        },

        clean: {
            dev: ["./public/less/main.less.css", "./public/less/main_style.css"],
            prod: ["./public/less/main.less.css", "./public/less/main_style.css", "./public/less/main_style.min.css"]
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'public/js/libs/jquery/jquery.js',
                    'public/js/libs/angular/angular.js',
                    'public/js/libs/angular/angular-resource.js',
                    'public/js/libs/angular/angular-route.js',
                    'public/js/libs/ui-bootstrap-tpls-0.11.0.min.js',
                    'public/js/modules/config.js',
                    'public/js/modules/app.js',
                    'public/js/modules/routes.js',
                    'public/js/modules/**/*.js'
                ],
                dest: 'public/dist/app.js'
            }
        },
        uglify: {
            dist: {
                files: {
                    'public/dist/app.min.js': ['public/dist/app.js']
                },
                options: {
                    mangle: false
                }
            }
        },
        less: {
            development: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    "./public/less/main.less.css": "./public/less/*.less"
                }
            }
        },
        concat_css: {
            all: {
                src: ["./public/less/*.css"],
                dest: "./public/less/main_style.css"
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: './public/less',
                    src: ['main_style.css'],
                    dest: './public/less',
                    ext: '.min.css'
                }]
            }
        }
    });
    grunt.registerTask('dev', [
        'jshint',
        'concat:dist',
        'clean:dev',
        'less',
        'concat_css',
        'watch:dev'
    ]);

    grunt.registerTask('prod', [
        'jshint',
        'concat:dist',
        'uglify:dist',
        'clean:prod',
        'less',
        'concat_css',
        'cssmin',
        'watch:prod'
    ]);

};