import { load } from "js-yaml";
import { readFileSync } from "fs";
import { firstToUpper } from "./interfaceGenerator";

let typeData : keyValueOfArrays = {files: []}

const getObjectFormat = (newObj: keyValueObject) : keyValueObject => {
    if ([null, undefined].includes(newObj)) return null;
    let refinedObj: keyValueObject = {};
    Object.keys(newObj).forEach((key: string) => {
        refinedObj[key] = refinedType(newObj[key], key);
    })
    return refinedObj;
}

const refinedType = (element: any, key: string) : string => {
    switch (typeof element) {
        case "object":
            if (Array.isArray(element)) {
                const firstElementType = refinedType(element[0], key);
                if (!element.every(el => refinedType(el, key) === firstElementType)) {
                    console.warn("Arrays with content of different types are not supported. Using first element.")
                }
                return `${firstElementType}[]`;
            }
            const formattedElement = getObjectFormat(element);
            if (formattedElement === null) return "any";
            const interfaceName = `I${firstToUpper(key)}`
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
}

const getIntersection = (data: string[][]) : string[] => {
    let result: string[] = [...new Set(data.flat())];

    for (let i=0; i < data.length; i++) {
        for (let j=0; j < data.length; j++) {
            if (i === j) continue;
            data[i].forEach(key => {
                if (!data[j].includes(key)) {
                    result = result.filter(item => item !== key)
                }
            })
        }
    }

    return result;
}

const fullMerge = (arrayOfObjs: keyValueObject[]) : any => {
    let intersectKeys = getIntersection(arrayOfObjs.map((element: keyValueObject) => Object.keys(element)));
    return arrayOfObjs.reduce((accumulator: keyValueObject, element: keyValueObject) => {
        const acumKeys = Object.keys(accumulator);
        const elemKeys = Object.keys(element);
        let newElement: IMetaTypeDataObject = {}
        Object.keys(element).forEach((key: string) => {
            newElement[key] = {type: element[key], required: false}
        })
        if (Object.keys(accumulator).length === 0) {
            return newElement;
        }
        let joint = {...accumulator, ...newElement};
        intersectKeys.forEach(key => {
            joint[key].required = true;
        })

        let equalKeys = acumKeys.filter(item => elemKeys.includes(item))
        equalKeys.forEach(key => {
            if (accumulator[key].type !== newElement[key].type) {
                if ([accumulator[key].type, newElement[key].type].includes("float")) {
                    joint[key].type = "float";
                }
                if ([accumulator[key].type, newElement[key].type].includes("string")) {
                    joint[key].type = "string";
                }
                if (accumulator[key].type.match(/^I[A-Z].*$/) || newElement[key].type.match(/^I[A-Z].*$/)) {
                    joint[key].type = [...new Set([...accumulator[key].type.split("|"), newElement[key].type])].join("|");
                }
            }
        })

        return joint;
    }, {})
}

export const readYamlContent = (files: string[]) => {
    typeData.files = files.map(filePath => {
        let fileContent = load(readFileSync(filePath, 'utf8')) as keyValueObject;
        return getObjectFormat(fileContent);
    });
    return Object.keys(typeData).reduce((accumulator: keyValueObject, key: string) => {
        accumulator[key] = fullMerge(typeData[key])
        return accumulator;
    }, {})
}
