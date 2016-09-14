function matchTree(node, pattern, state) {
	if(node.type != pattern.type) return false;
	
	console.log("Matches so far!");
}


module.exports = {
	matchTree: matchTree
}