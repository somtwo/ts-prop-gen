const _ = require('lodash');

function processFile(fileName) {
	console.log(`Processing file ${fileName}...`);
}

module.exports = {
	'processFile' : processFile
}