const _ = require('lodash');
const fileProcessor = require('./fileProcessor.js');

function printUsage() {
	console.log("tsPropGen can be used to generate TypeScript type definition files from ReactJS");
	console.log("components written in Javascript. This tool looks in the propTypes member of");
	console.log("the object passed to React.creatClass and will map those props to typescript");
	console.log("types. The output includes both proptype interfaces and component class decls.\n");
	console.log("Usage:	tspropgen --module <name-of-module> --files <files-to-process>\n");
	console.log("	<name-of-module>	name of module the components belong to");
	console.log("	<files-to-process>	space-delimited list of filenames to process");
}

function findNextSwitch(args, start) {
	var i;

	for(i = start; i < args.length; ++i) {
		if(args[i].indexOf('--') == 0)
			return i;
	}

	return i;
}

function getArgumentsForSwitch(args, switchName) {
	var switchIndex = _.indexOf(args, switchName);
	if(switchIndex == -1)
		return undefined;

	var nextSwitch = findNextSwitch(args, switchIndex + 1);
	var numberOfArguments = nextSwitch - switchIndex - 1;

	if(numberOfArguments < 1)
		return undefined;

	return args.slice(switchIndex + 1, nextSwitch);
}

function validateCmdArgs(args) {
	var filesToProcess = getArgumentsForSwitch(args, '--files');

	if(filesToProcess == undefined)
		return false;

	var moduleName = getArgumentsForSwitch(args, '--module')[0];

	if(module == undefined)
		return false;

	return {
		'filesToProcess': filesToProcess,
		'moduleName': moduleName
	}
}

// Main program body
var args = validateCmdArgs(process.argv);

if(args === false) {
	printUsage();
	process.abort();
}

console.log(`Processing ${args.filesToProcess.length} file(s)...`);

fileProcessor.processFiles({moduleName: args.moduleName}, args.filesToProcess);
