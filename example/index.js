const Scan = require("../lib/Scan");
const Tree = require("../lib/Tree");
const fs = require("fs");

let tree = new Tree();
!async function () {
    let authNodes = [];
    tree.on("step", treeNode => {
        console.log(treeNode.name);
    });
    tree.on("auth", treeNode => {
        authNodes.push(treeNode);
        console.log("遇到了需要权限的：");
        console.log(treeNode);
        process.exit();
    });
    const res = await tree.parse({dir: "../../../", excludes: [".git", "node_modules"]});
    fs.writeFileSync("./out.json", JSON.stringify(res, null, 4));
    console.log("没有权限的有：");
    console.log(authNodes);
}();