var express = require('express');

const router = express.Router();

const {Datastore} = require('@google-cloud/datastore');

var jwt_helper = require('./jwt_helper');

var boat_model = require('../model/boat.js');

// Checks if name, type, and length are valid
function check_values(req, all_required) {
  var name = req.body.name,
      type = req.body.type,
      length = req.body.length;

  if (all_required) {
    if (name === undefined || type === undefined || length === undefined){
      return false;
    }

    if (typeof(name) != "string" || typeof(type) != "string" ||
        name.length <= 0 || type.length <= 0 ||
        typeof(length) != "number" || length <= 0 ) {
      return false;
    }
  } else {
    if (name === undefined && type === undefined && length === undefined){
      return false;
    }

    if (name !== undefined)
      if (typeof(name) != "string" || name.length <= 0)
        return false;
    if (type !== undefined)
      if (typeof(type) != "string" || type.length <= 0)
        return false
    if (length !== undefined)
      if (typeof(length) != "number" || length <= 0)
        return false;
  }

  return true;
}

// Post /boats - Create a boat provided by body
router.post('/', jwt_helper.checkJWT, async function(req, res){
  var owner = req.user.sub;
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
    // If any parameters are missing or wrong type
    if (!check_values(req, true)) {
      res.status(400).json({
        "Error": "The request object is missing at least one of the required attributes or has a bad attribute"
      });
    } else { // Save boat to datastore & return back object as JSON
      boat_model.post_boat(req, owner)
        .then( new_boat => {
          res.status(201).json(new_boat);
        }
      );
    }
  }
});

// GET /boats/ - Get a boat by the boatid
router.get('/', jwt_helper.checkJWT, function(req, res){
  var cursor = undefined;
  if (req.query.cursor) {
    cursor = req.query.cursor;
  }
  
  const accepts = req.accepts(['application/json']);

  if (!accepts) { // Only accept-JSON & HTML
    res.status(406).json({
      "Error": 'Not Acceptable',
    });
  } else { // Return the boat as a JSON/HTML
    boat_model.get_boats_by_ownerId(req, cursor).then( (boats) => {
      // Save boat to datastore & return back object as JSON
      res.status(200).json(boats);
    });    
  }
});

// GET /boats/ - Get a boat by the boatid
router.get('/:boat_id', jwt_helper.checkJWT, function(req, res){
  var boatId = req.params.boat_id;
  var owner = req.user.sub;
  
  const accepts = req.accepts(['application/json']);

  if (!accepts) { // Only accept-JSON & HTML
    res.status(406).json({
      "Error": 'Not Acceptable',
    });
  } else { // Return the boat as a JSON/HTML
    boat_model.get_boat(boatId, req).then( (boat) => {
      if (boat === undefined) {
        res.status(404).json({
          "Error": "No boat with this boat_id exists" 
        });
      } else if (boat.owner != owner) {
        res.status(403).json({
          "Error": "Boat/Load owned by someone else"
        });
      } else {
        res.status(200).json(boat);
      }
    });    
  }
});

// Assign a load to the boat
router.put('/:boat_id/load/:load_id', jwt_helper.checkJWT, async function (req, res){
  var load_id = req.params.load_id,
      boat_id = req.params.boat_id;

  var owner = req.user.sub;

  if (load_id == undefined || boat_id === undefined) {
    res.status(404).json({
      "Error": "The specified boat and/or load don’t exist"
    });
  }

  var result = await boat_model.add_load(boat_id, load_id, owner);
  
  if (result === undefined) {
    res.status(404).json({
      "Error": "The specified boat and/or load don’t exist" 
    });
  } else if (result["Error"] == "Unauthorized") {
    res.status(403).json({
      "Error": "Boat/Load owned by someone else"
    });
  } else if (result["Error"]) {
    res.status(409).json(result);
  } else {
    res.status(204).end();
  }
});

// Delete a load to the boat
router.delete('/:boat_id/load/:load_id', jwt_helper.checkJWT, async function (req, res){
  var load_id = req.params.load_id,
      boat_id = req.params.boat_id;

  var owner = req.user.sub;

  if (load_id == undefined || boat_id === undefined) {
    res.status(404).json({
      "Error": "The specified boat and/or load don’t exist"
    });
  }

  var result = await boat_model.remove_load(boat_id, load_id, owner);
  
  if (result === undefined) {
    res.status(404).json({
      "Error": "The specified boat and/or load don’t exist" 
    });
  } else if (result["Error"] == "Unauthorized") {
    res.status(403).json({
      "Error": "Boat/Load owned by someone else"
    });
  } else if (result["Error"]) {
    res.status(409).json(result);
  } else {
    res.status(204).end();
  }
});

// DELETE /boats/:boat_id - Delete a boat
router.delete('/:boat_id', jwt_helper.checkJWT, async function(req, res) {
  var owner = req.user.sub;

  var boat_id = req.params.boat_id;

  if (boat_id == undefined || !(boat_id.match("^[0-9]*$"))) {
    res.status(404).json({
      "Error": "No boat with this boat_id exists" 
    });
  }

  var result = await boat_model.delete_boat(boat_id, owner);
  if (result === undefined) {
    res.status(404).json({
      "Error": "No boat with this boat_id exists" 
    });
  } else if (result["Error"] == "Unauthorized") {
    res.status(403).json({
      "Error": "Boat owned by someone else"
    });
  } else {
    res.status(204).end();
  }
});

// PATCH /boats/:boat_id - Edits a boat - Partial Modifications
router.patch('/:boat_id', jwt_helper.checkJWT, async function(req, res) {
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
    var owner = req.user.sub;
    var data = {
      name: req.body.name,
      type: req.body.type,
      length: req.body.length
    };
    var boatId = req.params.boat_id;
    if ( !check_values(req, false) ) {
      res.status(400).json({
        "Error": "The request object is missing at least one of the required attributes"
      });
    }
    // 404 status if boatId can't be parsed to int
    else if (boatId == undefined || !(boatId.match("^[0-9]*$"))) {
      res.status(404).json({
        "Error": "No boat with this boat_id exists" 
      });
    }
    else {
      var boat =await boat_model.update_boat(boatId, data, req, owner);
      if (boat === undefined) {
        res.status(404).json({
          "Error": "No boat with this boat_id exists"
        });
      } else if (boat["Error"]) {
        res.status(403).json({
          "Error": "Boat owned by someone else"
        })
      } else {
        res.status(200).json(boat);
      }
    }
  }
});

// PUT /boats/:boat_id - Edits a boat - Requires all Values
router.put('/:boat_id', jwt_helper.checkJWT, async function(req, res) {
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
    var owner = req.user.sub;
    var data = {
      name: req.body.name,
      type: req.body.type,
      length: req.body.length
    };
    var boatId = req.params.boat_id;

    if (!check_values(req, true)) {
      res.status(400).json({
        "Error": "The request object is missing at least one of the required attributes"
      });
    }
    // 404 status if boatId can't be parsed to int
    else if (boatId == undefined || !(boatId.match("^[0-9]*$"))) {
      res.status(404).json({
        "Error": "No boat with this boat_id exists" 
      });
    }
    else {
      var boat =await boat_model.update_boat(boatId, data, req, owner);
      if (boat === undefined) {
        res.status(404).json({
          "Error": "No boat with this boat_id exists"
        });
      } else if (boat["Error"]) {
        res.status(403).json({
          "Error": "Boat owned by someone else"
        })
      } else {
        res.status(200).json(boat);
      }
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

router.patch('/', function(req, res) {
  res.set('Accept', 'GET, POST');
  res.status(405).end();
});


module.exports = router;