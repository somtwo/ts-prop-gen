const _ = require('lodash');
const fileProcessor = require('./fileProcessor.js');

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

// Main program body
var filesToProcess = validateCmdArgs();
if(filesToProcess === false) {
	printUsage();
	process.abort();
}

console.log(`Processing ${filesToProcess.length} file(s)...`);

fileProcessor.processFiles(filesToProcess);
