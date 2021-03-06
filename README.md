# webpack-generate-vue-router-plugin

[en](https://github.com/TonyXiang/webpack-generate-vue-router-plugin/blob/main/README.md)｜[中文](https://github.com/TonyXiang/webpack-generate-vue-router-plugin/blob/main/README_zh_cn.md)

> A Webpack plugin to generate vue router;It will update the router file by watching router files add/change/delete.

## Requirements
- webpack >= v4.0.0

## Install
```bash
npm i webpack-generate-vue-router-plugin -D
```

## Example
If there are these files:
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

Settings in `webpack.config.js`
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

A .js file would be generated in path `routerFilePath` like this:
```js
/* eslint-disable */
export default {
  "dashboard": () => import(/* webpackChunkName: "dashboard" */ "@/views/dashboard/index.vue"),
  "table-data": () => import(/* webpackChunkName: "table-data" */ "@/views/dashboard/table-data/index.vue"),
  "hello-world": () => import(/* webpackChunkName: "hello-world" */ "@/views/hello-world/index.vue")
}
```

As you see, there is a `@` in `"@/views/dashboard/index.vue"`. Because I set alias in `webpack.config.js`:
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

**The plugin will work correctly if you set any other alias or set no alias**.

## Options

| params | type | default | isRequired | intro |
| - | - | - | - | - |
| pattern | `glob` | `undefined` | `true` | glob pattern that tells the plugin witch file should be treated as a router file. |
| routerFilePath | `String` | `undefined` | `true` | the path of output router file. |
| watchPath | `String` | `undefined` | `true` | tell the plugin witch dir should be watched. |
| useBasename | `Boolean` | `false` | `false` | if there is a router file `src/views/.../org-management/org-list.vue` that match the glob, `org-management` would be the chunkName by default; `org-list` would be the chunkName if `useBasename` is set to `true`. |

If you don't want to use `org-management` or `org-list` as chunkName，you can add comments in `src/views/.../org-management/org-list.vue`

```js
/** VueRouterKey foo-bar */
```

In this way, `foo-bar` would be the chunkName:

```js
...
  "foo-bar": () => import(/* webpackChunkName: "foo-bar" */ "@/views/.../org-management/org-list.vue"),
...
```
