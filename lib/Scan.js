const { readdirSync, existsSync, statSync } = require("fs");
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
    dir: "dir",
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

class Scan extends ScanEvent {
    constructor (options) {
        super();
        this._init(options);
    }
    parse (options) {  
        this._init(options);
        this._checKPath(this.dir);
        this._scan(this.dir);
        this.emit(ScanEvent.types.done);
    }
    _scan (
        dir, 
        deep = 0
    ) {
        const dirNode = new ScanNode({
            type: ScanNode.types.DIR,
            name: basename(dir),
            path: resolve(dir),
            deep
        });
        this.emit(ScanEvent.types.dir, dirNode);
        this.emit(ScanEvent.types.data, dirNode);
        deep++;
        const childs = readdirSync(dir, {withFileTypes: true});
        childs.forEach(dirent => {
            if (this._isIgnore(dirent.name)) return;
            if (dirent.isDirectory()) {
                this._scan(resolve(dir, dirent.name), deep);
            } else {
                const fileNode = new ScanNode({
                    type: ScanNode.types.FILE,
                    name: dirent.name,
                    path: resolve(dir, dirent.name),
                    deep
                });
                this.emit(ScanEvent.types.file, fileNode);
                this.emit(ScanEvent.types.data, fileNode);
            }
        });
    }
    _init (options) {
        options && Object.keys(Scan.defaultOptions).forEach(k => options[k] ? this[k] = options[k] : this[k] = Scan.defaultOptions[k]);
        this.dir = resolve(this.dir);
    }
    _checKPath (path) {
        const head = "[Scan]";
        if (!existsSync(path)) throw `${head} 目录不存在 "${path}"`;
        if (!statSync(path).isDirectory()) throw `${head} 不是目录 "${path}"`;
    }
    _isIgnore (name) {
        if (this.excludes.includes(name)) return true;
        else return false;
    }
}
Scan.defaultOptions = {
    dir: "",
    excludes: []
}
Scan.ScanNode = ScanNode;

module.exports = Scan;