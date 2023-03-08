import { createWriteStream } from "fs";
import path from "path";
export const firstToUpper = (text) => text[0].toUpperCase() + text.substring(1);
const formatType = (typeName) => {
    switch (typeName) {
        case "integer":
            return "int";
        case "integer[]":
            return "int[]";
        case "float":
            return "double";
        case "float[]":
            return "double[]";
        default:
            return typeName;
    }
};
export const generateCSharpInterface = (data) => {
    const interfaceName = `I${firstToUpper(path.basename(process.cwd()))}`;
    const fileName = `${interfaceName}.cs`;
    const stream = createWriteStream(fileName);
    stream.once('open', (fd) => {
        Object.keys(data).forEach((interf) => {
            stream.write(`public interface ${interf === "files" ? interfaceName : interf}\n`);
            stream.write("{\n");
            Object.keys(data[interf]).forEach((key) => {
                stream.write(`    ${formatType(data[interf][key].type)}${data[interf][key].required ? "" : "?"} ${firstToUpper(key)}` + " { get; set; }\n");
            });
            stream.write("}\n");
        });
        stream.end();
    });
    return fileName;
};
