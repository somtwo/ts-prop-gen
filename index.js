const yargs = require('yargs');
const fileProcessor = require('./fileProcessor.js');

console.log("tsPropGen can be used to generate TypeScript type definition files from ReactJS");
console.log("components written in Javascript.");

const argv = yargs
	.usage("Usage: $0 <files-to-process...> [options]")
	.alias('m', 'module')
	.nargs('m', 1)
	.describe('m', "The name of the output module")
	.demand(1, ['m'])
	.help('h')
	.alias('h', 'help')
	.argv;


const filesToProcess = argv._;
const moduleName = argv.m;

console.log(`Processing ${filesToProcess.length} file(s):`);

fileProcessor.processFiles({moduleName: moduleName}, filesToProcess);

console.log('Done');