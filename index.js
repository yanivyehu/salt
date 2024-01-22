const express = require('express');
const models = require('./models');
const validations = require('./validations');

const app = express();
const port = 3000;

app.use(express.json());

app.post('/newModels', (req, res) => {
    const newModels = req.body;
    newModels.forEach(newModel => {
        try {
            models.addModel(newModel);
        } catch (err) {
            console.error(`failed to add model ${JSON.stringify(newModel)}`);
        }
    });        
    
    return res.sendStatus(200);
})

app.get('/isValid', (req, res) => {
    const request = req.body;
    const learnedModel = models.getModel(request.path, request.method);
    const result = validations.validateRequest(request, learnedModel);
    return res.json(result);  
});


app.listen(port, () => console.log(`server is started on port ${port}`));
