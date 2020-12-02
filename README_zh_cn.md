# webpack-generate-vue-router-plugin

[en](https://github.com/TonyXiang/webpack-generate-vue-router-plugin/blob/main/README.md)｜[中文](https://github.com/TonyXiang/webpack-generate-vue-router-plugin/blob/main/README_zh_cn.md)

> 根据目录自动生成路由文件;在开发环境使用时，会根据文件变化而自动更新路由文件;

## Requirements
- webpack >= v4.0.0

## Install
```bash
npm i webpack-generate-vue-router-plugin -D
```

## Example
如果有以下文件:
```
- src
 - views
  - dashboard
   - index.vue
   - table-data
    - index.vue
  - hello-world
   - index.vue
```

在 `webpack.config.js` 中设置：
```js
import WebpackGenerateVueRouterPlugin from 'webpack-generate-vue-router-plugin'

module.exports = {
  plugins: [
    new WebpackGenerateVueRouterPlugin({
      pattern: 'src/views/**/index.vue',
      routerFilePath: 'src/router/router.js',
      watchPath: 'src/views',
    })
  ]
}
```

会在`routerFilePath`这个路径下生成一个路由文件：
```js
/* eslint-disable */
export default {
  "dashboard": () => import(/* webpackChunkName: "dashboard" */ "@/views/dashboard/index.vue"),
  "table-data": () => import(/* webpackChunkName: "table-data" */ "@/views/dashboard/table-data/index.vue"),
  "hello-world": () => import(/* webpackChunkName: "hello-world" */ "@/views/hello-world/index.vue")
}
```

我们可以看到在生成的文件中有带有 `@`，那是因为在 `webpack.config.js` 设置了 `alias`:
```js
const path = require('path')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}
module.exports = {
  resolve: {
    alias: {
      '@': resolve('src'),
    }
  }
}
```

**如果设置了其他的`alias`或者不设置`alias`, 插件也能正确的处理**.

## Options

| params | type | default | isRequired | intro |
| - | - | - | - | - |
| pattern | `glob` | `undefined` | `true` | 匹配到的文件将被当成路由写入到最终的路由文件中 |
| routerFilePath | `String` | `undefined` | `true` | 生成的路由文件的路径 |
| watchPath | `String` | `undefined` | `true` | 告诉插件监听哪个目录文件的变化；当监听到文件变化时，会自动更新路由文件 |
| useBasename | `Boolean` | `false` | `false` | 如果有一个通过glob匹配到的文件 `src/views/.../org-management/org-list.vue`,在默认情况下会取`org-management`作为chunkName; 如果把`useBasename`设置为`true`,就会取`org-list` 作为 chunkName |

如果不想使用`org-management`或者`org-list`作为chunkName，你也可以在`src/views/.../org-management/org-list.vue` 文件中加入注释

```js
/** VueRouterKey foo-bar */
```

那么，`foo-bar` 将会被当成 chunkName:

```js
...
  "foo-bar": () => import(/* webpackChunkName: "foo-bar" */ "@/views/.../org-management/org-list.vue"),
...
```


