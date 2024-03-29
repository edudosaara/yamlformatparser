import { createWriteStream } from "fs";
import path from "path";

export const firstToUpper = (text: string) : string => text[0].toUpperCase() + text.substring(1);

const removeSpecialCharacters = (text: string) : string => text.split(/[\.\/\-_,\\]+/).map(element => firstToUpper(element)).join("")

const formatType = (typeName: string) : string => {
    switch (typeName) {
        case "integer":
            return "Int";
        case "integer[]":
            return "Int[]";
        case "float":
            return "Double";
        case "float[]":
            return "Double[]";
        case "boolean":
            return "bool";
        case "boolean[]":
            return "bool[]";
        case "any":
            return "Object";
        case "any[]":
            return "Object[]";
        default:
            return typeName;
    }
}

export const generateCSharpInterface = (data: {[key: string]: IMetaTypeDataObject}) : string => {
    const interfaceName = `I${removeSpecialCharacters(path.basename(process.cwd()))}`
    const fileName = `${interfaceName}.cs`
    const stream = createWriteStream(fileName);
    stream.once('open', (fd: any) => {
        Object.keys(data).forEach((interf: string) => {
            stream.write(`public interface ${interf === "files" ? interfaceName : interf}\n`);
            stream.write("{\n");
            Object.keys(data[interf]).forEach((key: string) => {
                stream.write(`    ${formatType(data[interf][key].type)}${data[interf][key].required ? "" : "?"} ${removeSpecialCharacters(key)}`+" { get; set; }\n");
            })
            stream.write("}\n");
        })
        stream.end();
    });
    return fileName;
}
