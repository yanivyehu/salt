const regexs = {
    "UUID": /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    "Auth-Token": /^Bearer [a-zA-Z0-9-]+$/,
    "Email": /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "Date": /^\d{2}-\d{2}-\d{4}$/
}

const validationByType = {
    "Int": (value) => Number.isInteger(value),
    "Boolean": (value) => typeof(value) === 'boolean',
    "String": (value) => typeof(value) === 'string',
    "List": (value) => Array.isArray(value),
    "UUID": (value) => regexs["UUID"].test(value),
    "Auth-Token": (value) => regexs["Auth-Token"].test(value),
    "Email": (value) => regexs["Email"].test(value),
    "Date": (value) => regexs["Date"].test(value)
}

const sections = ['query_params', 'headers', 'body']; 

/**
 * create validations for each section.
 * @param {*} model 
 * @returns validation object that contains all the required data for validate a section in request: 
 * for each section (like query params, headers and body) will be an object containing:
 *  {
        requiredFields: [], // array of required fields
        fields: {
            field1: [f1,f2,f3,f4],
            field2: [f3,f4]
            ......
        } // for each field array of validation functions
    }
 */
 function createValidations(model) {
    const validations = {};

    for (const section of sections) {
        validations[section] = createValidationsForSection(model[section]); 
    }
    
    return validations;
}

function createValidationsForSection(section) {
    const validation = {
        requiredFields: [],
        fields: {}
    };

    for (field of section) {
        if (field.required)
        validation.requiredFields.push(field.name);
        validation.fields[field.name] = field.types.map(type => (validationByType[type]));
    }

    return validation;
}

function validateRequest(request, learnedModel) {
    const response = {
        valid: true,
    };

    const abnormalFields = Object.keys(learnedModel).map(
        sectionName => validateSection(sectionName, request[sectionName], learnedModel[sectionName])).flat();

    if (abnormalFields.length > 0) {
        response.valid = false;
        response.abnormalFields = abnormalFields;
    }

    return response;
}

function validateSection(sectionName, sectionData, learnedModel) {
    const result = [];
    const foundFields = [];
    for (const field of sectionData) {
        foundFields.push(field.name);
        const validateFunctions = learnedModel.fields[field.name];

        if (validateFunctions) {
            // array.some is good for our purpose since we want to stop the validation once one function returns true
            if (!(validateFunctions.some(f => f(field.value)))) {
                result.push(createErrorRecord(sectionName, field.name, 'type mismatch', field.value,));
            }
        } else {
            // unexpected parameter
            result.push(createErrorRecord(sectionName, field.name, 'unexpected field'));
        }
    };

    // find which required fields are not found in the request
    const requiredFieldsNotFound = learnedModel.requiredFields.filter(field => !foundFields.includes(field));
    for (const fieldName of requiredFieldsNotFound) {
        result.push(createErrorRecord(sectionName, fieldName, 'missing required field'));
    }

    return result;
}

function createErrorRecord(section, fieldName, msg, value) {
    const record = {
        section: section,
        name: fieldName,
        error: msg
    }

    if (value)
        record.value = value;

    return record;
}

module.exports = {
    createValidations,
    validateRequest
}
