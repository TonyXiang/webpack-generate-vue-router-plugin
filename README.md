# webpack-generate-vue-router-plugin
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

**The plugin will work correct if you set other alias or set no alias**.

## Options

### pattern

- type: `glob`
- required: true
- glob pattern that tells the plugin witch file should be treat as a router file.

### routerFilePath
- type: `string`
- required: true
- the path of output router file.

### watchPath
- type: `string`
- required: true
- tell the plugin witch dir to watch.

