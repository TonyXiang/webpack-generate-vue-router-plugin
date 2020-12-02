const glob = require('glob');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const PLUGIN_NAME = 'WebpackGenerateVueRouterPlugin';

// A JavaScript class.
class WebpackGenerateVueRouterPlugin {
  constructor(options) {
    if (!options) {
      throw new Error(`${PLUGIN_NAME}: options is required`);
    }
    if (!options.watchPath) {
      throw new Error(`${PLUGIN_NAME}: options.watchPath is required`);
    }
    if (!options.pattern) {
      throw new Error(`${PLUGIN_NAME}: options.pattern is required`);
    }
    if (!options.routerFilePath) {
      throw new Error(`${PLUGIN_NAME}: options.routerFilePath is required`);
    }
    this.options = options || {};
    this.watcher = null;
    this.isOnWatch = false;
    this.chunkNames = [];
    this.errors = [];
    this.aliasList = [];
    this.routerKeyMatch = /\/\*\*\s*(VueRouterKey)\s*(\S*)\s*\*\//;
  }

  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    const alias = compiler.options.resolve.alias || {};
    Object.keys(alias).forEach((key) => {
      this.aliasList.push({
        key,
        value: alias[key],
      });
    });

    compiler.hooks.watchRun.tapAsync(PLUGIN_NAME, async (compiler, callback) => {
      if (!this.watcher) {
        await this.generateRouter();
        this.watcher = this.createWatcher();
        this.isWatcherCreated = true;
      }
      callback();
    });

    compiler.hooks.beforeRun.tapAsync(PLUGIN_NAME, async (compiler, callback) => {
      await this.generateRouter();
      callback();
    });

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      if (this.errors.length) {
        compilation.errors.push(...this.errors);
      }
    });

    compiler.hooks.done.tap(PLUGIN_NAME, () => {
      this.isOnWatch = true;
    });
  }

  generateRouter() {
    return new Promise((resolve, reject) => {
      this.chunkNames = [];
      this.errors = [];
      const { pattern, routerFilePath } = this.options;
      glob(pattern, {}, (error, files) => {
        if (error) return reject(error);

        const output = this.generateFileContent(files);
        const oldCode = fs.existsSync(routerFilePath) ? fs.readFileSync(routerFilePath, { encoding: 'utf8' }) : null;
        if (oldCode !== output) {
          fs.writeFileSync(routerFilePath, output);
        }
        resolve();
      });
    });
  }

  generateFileContent(files) {
    const routerNodeList = files.map((file) => {
      return this.getRouterNode(file);
    });
    return `/* eslint-disable */\nexport default {\n${routerNodeList.join('')}}`;
  }

  getAliasPath(file) {
    const newPath = path.resolve(file);
    for (let i = 0; i < this.aliasList.length; i++) {
      const alias = this.aliasList[i];
      if (newPath.indexOf(alias.value) === 0) {
        return newPath.replace(alias.value, alias.key);
      }
    }
    return file;
  }

  getRouterNode(file) {
    const aliasPath = this.getAliasPath(file);
    const chunkName = this.getChunkName(file);
    if (this.chunkNames.find((item) => item === chunkName)) {
      this.errors.push(new Error(`${PLUGIN_NAME}: Duplicate route key "${chunkName}"`));
    }
    this.chunkNames.push(chunkName);
    return `  "${chunkName}": () => import(/* webpackChunkName: "${chunkName}" */ "${aliasPath}"),\n`;
  }

  getChunkName(file) {
    const content = fs.readFileSync(file, { encoding: 'utf8' });
    const result = this.routerKeyMatch.exec(content);
    if (result && result[2]) {
      return result[2];
    }
    if (this.options.useBasename) {
      return path.basename(file, path.extname(file));
    }
    const dirname = path.dirname(file);
    const newPath = dirname.split('/').pop();
    return newPath;
  }

  createWatcher() {
    const { watchPath } = this.options;
    const watcher = chokidar.watch(watchPath).on('all', (event, path) => {
      if (this.isOnWatch) {
        this.addTask();
      }
    });
    return watcher;
  }

  addTask() {
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.generateRouter();
        this.timer = null;
      }, 100);
    } else {
      clearTimeout(this.timer);
      this.timer = null;
      this.addTask();
    }
  }
}

module.exports = WebpackGenerateVueRouterPlugin;
