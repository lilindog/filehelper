const Scan = require("./Scan");

class TreeEvent {
    constructor () {
        this._events = {};
        Object.keys(TreeEvent.types).forEach(k => this._events[k] = []);
    }
    on (eventname, cb) {
        this._events[eventname] && this._events[eventname].push(cb);
    }
    emit (eventname, data) {
        this._events[eventname] && this._events[eventname].forEach(cb => cb(data));
    }
}
TreeEvent.types = {
    step: "step",
    auth: "auth"
}

class TreeNode {
    constructor (options = {}) {
        Object.keys(options).forEach(k => options[k] ? this[k] = options[k] : TreeNode.defaultFields[k]);
    }
}
TreeNode.defaultFields = {
    ...Scan.ScanNode.defaultFields,
    childs: []
}

class Tree extends TreeEvent {
    constructor (options) {
        super();
        this._init(options);
        this._scan = null;
    }
    resume(...args) {
        this._scan.resume(...args);
    }
    parse (options) {
        this._init(options);
        return this._parse();
    }
    _parse () {
        let 
        resolve, 
        reject, 
        promise = new Promise((rs, rj) => {
            resolve = rs; 
            reject = rj;
        });
        const 
        scan = new Scan(this._buildScanOptions()),
        stack = [];
        this._scan = scan;
        scan.on("auth", node => this.emit(TreeEvent.types.auth, new TreeNode({...node})));
        scan.on("data", node => {
            this.emit(TreeEvent.types.step, node, new TreeNode({...node}));
            if (node.deep < stack.length) {
                stack.splice(node.deep);
            }
            if (node.type === Scan.ScanNode.types.DIR) {
                const treeNode = new TreeNode({...node, childs: []});
                stack.length && stack[stack.length - 1].childs.push(treeNode);
                stack.push(treeNode);
            }
            if (node.type === Scan.ScanNode.types.FILE) {
                stack[stack.length - 1].childs.push(new TreeNode({...node}));
            }
        });
        scan.on("done", () => {
            resolve(stack[0]);
        });
        scan.parse();
        return promise;
    }
    _init (options) {
        options && Object.keys(Tree.defaultOptions).forEach(k => options[k] !== undefined ? this[k] = options[k] : this[k] = Tree.defaultOptions[k]);
    }
    _buildScanOptions () {
        const options = Object.create(null);
        Object.keys(Tree.defaultOptions).forEach(k => options[k] = this[k]);
        return options;
    }
}
Tree.defaultOptions = {
    ...Scan.defaultOptions
}
Tree.TreeNode = TreeNode;

module.exports = Tree;