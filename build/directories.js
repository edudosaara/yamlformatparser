import { accessSync } from "fs";
import { globSync } from "glob";
export const checkExistingDirectory = (directory) => {
    if (directory === "\r\n") {
        console.log("Current Directory:", process.cwd());
        return process.cwd();
    }
    accessSync(directory);
    return directory;
};
export const getYamlFiles = (directory) => (globSync(`${directory}/**/*.{yml,yaml}`));
