const assert = require('assert');
const _ = require('lodash');

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

module.exports = {
	'generateFileText': generateFileText
}