const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const {Datastore} = require('@google-cloud/datastore');

app.enable('trust proxy');

// Instantiate a datastore client
const datastore = new Datastore();

const path = require('path');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function(error, req, res, next) {
  if (error instanceof SyntaxError) {
    res.status(415).json({
      "Error": 'Only Accept application/json',
    });
  }
})

app.use('/boats', require('./routes/boats'));

app.get('/', (req, res) => {
  res.send("Hello!");
});



app.use(function(req, res, next){
  res.status(404).send({"Error": "Not Found"});
})

app.use(function(req, res, next){
  res.status(500).send({"Error": "Server Error"});
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});