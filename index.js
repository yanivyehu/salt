const express = require('express');
const models = require('./models');
const validations = require('./validations');

const app = express();
const port = 3000;

app.use(express.json());

app.post('/newModels', (req, res) => {
    try {
        const newModels = req.body;
        newModels.forEach(newModel => {
            try {
                models.addModel(newModel);
            } catch (err) {
                console.error(`failed to add model ${JSON.stringify(newModel)}`);
            }
        });
        return res.sendStatus(200);
    } catch (err) {
        console.error(`failed to add model: ${JSON.stringify(err)}`);
        return res.sendStatus(500);
    }
})

app.post('/isValid', (req, res) => {
    try { 
        const request = req.body;
        const learnedModel = models.getModel(request.path, request.method);
        const result = validations.validateRequest(request, learnedModel);
        return res.json(result);  
    } catch (err) {
        console.error(`failed to validate request: ${JSON.stringify(err)}`);
        return res.sendStatus(500);
    }
});


app.listen(port, () => console.log(`server is started on port ${port}`));

