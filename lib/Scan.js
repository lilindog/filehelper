const { readdirSync, existsSync, statSync, accessSync } = require("fs");
const { resolve, basename } = require("path");

class ScanEvent {
    constructor () {
        this._events = {};
        Object.keys(ScanEvent.types).forEach(k => this._events[k] = []);
    }
    on (eventName, cb) {
        this._events[eventName] && this._events[eventName].push(cb);
    }
    emit (eventName, data) {
        this._events[eventName] && this._events[eventName].forEach(cb => cb(data));
    }
}
ScanEvent.types = {
    data: "data",
    file: "file",
    dir:  "dir",
    auth: "auth",
    done: "done"
}

class ScanNode {
    constructor (fields) {
        Object.keys(ScanNode.defaultFields).forEach(k => fields[k] !== undefined ? this[k] = fields[k] : ScanNode.defaultFields[k]);
    }
}
ScanNode.defaultFields = {
    type: "",
    name: "",
    path: "",
    deep: 0
}
ScanNode.types = {
    FILE: "FILE",
    DIR: "DIR"
}

class ParseChild {
    constructor (options) {
        Object.keys(ParseChild.defaultOptions).forEach(key => options[key] !== undefined ? this[key] = options[key] : ParseChild.defaultOptions[key]);
    }
}
ParseChild.defaultOptions = {
    deep: 0,
    path: "",
    node: null
}

class Scan extends ScanEvent {
    constructor (options) {
        super();
        this._init(options);
        this._i = null;
    }
    resume (isAuthSkip = false) {
        if (this.authSkip) throw `[Scan] options.authSkip === true 的情况下调用resume方法不合法`;
        isAuthSkip && (this.authSkip = true);
        this._start();
    }
    parse (options) {  
        this._init(options);
        this._checKPath(this.dir);
        this._i = this._scan(this.dir);
        this._start();
    }
    _start () {
        let { done, value } = this._i.next();
        if (done) {
            this.emit(ScanEvent.types.done);
        } else {
            this.emit(ScanEvent.types.auth, value);
        }
    }
    * _scan (
        dir
    ) {
        const rootNode = new ScanNode({
            type: ScanNode.types.DIR,
            name: basename(dir),
            path: dir,
            deep: 0
        });
        this.emit(ScanEvent.types.data, rootNode);
        this.emit(ScanEvent.types.dir, rootNode);
        const stack = [...this._getParseChilds(dir, 1)];
        while (stack.length) {
            const child = stack.shift();
            if (child.node.isFile()) {
                const scanNode = new ScanNode({
                    type: ScanNode.types.FILE,
                    name: child.node.name,
                    path: child.path,
                    deep: child.deep
                });
                this.emit(ScanEvent.types.data, scanNode);
                this.emit(ScanEvent.types.file, scanNode);
            }
            if (child.node.isDirectory()) {
                const scanNode = new ScanNode({
                    type: ScanNode.types.DIR,
                    name: child.node.name,
                    path: child.path,
                    deep: child.deep
                });
                let parseChilds = [];
                try {
                    parseChilds = this._getParseChilds(child.path, child.deep + 1);
                } catch(err)  {
                    if (!this.authSkip) {
                        yield scanNode;
                        continue;
                    } else {
                        this.emit(ScanEvent.types.auth, scanNode);
                        continue;
                    }
                }
                this.emit(ScanEvent.types.data, scanNode);
                this.emit(ScanEvent.types.dir, scanNode);
                stack.unshift(...parseChilds);
            }
        }
    }
    _init (options) {
        options && Object.keys(Scan.defaultOptions).forEach(k => options[k] !== undefined ? this[k] = options[k] : this[k] = Scan.defaultOptions[k]);
        this.dir = resolve(this.dir);
    }
    _checKPath (path) {
        const head = "[Scan]";
        if (!existsSync(path)) throw `${head} 目录不存在 "${path}"`;
        if (!statSync(path).isDirectory()) throw `${head} 不是目录 "${path}"`;
    }
    _isIgnore (name, deep) {
        if (this.depth > Scan.defaultOptions.depth && deep > this.depth) return true;
        if (this.excludes.includes(name)) return true;
        return false;
    }
    _getParseChilds (path, deep) {
        const dirents = readdirSync(path, {withFileTypes: true});
        return dirents.filter(item => !this._isIgnore(item.name, deep)).map(item => new ParseChild({
            deep,
            path: resolve(path, item.name),
            node: item
        }));
    }
}
Scan.defaultOptions = {
    dir: "",
    depth: -1,
    excludes: [],
    authSkip: true
}
Scan.ScanNode = ScanNode;

module.exports = Scan;