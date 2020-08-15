const Scan = require("../lib/Scan");
const Tree = require("../lib/Tree");
const fs = require("fs");

let tree = new Tree();
!async function () {
    tree.on("step", treeNode => {
        console.log(treeNode.name);
    });
    const res = await tree.parse({dir: "../../sdtree", excludes: [".git", "node_modules"]});
    fs.writeFileSync("./out.json", JSON.stringify(res, null, 4));
}();