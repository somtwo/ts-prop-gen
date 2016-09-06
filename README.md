TS Prop Gen
===========

TS Prop Gen can be used to generate typescript typing (.d.ts) files from the prop type information in jsx files. This tool can be used to process multiple files at a time and generate a single .d.ts with the typing information found.

### Example
In windows run:
	tspropgen --files example.jsx --module my-module

This generates a file called my-module.d.ts, and all type info will be in the MyModule namespace inside the file.
