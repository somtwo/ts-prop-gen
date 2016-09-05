const assert = require('assert');
const _ = require('lodash');
const fs = require('fs');

function _writeIndentation(output) {
	for(var i = 0; i < output.indentation; ++i)
		output.text += "\t";
}

function _outdent(output) {
	assert(output.indentation > 0, "outdent called on a file output that was already at 0 indentation level");

	output.indentation--;
	_writeIndentation(output);
	output.text += "}\n"
}

function getNamespaceName(moduleName) {
	var camelCased = moduleName.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
	return camelCased.replace(/^[a-z]/g, function(g) { return g[0].toUpperCase(); });
}

function generateFileText(output) {
	var namespace = getNamespaceName(output.moduleName);

	output.indentation = 0;
	output.text = ``;
	output.text += `declare namespace ${namespace} {\n`;
	output.indentation++;

	_.each(output.interfaces, function(element, key) {
		_writeIndentation(output);
		output.text += `export interface ${element.name} extends React.Props<${element.componentClassName}> {\n`;
		output.indentation ++;

		_.each(element.members, function(member, key) {
			_writeIndentation(output);
			output.text += `${member.name}: ${member.type};\n`;
		});

		_outdent(output);
	});

	_.each(output.classes, function(element, key) {
		_writeIndentation(output);
		output.text += `export class ${element.name} extends React.Component<${element.propsInterface}, {}> {\n`;
		output.indentation++;

		// TODO: Do we ever need to put anything in this?

		_outdent(output);
	});

	_outdent(output);

	output.text += `declare module "${output.moduleName}" {\n`
	output.text += `	export = ${namespace};\n`;
	output.text += `}\n`;
}

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

function processFiles(fileNames) {
	var processedFiles = _.map(fileNames, function(value) {
		return processFile(value);
	});

	var interfaces = _.map(processedFiles, function(value) { return value.interfaces; });
	var classes = _.map(processedFiles, function(value) { return value.classes; });

	// TODO: Determine what the namespace should be
	var output = {
		'moduleName': 'foo-module',
		'interfaces': _.flatten(interfaces),
		'classes': _.flatten(classes)
	};

	generateFileText(output);
	writeTypeFile("output.d.ts", output.text);
}

module.exports = {
	'processFiles' : processFiles
}