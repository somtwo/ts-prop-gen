const assert = require('assert');
const _ = require('lodash');
const fs = require('fs');
const React = require('react');

const generateFileText = require('./codeGen.js').generateFileText;

function writeTypeFile(fileName, outputText) {
	fs.writeFileSync(fileName, outputText);
}

function interfaceForClassName(className) {	return `I${className}Props`; }

function findMatchingBrackets(text, startIndex, openchar, closechar) {
	var openLevel = 0;
	var start, end, i;

	for(i = startIndex; i < text.length; ++i) {
		var char = text.charAt(i);

		if(char == openchar) {
			if(openLevel == 0) start = i;

			openLevel++;
			continue;
		}

		if(char == closechar) {
			assert(openLevel > 0, "openLevel became less than 0 while extracting prop types.");
			openLevel--;

			if(openLevel == 0) {
				end = i + 1;
				break;
			}
		}
	}

	if(i == text.length)	{
		return { 'found': false };
	}

	return {
		'found': true,
		'start': start,
		'end': end
	};
}


function getClassBody(content, index) {
	var pair = findMatchingBrackets(content, index, '(', ')');

	assert(pair.found, "Failed to find the end of the class declaration");

	var slice = content.slice(pair.start, pair.end);
	return slice;
}

function extractPropsFromBody(text) {
	var propsIndex = text.indexOf("propTypes");

	if(propsIndex == -1) {
		console.log("	Warning: no propTypes property defined in component definition.")
		return "({})";
	}

	var range = findMatchingBrackets(text, propsIndex, '{', '}')

	if(!range.found) {
		console.log("	Warning: Failed to extract propTypes from class definition.");
		return "({})";
	}

	var slice = `(${text.slice(range.start, range.end)})`;
	return slice;
}

function getTypeNameForReactPropType(type) {
	if(type == React.PropTypes.number)
		return 'number';
	else if(type == React.PropTypes.boolean)
		return 'boolean';
	else
		return 'any';
}

function getPropTypes(reactPropTypes) {
	var result = [];

	_.each(reactPropTypes, function(value, key) {
		var prop = {
			'name': key,
			'type': getTypeNameForReactPropType(value)
		};
		result.push(prop);
	});

	return result;
}

// TODO: Reference the base react.d.ts file
function processFile(fileName) {
	var content = fs.readFileSync(fileName, {'encoding': 'utf8'});
	
	var output = {
		'interfaces': [],
		'classes': []
	};

	// Look for react classes
	var classRegex = /(?:var|let|const)\s+([\w-]+)\s+=\s+React\s*\.\s*createClass\s*\(\s*{/g;

	var matches;
	while((matches = classRegex.exec(content)) !== null)
	{
		var className = matches[1];

		var classBody = getClassBody(content, matches.index);
		var propsObject = extractPropsFromBody(classBody);
		var propObject = eval(propsObject);

		var interfaceName = interfaceForClassName(className);

		output.interfaces.push({
			'name': interfaceName,
			'componentClassName': className,
			'members': getPropTypes(propObject)
		});

		output.classes.push({
			'name': className,
			'propsInterface': interfaceName
		});
	}

	return output;
}

function processFiles(config, fileNames) {
	var processedFiles = _.map(fileNames, function(value) {
		return processFile(value);
	});

	var interfaces = _.map(processedFiles, function(value) { return value.interfaces; });
	var classes = _.map(processedFiles, function(value) { return value.classes; });

	var output = {
		'moduleName': config.moduleName,
		'interfaces': _.flatten(interfaces),
		'classes': _.flatten(classes)
	};

	generateFileText(output);
	writeTypeFile(config.moduleName + ".d.ts", output.text);
}

module.exports = {
	'processFiles' : processFiles
}