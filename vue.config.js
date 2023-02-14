const path = require("path");
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

// cdn预加载使用
const externals = {
    'vue': 'Vue',
    'vue-router': 'VueRouter',
    'vuex': 'Vuex',
    'axios': 'axios',
    'element-ui': 'ELEMENT',
    'echarts': 'echarts',
    'vue-clipboard2': 'VueClipboard',
    'html2canvas': 'html2canvas',
    'Sortable': 'Sortable',
    'draggable': 'vuedraggable'
}

const cdn = {
    css: [
        // element-ui css
        // 'https://cdn.bootcdn.net/ajax/libs/element-ui/2.15.1/theme-chalk/index.css'
        'https://cdn.staticfile.org/element-ui/2.15.9/theme-chalk/index.min.css'
    ],
    js: [
        // 本地cdn
        // 'https://cdn.odincert.cn/vuev2.6.12.js', // min
        'https://cdn.odincert.cn/vue-2.6.12.js', // 调试
        'https://cdn.odincert.cn/0.19.2axios.min.js',
        'https://cdn.odincert.cn/0.3.1vue-clipboard.min.js',
        'https://cdn.odincert.cn/0.5.0-beta4html2canvas.min.js',
        // 'https://cdn.odincert.cn/2.6.2-vue.runtime.min.js.js',
        'https://cdn.odincert.cn/3.0.2-vue-router.min.js',
        'https://cdn.odincert.cn/3.6.2-vuex.min.js',
        'https://cdn.odincert.cn/4.7.0-echarts.min.js',
        // 'https://cdn.odincert.cn/element-ui2.15.1.js',
        'https://cdn.odincert.cn/element-2.15.9.js',
        'https://cdn.odincert.cn/sortablejs@1.8.4Sortable.min.js',
        'https://cdn.odincert.cn/vuedraggablevuedraggable.umd.min.js'
    ]
}

if( process.env.VUE_APP_TITLE === 'production' ){
    cdn.js[0] = 'https://cdn.odincert.cn/vuev2.6.12.js'
}

module.exports = {
    publicPath: './',// 部署应用时的根路径(默认'/'),也可用相对路径(存在使用限制)
    outputDir: 'dist',// 运行时生成的生产环境构建文件的目录(默认''dist''，构建之前会被清除)
    assetsDir: '',//放置生成的静态资源(s、css、img、fonts)的(相对于 outputDir 的)目录(默认'')
    indexPath: 'index.html',//指定生成的 index.html 的输出路径(相对于 outputDir)也可以是一个绝对路径。
    pages: {//pages 里配置的路径和文件名在你的文档目录必须存在 否则启动服务会报错
        index: {//除了 entry 之外都是可选的
            entry: 'src/main.js',// page 的入口,每个“page”应该有一个对应的 JavaScript 入口文件
            template: 'public/index.html',// 模板来源
            filename: 'index.html',// 在 dist/index.html 的输出
            title: process.env.VUE_APP_TITLE === 'production' ? 'ODin元宇宙生态平台':'',// 当使用 title 选项时,在 template 中使用：<title><%= htmlWebpackPlugin.options.title %></title>
            chunks: ['chunk-vendors', 'chunk-common', 'index'] // 在这个页面中包含的块，默认情况下会包含,提取出来的通用 chunk 和 vendor chunk
        },
        //   subpage: 'src/subpage/main.js'//官方解释：当使用只有入口的字符串格式时,模板会被推导为'public/subpage.html',若找不到就回退到'public/index.html',输出文件名会被推导为'subpage.html'
    },
    lintOnSave: false,// 是否在保存的时候检查
    productionSourceMap: false,// 生产环境是否生成 sourceMap 文件
    css: {
        extract: process.env.VUE_APP_TITLE === 'production' ? true:false,// 是否使用css分离插件 ExtractTextPlugin
        sourceMap: false,// 开启 CSS source maps
        loaderOptions: {
            less: {
                prependData: `@import "~@/commonCss/public.less";`
            }
        },// css预设器配置项
        // modules: false,// 启用 CSS modules for all css / pre-processor files.
        requireModuleExtension: true,
    },
    configureWebpack(config){

    },
    chainWebpack(config) {
        config.externals(externals)

        config.plugin('html-index')
            .tap(args => {
                args[0].cdn = cdn
                return args
            })

        if (process.env.VUE_APP_TITLE === 'production') {
            config.plugins.delete('preload')
            config.plugins.delete('prefetch')

            config.optimization.minimizer = [  // 代码压缩
                new UglifyJsPlugin({
                    // 生产环境推荐关闭 sourcemap 防止源码泄漏
                    // 服务端通过前端发送的行列，根据 sourcemap 转为源文件位置
                    sourceMap: true,
                    uglifyOptions: {
                        warnings: false,
                        compress: {
                            drop_console: true,
                            drop_debugger: true,
                            pure_funcs: ['console.log']//移除console
                        }
                    }
                })
            ]

            config // GZIP压缩
                .plugin('compression')
                .use(CompressionWebpackPlugin)
                .tap(() => [
                    {
                        test: /\.js$|\.html$|\.css/, // 匹配文件名
                        threshold: 10240, // 超过10k进行压缩
                        deleteOriginalAssets: false // 是否删除源文件
                    }
                ])

            // config.module // 图片压缩
            //     .rule('images')
            //     .use('image-webpack-loader')
            //     .loader('image-webpack-loader')
            //     .options({
            //         bypassOnDebug: true
            //     })
            //     .end()
        }
    },
    devServer: {// 环境配置
        host: '0.0.0.0',
        port: 8080,
        https: false,
        hotOnly: false,
        open: false, //配置自动启动浏览器
        proxy: {// 配置多个代理(配置一个 proxy: 'http://47.108.137.145' )
            '/api': {
                target: 'https://test.odincert.cn',
                ws: true,
                changeOrigin: true
            },
            '/metaapi': {
                target: 'https://test.odincert.cn',
                ws: true,
                changeOrigin: true
            },
        }
    },
    pluginOptions: {// 第三方插件配置
        // ...
    }
};
