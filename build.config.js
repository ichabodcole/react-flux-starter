var config = {
    src: './src',
    build: './build',
    dist: './dist',

    index: {
        src: 'src/index.html',
        dest: './build'
    },
    js: {
        entry:'./src/app/main.js',
        src: './src/app/**/*.js',
        dest: './build/assets'
    },
    less: {
        entry: './src/less/main.less',
        src: './src/less/**/*.less',
        dest: './build/assets'
    }
};

module.exports = config;
