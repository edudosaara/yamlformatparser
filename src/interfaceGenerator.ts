import { createWriteStream } from "fs";
import path from "path";

export const firstToUpper = (text: string) : string => text[0].toUpperCase() + text.substring(1)

export const generateCSharpInterface = (data: {[key: string]: IMetaTypeDataObject}) : string => {
    const interfaceName = `I${firstToUpper(path.basename(process.cwd()))}`
    const fileName = `${interfaceName}.cs`
    const stream = createWriteStream(fileName);
    stream.once('open', (fd: any) => {
        Object.keys(data).forEach((interf: string) => {
            stream.write(`public interface ${interf === "files" ? interfaceName : interf}\n`);
            stream.write("{\n");
            Object.keys(data[interf]).forEach((key: string) => {
                stream.write(`\t${data[interf][key].type}${data[interf][key].required ? "" : "?"} ${firstToUpper(key)}`+" { get; set; }\n");
            })
            stream.write("}\n\n");
        })
        stream.end();
    });
    return fileName;
}