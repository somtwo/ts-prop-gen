const assert = require('assert');
const _ = require('lodash');
const fs = require('fs');

const generateFileText = require('./codeGen.js').generateFileText;

// TODO: roll output file name if output file already exists
function writeTypeFile(fileName, outputText) {
	fs.writeFileSync(fileName, outputText);
}

// TODO: Reference the base react.d.ts file
function processFile(fileName) {
	// TODO: Somethign valid
	var output = {
		'interfaces': [
			{
				'name': 'IFooProps',
				'componentClassName': 'Foo',
				'members': [{'name': 'foo', 'type': 'string'}],
			}
		],
		'classes': [
			{
				'name': 'Foo',
				'propsInterface': 'IFooProps'
			}
		]
	};

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