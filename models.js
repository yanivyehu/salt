const validations = require('./validations');

const models = {};

const sections = ['query_params', 'headers', 'body']; 

function addModel(newModel) {
    if (!models[newModel.path])
        models[newModel.path] = {};

    models[newModel.path][newModel.method] = createValidations(newModel);
}

function getModel(path, method) {
    return models[path][method] ? models[path][method] : null;
}

function createValidations(model) {
    const validations = {};
    sections.forEach(section => {
        validations[section] = createValidationsForSection(model[section]); 
    });
    return validations;
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
    field.types.forEach(type => validationFunctions.push(validations.getValidatorByType(type)));

    return validationFunctions;
}


module.exports = {
    addModel,
    getModel,
}
