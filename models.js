const validations = require('./validations');

const models = {};

function addModel(newModel) {
    if (!models[newModel.path])
        models[newModel.path] = {};

    models[newModel.path][newModel.method] = validations.createValidations(newModel);
}

function getModel(path, method) {
    return models[path][method] ? models[path][method] : null;
}

module.exports = {
    addModel,
    getModel
}
