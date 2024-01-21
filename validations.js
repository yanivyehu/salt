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
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);
}

function validateaAuthToken(value) {
    return /^Bearer [a-zA-Z0-9-]+$/.test(value);
}

function validateEmail(value) {
   return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
}

function validateDate(value) {
    return /^\d{2}-\d{2}-\d{4}$/.test(value);
}

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

function getValidatorByType(type) {
    return validationByType[type];
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
            result.push({section: sectionName, name: field.name, error: 'unexpected parameter'});
        }
    });

    const requiredFieldsNotFound = learnedModel.requiredFields.filter(item => !foundFields.includes(item));
    requiredFieldsNotFound.forEach(fieldName => {
        result.push({section: sectionName, name: fieldName, error: 'missing required field'});
    });

    return result;
}


module.exports = {
    getValidatorByType,
    validateRequest
}
