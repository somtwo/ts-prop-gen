const assert = require('assert');
const _ = require('lodash');
const fs = require('fs');

function _writeIndentation() {
	for(var i = 0; i < this.indentation; ++i)
		this.text += "\t";
}

function _outdent() {
	assert(this.indentation > 0, "outdent called on a file output that was already at 0 indentation level");

	this.indentation--;
	this.writeIndentation();
	this.text += "}"
}

function generateFileText(output) {
	return "declare namespace Foo {\n"
		+ "	export interface IFooProps extends React.Props<Foo> {\n"
		+ "		foo: boolean;\n"
		+ "	}\n"
		+ "	export class Foo extends React.Component<IFooProps, {}> {}\n"
		+ "}\n"
		+ 'declare module "foo" {\n'
		+ "	export = Foo;\n"
		+ "}\n"
}

// TODO: roll output file name if output file already exists
function writeTypeFile(fileName, outputText) {
	fs.writeFileSync(fileName, outputText);
}

// TODO: Reference the base react.d.ts file
function processFile(fileName) {
	var output = [
		{
			'name': 'IFooProps',
			'members': [{'name': 'foo', 'type': 'string'}],
		}
	];

	return output;
}

function processFiles(fileNames) {
	var interfaces = _.map(fileNames, function(key, value) {
		return processFile(value);
	});

	// TODO: Determine what the namespace should be
	var output = {
		'moduleName': 'foo-module',
		'interfaces': _.flatten(interfaces)
	};

	var outputText = generateFileText(output);
	writeTypeFile("output.d.ts", outputText);
}

module.exports = {
	'processFiles' : processFiles
}