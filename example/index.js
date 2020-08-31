const Scan = require("../lib/Scan");
const Tree = require("../lib/Tree");

// !async function () {
//     let tree = new Tree({dir: "../../../"});
//     tree.on("auth", node => {
//         console.log(">> 么的权限");
//         console.log(node);
//         setTimeout(() => {
//             tree.resume();
//         }, 2000);
//     });
//     let treeNode = await tree.parse();
// }();

// const scan = new Scan({dir: "../../../", authSkip: false});
// scan.on("auth", node => {
//     console.log(">> 么的权限");
//     console.log(node);
//     setTimeout(() => {
//         console.log("继续>>");
//         scan.resume();
//     }, 2000);
// });
// scan.parse();