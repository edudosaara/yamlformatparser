#!/usr/bin/node
import { checkExistingDirectory, getYamlFiles } from "./directories";
import { generateCSharpInterface } from "./interfaceGenerator";
import { readYamlContent } from "./yamlProcessing";
const run = () => {
    process.stdout.write("\n");
    process.stdout.write("------------------------------ YAML Format Parser ---------------------------\n");
    process.stdout.write("Searching current directory...\n");
    try {
        const directory = checkExistingDirectory("\r\n");
        process.stdout.write("Getting YAML files...\n");
        const files = getYamlFiles(directory);
        process.stdout.write("Obtaining data from files and merging them...\n");
        const generalModel = readYamlContent(files);
        process.stdout.write("Generating C# interface...\n");
        const fileName = generateCSharpInterface(generalModel);
        process.stdout.write(`Created interface ${fileName}.\n`);
        process.stdout.write("-----------------------------------------------------------------------------\n");
    }
    catch (e) {
        console.error(e);
    }
};
run();
