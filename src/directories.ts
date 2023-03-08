import { accessSync } from "fs";
import { globSync } from "glob";

export const checkExistingDirectory = (directory: string) : string => {
    if (directory === "\r\n"){
        console.log("Current Directory:", process.cwd())
        return process.cwd();
    }
    accessSync(directory)
    return directory;
}

export const getYamlFiles = (directory: string) : string[] => (
    globSync(`${directory}/**/*.{yml,yaml}`)
)