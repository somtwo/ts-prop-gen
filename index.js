const assert = require('assert');
const _ = require('lodash');

var filesToProcess = [];

function printUsage() {
	console.log("Usage:\n");
}

function validateCmdArgs() {
	var fileArg = _.indexOf(process.argv, '--files');
	if(fileArg == -1)
		return false;

	var numberOfFiles = process.argv.length - fileArg - 1;
	console.log(numberOfFiles);

	if(numberOfFiles < 1)
		return false;

	return true;
}

if(!validateCmdArgs()) {
	printUsage();
	process.abort();
}