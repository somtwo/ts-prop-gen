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

function matchNodeArray(nodes, patterns, state, callOnMatch) {
	if(!Array.isArray(patterns))
		return false;

	var patternInfo = _.map(patterns, (pattern, index) => {
		var details = getPatternDetails(pattern);
		return { 
			pattern: pattern,
			properties: details.properties,
			meta: details.meta,
			index: index,
			timesMatched: 0
		};
	});

	for(var i in patternInfo) {
		var info = patternInfo[i];

		if(info.meta._orderedMatch) {
			if(nodes[i] != undefined && matchNode(nodes[i], info.pattern, state, callOnMatch))
				info.timesMatched = 1;
		}
		else {
			for(var p in nodes) {
				var node = nodes[p];
				if(matchNode(node, info.pattern, state, callOnMatch))
					info.timesMatched++;
			}
		}

		if(!info.meta._optional && (info.timesMatched == 0 || !info.meta._matchMultiple && info.timesMatched > 1))
			return false;
	}

	return true;
}

function matchNode(node, pattern, state, callOnMatch) {
	var details = getPatternDetails(pattern);

	for(var index in details.properties) {
		var propinfo = details.properties[index];

		var nodeProp = node[propinfo.key];
		if(nodeProp == undefined)
			return false;

		var type = typeof nodeProp;

		if(Array.isArray(nodeProp)) {
			if(!matchNodeArray(nodeProp, pattern[propinfo.key], state, callOnMatch))
				return false;
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