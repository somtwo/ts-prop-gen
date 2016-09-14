const assert = require('assert');
const _ = require('lodash');
const fs = require('fs');
const React = require('react');
const acorn = require('acorn-jsx');

const generateFileText = require('./codeGen.js').generateFileText;

function interfaceForClassName(className) {	return `I${className}Props`; }

function getTypeNameForReactPropType(type) {
	if(type == React.PropTypes.number)
		return 'number';
	else if(type == React.PropTypes.boolean)
		return 'boolean';
	else
		return 'any';
}

// TODO: Reference the base react.d.ts file
function processFile(fileName) {
	var content = fs.readFileSync(fileName, {'encoding': 'utf8'});

	var ast = acorn.parse(content, {
		plugins: { jsx: true },
		//locations: true
	});

	console.log(ast);

	var output = {
		'interfaces': [{
			'name': 'IFooProps',
			'componentClassName': 'Foo',
			'members': [
				{'name': 'bar', 'type': 'boolean'},
				{'name': 'baz', 'type': 'number'}
			]
		}],
		'classes': [{
			'name': 'Foo',
			'propsInterface': 'IFooProps'
		}]
	};

	return output;
}

function processFiles(config, fileNames) {
	var processedFiles = _.map(fileNames, function(value) {
		return processFile(value);
	});

	var interfaces = _.map(processedFiles, (value) => { return value.interfaces; });
	var classes = _.map(processedFiles, function(value) { return value.classes; });

	var output = {
		'moduleName': config.moduleName,
		'interfaces': _.flatten(interfaces),
		'classes': _.flatten(classes)
	};

	generateFileText(output);
	fs.writeFileSync(config.moduleName + ".d.ts", output.text);
}

module.exports = {
	'processFiles' : processFiles
}