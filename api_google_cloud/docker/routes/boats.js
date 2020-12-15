var express = require('express');

const router = express.Router();

const {Datastore} = require('@google-cloud/datastore');

function fromDatastore(item) {
  item.id = item[Datastore.KEY].id;
  return item;
}

var boat_model = require('../model/boat.js');

// Get URL, eg https://localhost:8080
function getUrl(req) {
  return req.protocol + '://' + req.get('host');
}

function checkId(id_string) {
  if (id_string == undefined || !(id_string.match("^[0-9]*$")))
    return false;
  return true;
}

function convJSONtoHTML(boat) {
  var html_str = '<html>\n<body><ul>\n';

  for (var key in boat) {
    if (key != Datastore.KEY) { // Skip the Key property
      html_str += '<li>' + key + " - " + boat[key] + '</li>\n';
    }
  }

  html_str += '\n</ul></body></html>';
  return html_str;
}


// Post /boats - Create a boat provided by body
router.post('/', async function(req, res){
  const accepts = req.accepts(['application/json',]);

  if (!accepts) { // Only accept JSON
    res.status(406).json({
      "Error": 'Not Acceptable',
    });
  }
  // Only accept JSON for content-type
  else if (req.get('content-type') !== 'application/json') {
    res.status(415).json({
      "Error": 'Only Accept application/json',
    });
  } else {
    var name = req.body.name,
      type = req.body.type,
      length = req.body.length;
    // If any parameters are missing or wrong type
    if (typeof(name) != "string" || typeof(type) != "string" || 
        typeof(length) != "number" || length <= 0 || length > 1000000 ||
          name.length > 50 || type.length > 50 ||
          name.length <= 0 || type.length <= 0) {
      res.status(400).send({
        "Error": "The request object is missing at least one of the required attributes or has a bad attribute"
      });
    } else { // Save boat to datastore & return back object as JSON
      var name_taken = await boat_model.name_taken(name);

      if (name_taken)
        res.status(403).send({
          "Error": "name already taken"
        });
      else 
        boat_model.post_boat(req, req.body.name, req.body.type, req.body.length)
          .then( new_boat => {
            res.status(201).json(new_boat)}
        );
    }
  }
});

// GET /boats/:boatid - Get a boat by the boatid
router.get('/:boatId', function(req, res){
  const accepts = req.accepts(['application/json', 'text/html']);
  var boatId = req.params.boatId;

  if (!accepts) { // Only accept-JSON & HTML
    res.status(406).json({
      "Error": 'Not Acceptable',
    });
  }
  // 404 status if boatId is undefined or not num
  else if (!checkId(boatId)) {
    res.status(404).send({
      "Error": "No boat with this boat_id exists" 
      });
  } else { // Return the boat as a JSON/HTML
    boat_model.get_boat(boatId, req).then( (new_boat) => {
      if (new_boat === undefined) {
        res.status(404).send({
          "Error": "No boat with this boat_id exists" 
        });
      } else if (accepts == "application/json") { // Save boat to datastore & return back object as JSON
        res.status(200).json(new_boat);
      } else {
        var html_string = convJSONtoHTML(new_boat);
        res.status(200).send(html_string);
      }
    });    
  }
});

// DELETE /boats/:boat_id - Delete a boat
router.delete('/:boat_id', function(req, res) {
  var boat_id = req.params.boat_id;
  if (boat_id == undefined || !(boat_id.match("^[0-9]*$"))) {
    res.status(404).send({
      "Error": "No boat with this boat_id exists" 
    });
  }
  boat_model.get_boat(boat_id, req).then( (new_boat) => {
      if (new_boat === undefined) {
        res.status(404).send({
          "Error": "No boat with this boat_id exists" 
        });
      } else {
        // Then deletes the boat
        boat_model.delete_boat(boat_id)
          .then(result => {
              res.status(204).end();
          });
      }
    });    
});

