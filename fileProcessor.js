const assert = require('assert');
const _ = require('lodash');
const fs = require('fs');
const React = require('react');
const acorn = require('acorn-jsx');

const generateFileText = require('./codeGen.js').generateFileText;
const matchTree = require('./treeMatcher').matchTree;

function interfaceForClassName(className) {	return `I${className}Props`; }

const variableDeclarationTree = {
	'_matchMultiple': true,
	'_optional': true,
	'type': "VariableDeclarator",
	'init': {
		'type': "CallExpression",
		'callee': {
			'type': "MemberExpression",
			'object': { 'type': "Identifier", 'name': "React" },
			'property': { 'type': "Identifier", 'name': "createClass" }
		},
		'arguments': [{
			'_orderedMatch': true,
			'type': "ObjectExpression",
			'properties': [{
				'type': "Property",
				'key': { 'type': "Identifier", 'name': "propTypes" },
				'value': {
					'type': "ObjectExpression",
					'properties': [{
						'_matchMultiple': true,
						'type': "Property",
						'key': {
							'type': "Identifier",
							'_onMatch': (node, state) => { state.propName = node.name; }
						},
						'value': {
							'type': "MemberExpression",
							'object': {
								'type': "MemberExpression",
								'object': { 'type': "Identifier", 'name': "React" },
								'property': { 'type': 'Identifier', 'name': 'PropTypes' }
							},
							'property': {
								'type': 'Identifier',
								'_onMatch': (node, state) => { state.propType = node.name; }
							}
						},
						'_onMatch': (node, state) => { 
							state.props = state.props || [];
							state.props.push({name: state.propName, type: state.propType });
						}
					}]
				}
			}]
		}]
	},
	'_onMatch': (node, state) => {
		state.classes = state.classes || [];
		state.classes.push({
			name: node.id.name,
			props: state.props
		});

		state.props = [];
	}
}

var bodyTree = {
	'type': 'Program',
	'body': [{
		'_matchMultiple': true,
		'type': 'VariableDeclaration',
		'declarations': [variableDeclarationTree]
	}]
}

function buildInterfaceTypes(classes) {
	return _.map(classes, (c) => {
		return {
			name: interfaceForClassName(c.name),
			componentClassName: c.name,
			members: c.props
		};
	});
}

function buildClassTypes(classes) {
	return _.map(classes, (c) => {
		return {
			propsInterface: interfaceForClassName(c.name),
			name: c.name
		};
	});
}


// TODO: Reference the base react.d.ts file
function processFile(fileName) {
	var content = fs.readFileSync(fileName, {'encoding': 'utf8'});

	var ast = acorn.parse(content, {
		plugins: { jsx: true },
		//locations: true
	});

	var state = {};
	var match = matchTree(ast, bodyTree, state);

	if(!match) {
		console.log("Error: Failed to find class definitions in " + fileName);
		return { interfaces: [], classes: [] }
	}

	var output = {
		'interfaces': buildInterfaceTypes(state.classes),
		'classes': buildClassTypes(state.classes)
	};

	return output;
}

function processFiles(config, fileNames) {
	var processedFiles = _.map(fileNames, (value) => {
		return processFile(value);
	});

	var interfaces = _.map(processedFiles, (value) => { return value.interfaces; });
	var classes = _.map(processedFiles, (value) => { return value.classes; });

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