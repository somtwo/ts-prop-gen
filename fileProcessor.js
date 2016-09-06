const assert = require('assert');
const _ = require('lodash');
const fs = require('fs');
const React = require('react');

const generateFileText = require('./codeGen.js').generateFileText;

function writeTypeFile(fileName, outputText) {
	fs.writeFileSync(fileName, outputText);
}

function interfaceForClassName(className) {	return `I${className}Props`; }

function getClassBody(content, index) {
	var paranLevel = 0;
	var start, end, i;

	for(i = index; i < content.length; ++i) {
		if(content.charAt(i) == '(') {
			if(paranLevel == 0) start = i;

			paranLevel ++;
			continue;
		}

		if(content.charAt(i) == ')') {
			assert(paranLevel > 0, "paranLevel became less than 0");

			paranLevel --;

			if(paranLevel == 0) {
				end = i + 1;
				break;
			}
		}
	}

	assert(i < content.length, "Failed to find the end of the class declaration");
	var slice = content.slice(start, end);
	return slice;
}

function extractPropsFromBody(text) {
	var propsIndex = text.indexOf("propTypes");

	if(propsIndex == -1) {
		console.log("	Warning: no propTypes property defined in component definition.")
		return "({})";
	}

	var start, end, i, bracketLevel = 0;

	for(i = propsIndex; i < text.length; ++i) {
		var char = text.charAt(i);

		if(char == '{') {
			if(bracketLevel == 0) start = i;

			bracketLevel++;
			continue;
		}

		if(char == '}') {
			assert(bracketLevel > 0, "bracketLevel became less than 0 while extracting prop types.");
			bracketLevel--;

			if(bracketLevel == 0) {
				end = i + 1;
				break;
			}
		}
	}

	if(i == text.length) {
		console.log("	Warning: Failed to extract propTypes from class definition.");
		return {};
	}

	var slice = `(${text.slice(start, end)})`;
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

	// TODO: Determine what the namespace should be
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