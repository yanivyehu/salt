const validationByType = {
    "Int": validateInteger,
    "Boolean": validateBoolean,
    "String": validateString,
    "List": validateList,
    "UUID": validateUUID,
    "Auth-Token": validateaAuthToken,
    "Email": validateEmail,
    "Date": validateDate,
}

const regexs = {
    "UUID": /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    "Auth-Token": /^Bearer [a-zA-Z0-9-]+$/,
    "Email": /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "Date": /^\d{2}-\d{2}-\d{4}$/
}

const sections = ['query_params', 'headers', 'body']; 

function validateInteger(value) {
    return Number.isInteger(value);
}

function validateBoolean(value) {
    return typeof(value) === 'boolean';
}

function validateString(value) {
    return typeof(value) === 'string';
}

function validateList(value) {
    return Array.isArray(value);
}

function validateUUID(value) {
    return regexs["UUID"].test(value);
}

function validateaAuthToken(value) {
    return regexs["Auth-Token"].test(value);
}

function validateEmail(value) {
   return regexs["Email"].test(value);
}

function validateDate(value) {
    return regexs["Date"].test(value);
}

/**
 * create validations for each section (query params, headers and body)
 * @param {*} model 
 * @returns validation object that contains all the required data for validate a request
 */
 function createValidations(model) {
    const validations = {};
    sections.forEach(section => {
        validations[section] = createValidationsForSection(model[section]); 
    });
    return validations;
}

function validateRequest(request, learnedModel) {
    const response = {
        valid: true,
    };

    let abnormalFields = [];

    Object.keys(learnedModel).forEach(section => {
        abnormalFields = abnormalFields.concat(validateSection(section, request[section], learnedModel[section]));
    });

    if (abnormalFields.length > 0) {
        response.valid = false;
        response.abnormalFields = abnormalFields;
    }

    return response;
}

function createValidationsForSection(section) {
    const validation = {
        requiredFields: [],
        fields: {}
    };
    section.forEach(field => {
        if (field.required)
            validation.requiredFields.push(field.name);
        validation.fields[field.name] = getValidationsFunctionsForField(field);
    });

    return validation;
}

function getValidationsFunctionsForField(field) {
    const validationFunctions = [];
    field.types.forEach(type => validationFunctions.push(validationByType[type]));

    return validationFunctions;
}

function validateSection(sectionName, sectionData, learnedModel) {
    const result = [];
    const foundFields = [];
    sectionData.forEach(field => {
        foundFields.push(field.name);
        const validateFunctions = learnedModel.fields[field.name];

        if (validateFunctions) {
            if (!(validateFunctions.some(f => f(field.value)))) {
                result.push({section: sectionName, name: field.name, value: field.value, error: 'type mismatch'});
            }
        } else {
            // unexpected parameter
            result.push({section: sectionName, name: field.name, error: 'unexpected field'});
        }
    });

    const requiredFieldsNotFound = learnedModel.requiredFields.filter(item => !foundFields.includes(item));
    requiredFieldsNotFound.forEach(fieldName => {
        result.push({section: sectionName, name: fieldName, error: 'missing required field'});
    });

    return result;
}


module.exports = {
    createValidations,
    validateRequest
}
