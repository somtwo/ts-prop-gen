const _ = require('lodash');

function getPatternDetails(pattern) {
	var result = {
		properties: [],
		meta: {}
	};

	_.forOwn(pattern, (value, key) => {
		if(key.indexOf("_") == -1) {
			result.properties.push({ key: key, value: value });
		}
		else {
			result.meta[key] = value;
		}
	});

	return result;
}

function matchNode(node, pattern, state, callOnMatch) {
	var details = getPatternDetails(pattern);

	for(var i = 0; i < details.properties.length; ++i) {
		var propinfo = details.properties[i];

		var nodeProp = node[propinfo.key];
		if(nodeProp == undefined)
			return false;

		var type = typeof nodeProp;

		if(Array.isArray(nodeProp)) {
			// TODO
		}
		else if(type == 'object') {
			if(!matchNode(nodeProp, pattern[propinfo.key], state, callOnMatch))
				return false;
		}
		else if (nodeProp !== pattern[propinfo.key]) {
			return false;
		}
	}

	if(typeof details.meta._onMatch == 'function' && callOnMatch) {
		details.meta._onMatch(node, state);
	}
	return true;
}

function matchTree(node, pattern, state) {
	return matchNode(node, pattern, state, true);
}


module.exports = {
	matchTree: matchTree
}