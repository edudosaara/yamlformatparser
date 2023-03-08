import { load } from "js-yaml";
import { readFileSync } from "fs";
import { firstToUpper } from "./interfaceGenerator";
let typeData = { files: [] };
const getObjectFormat = (newObj) => {
    let refinedObj = {};
    Object.keys(newObj).forEach((key) => {
        refinedObj[key] = refinedType(newObj[key], key);
    });
    return refinedObj;
};
const refinedType = (element, key) => {
    switch (typeof element) {
        case "object":
            if (Array.isArray(element)) {
                const firstElementType = refinedType(element[0], key);
                if (!element.every(el => refinedType(el, key) === firstElementType)) {
                    console.warn("Arrays with content of different types are not supported. Using first element.");
                }
                return `${firstElementType}[]`;
            }
            const formattedElement = getObjectFormat(element);
            const interfaceName = `I${firstToUpper(key)}`;
            typeData[interfaceName] = Object.keys(typeData).includes(interfaceName) ? [...typeData[interfaceName], formattedElement] : [formattedElement];
            return interfaceName;
        case "number":
        case "bigint":
            return (!Number.isInteger(element) || element.toString().includes(".")) ? "float" : "integer";
        case "string":
        case "boolean":
            return typeof element;
        default:
            return "any";
    }
};
const getIntersection = (data) => {
    let result = [...new Set(data.flat())];
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data.length; j++) {
            if (i === j)
                continue;
            data[i].forEach(key => {
                if (!data[j].includes(key)) {
                    result = result.filter(item => item !== key);
                }
            });
        }
    }
    return result;
};
const fullMerge = (arrayOfObjs) => {
    let intersectKeys = getIntersection(arrayOfObjs.map((element) => Object.keys(element)));
    return arrayOfObjs.reduce((accumulator, element) => {
        const acumKeys = Object.keys(accumulator);
        const elemKeys = Object.keys(element);
        let newElement = {};
        Object.keys(element).forEach((key) => {
            newElement[key] = { type: element[key], required: false };
        });
        if (Object.keys(accumulator).length === 0) {
            return newElement;
        }
        let joint = Object.assign(Object.assign({}, accumulator), newElement);
        intersectKeys.forEach(key => {
            joint[key].required = true;
        });
        let equalKeys = acumKeys.filter(item => elemKeys.includes(item));
        equalKeys.forEach(key => {
            if (accumulator[key].type !== newElement[key].type) {
                if ([accumulator[key].type, newElement[key].type].includes("float")) {
                    joint[key].type = "float";
                }
                if ([accumulator[key].type, newElement[key].type].includes("string")) {
                    joint[key].type = "string";
                }
                if (accumulator[key].type.match(/^I[A-Z].*$/) || newElement[key].type.match(/^I[A-Z].*$/)) {
                    joint[key].type = accumulator[key].type + "|" + newElement[key].type;
                }
            }
        });
        return joint;
    }, {});
};
export const readYamlContent = (files) => {
    typeData.files = files.map(filePath => {
        let fileContent = load(readFileSync(filePath, 'utf8'));
        return getObjectFormat(fileContent);
    });
    return Object.keys(typeData).reduce((accumulator, key) => {
        accumulator[key] = fullMerge(typeData[key]);
        return accumulator;
    }, {});
};
