module.exports = nameSpace = Object.create(null);

/**
 * 文件操作辅助函数 
 */

const Scan = require("./lib/Scan");
const Tree = require("./lib/Tree");

/**
 * 目录扫描类 
 * 
 * 实例化参数:
 *         <Scan.defaultOptions>
 * 实例方法：
 *         parse(<Scan.defaultOptions>) 无返回参数
 * 实例事件：
 *         dir  <Scan.ScanNode>
 *         file 参数同上
 *         data 参数同上
 *         done 无参数
 *         auth <Scan.ScanNode>
 */
nameSpace["Scan"] = Scan;

/**
 * 目录树生成类
 * 
 * 实例化参数: 
 *         <Tree.defaultOptions>
 * 实例方法：
 *         async parse(<Tree.defaultOptions>) Resolve(<Tree.TreeNode>)
 * 实例事件：
 *         step <Tree.TreeNode>
 *         auth <Tree.TreeNode>
 * 静态属性: 
 *         Tree.TreeNode
 *         Tree.TreeEvent
 */
nameSpace["Tree"] = Tree;