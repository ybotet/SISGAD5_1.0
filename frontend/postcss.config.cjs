// postcss.config.cjs
// CommonJS PostCSS config — use this when package.json sets "type": "module"
// PostCSS (and some plugins) may still load the config via require, so a .cjs
// file is the most compatible option.
module.exports = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
