const assert = require('assert');
const _ = require('lodash');

function printUsage() {
	console.log("Usage:\n");
}

function validateCmdArgs() {
	var fileArg = _.indexOf(process.argv, '--files');
	if(fileArg == -1)
		return false;

	var numberOfFiles = process.argv.length - fileArg - 1;

	if(numberOfFiles < 1)
		return false;

	return process.argv.slice(fileArg + 1);
}

function processFile(fileName) {
	console.log(`Processing ${fileName}...`);
}

// Main program body
var filesToProcess = validateCmdArgs();
if(filesToProcess === false) {
	printUsage();
	process.abort();
}

console.log(`Processing ${filesToProcess.length} file(s)...`);

_.each(filesToProcess, function(value, key) {
	processFile(value);
});