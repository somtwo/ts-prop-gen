const assert = require('assert');
const _ = require('lodash');
const fs = require('fs');
const React = require('react');

const generateFileText = require('./codeGen.js').generateFileText;

function writeTypeFile(fileName, outputText) {
	fs.writeFileSync(fileName, outputText);
}

function interfaceForClassName(className) {
	return `I${className}Props`;
}

function getClassBody(content, index) {
	// TODO: something legit
	return "({ 'propTypes': {'foo':React.PropTypes.number} })";
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
	var classRegex = /(?:var|let|const)\s+([\w-]+)\s+=\s+React\.createClass\s*\(\s*{/g;

	var matches;
	while((matches = classRegex.exec(content)) !== null)
	{
		var className = matches[1];

		var classBody = getClassBody(content, matches.index);
		var classObject = eval(classBody);

		if(classObject.propTypes == undefined) {
			console.log(`	Warning: Class ${className} does not contian propTypes and will be skipped`);
			continue;
		}

		var interfaceName = interfaceForClassName(className);

		output.interfaces.push({
			'name': interfaceName,
			'componentClassName': className,
			'members': getPropTypes(classObject.propTypes)
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