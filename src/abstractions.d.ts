type keyValueObject = {
    [index: string]: any
}

type keyValueOfArrays = {
    [index: string]: any[]
}

type IMetaTypeDataObject = {
    [index: string]: IMetaTypeData
}

interface IMetaTypeData {
    type: string;
    required: boolean;
}