const Scan = require("../lib/Scan");
const path = require("path");

let scan = new Scan({dir: "../../../", authSkip: !true});
scan.on("data", node => {
    console.log(node.name);
});
scan.on("auth", node => {
    console.log("无权限");
    console.log(node);
    setTimeout(() => {
        console.log(">> 继续");
        scan.resume();
    }, 1000);
});
scan.on("done", () => {
    console.log("!! 扫描 完啦");
});

scan.parse();