// PATCH /boats/:boat_id - Edits a boat
router.patch('/:boat_id', async function(req, res) {
  var name = req.body.name,
      type = req.body.type,
      length = req.body.length;
  var boatId = req.params.boat_id;

  const accepts = req.accepts(['application/json',]);

  if (!accepts) { // Only accept JSON
    res.status(406).json({
      "Error": 'Not Acceptable',
    });
  }
  // Only accept JSON for content-type
  else if (req.get('content-type') !== 'application/json') {
    res.status(415).json({
      "Error": 'Only Accept application/json',
    });
  }
  else if (name === undefined && type === undefined && length === undefined){
    res.status(400).send({
      "Error": "The request object is missing attributes or has a bad attribute"
    });
  }
  // Make sure that length is type number if defined
  else if ( length !== undefined && (typeof(length) != "number" || length <= 0 || length > 1000000))
    res.status(400).send({
      "Error": "The request object is missing attributes or has a bad attribute"
    });
  else if (name !== undefined && (typeof(name) != "string" || name.length <= 0 || name.length > 50))
    res.status(400).send({
      "Error": "The request object is missing attributes or has a bad attribute"
    });
  else if (type !== undefined && (typeof(type) != "string" || type.length <= 0 || type.length > 50))
    res.status(400).send({
      "Error": "The request object is missing attributes or has a bad attribute"
    });
  // 404 status if boatId can't be parsed to int
  else if (boatId == undefined || !(boatId.match("^[0-9]*$"))) {
    res.status(404).send({
      "Error": "No boat with this boat_id exists" 
    });
  }
  else {
    var name_taken = false;
    if (name !== undefined) {
      var name_taken = await boat_model.name_taken(name);
    }

    if (name_taken)
      res.status(403).send({
        "Error": "name already taken"
      });
    else {
      var data = {name: name, type: type, length: length}
      boat_model.update_boat(boatId, data, req)
      .then( (boat_obj) => {
        if (boat_obj === undefined) {
          res.status(404).send({
            "Error": "No boat with this boat_id exists"
          });
        }
        else {
          res.status(200).json(boat_obj);
        }
      });
    }
  }
});


// PUT /boats/:boat_id - Edits a boat. Requires all parameters
router.put('/:boat_id', async function(req, res) {
  var name = req.body.name,
      type = req.body.type,
      length = req.body.length;
  var boatId = req.params.boat_id;

  const accepts = req.accepts(['application/json',]);

  if (!accepts) { // Only accept JSON
    res.status(406).json({
      "Error": 'Not Acceptable',
    });
  }
  // Only accept JSON for content-type
  else if (req.get('content-type') !== 'application/json') {
    res.status(415).json({
      "Error": 'Only Accept application/json',
    });
  } 
  else if (typeof(name) != "string" || typeof(type) != "string" || 
    typeof(length) != "number" || length <= 0 || length > 1000000 ||
      name.length <= 0 || type.length <= 0 ||
        name.length > 50 || type.length > 50) {
    res.status(400).send({
      "Error": "The request object is missing at least one of the required attributes or has a bad attribute"
    });
  }
  // Make sure that length is type number
  else if ( typeof(length) != "number")
    res.status(400).send({
      "Error": "The request object is missing at least one of the required attributes or has a bad attribute"
    });
  // 404 status if boatId can't be parsed to int
  else if (boatId == undefined || !(boatId.match("^[0-9]*$"))) {
    res.status(404).send({
      "Error": "No boat with this boat_id exists" 
    });
  }
  else {
    var name_taken = await boat_model.name_taken(name);

    if (name_taken)
      res.status(403).send({
        "Error": "name already taken"
      });
    else {
      var data = {name: name, type: type, length: length}
      boat_model.update_boat(boatId, data, req)
      .then( (boat_obj) => {
        if (boat_obj === undefined) {
          res.status(404).send({
            "Error": "No boat with this boat_id exists"
          });
        }
        else {
          res.setHeader('Location', boat_obj.self);
          res.status(303).send();
        }
      });
    }
  }
});

router.delete('/', function(req, res) {
  res.set('Accept', 'GET, POST');
  res.status(405).end();
});

router.put('/', function(req, res) {
  res.set('Accept', 'GET, POST');
  res.status(405).end();
});

module.exports = router;