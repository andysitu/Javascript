var express = require('express');

const router = express.Router();

var load_model = require('../model/load');

var jwt_helper = require('./jwt_helper');

function check_values(req, all_required) {
  var weight = req.body.weight,
      content = req.body.content;

  if (all_required) {
    if (content === undefined || weight === undefined){
      return false;
    }

    if (typeof(content) != "string" || content.length <= 0 || 
        typeof(weight) != "number" || weight <= 0 ) {
          return false;
        }
  } else {
    if (content === undefined && weight === undefined){
      return false;
    }

    if (content !== undefined)
      if (typeof(content) != "string" || content.length <= 0)
        return false;
    if (weight !== undefined)
      if (typeof(weight) != "number" || weight <= 0)
        return false;
  }

  return true;
}

// POST /loads - Create a load
router.post('/', jwt_helper.checkJWT, function(req, res){
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
    
    if ( !check_values(req, true) ) {
      res.status(400).json({
        "Error": "The request object is missing at least one of the required attributes"
      });
    } else {
      load_model.post_load(req, owner)
      .then( (new_load) => {
        res.status(201).json(new_load);
      });
    }
  }
});

// GET /boats/ - Get a boat by the boatid
router.get('/:load_id', jwt_helper.checkJWT, function(req, res){
  var load_id = req.params.load_id;
  var owner = req.user.sub;
  
  const accepts = req.accepts(['application/json']);

  if (!accepts) { // Only accept-JSON & HTML
    res.status(406).json({
      "Error": 'Not Acceptable',
    });
  } else { // Return the boat as a JSON/HTML
    load_model.get_load(load_id, req).then( (load) => {
      if (load === undefined) {
        res.status(404).json({
          "Error": "No load with this load_id exists" 
        });
      } else if (load.owner != owner) {
        res.status(403).json({
          "Error": "Boat/Load owned by someone else"
        });
      } else {
        res.status(200).json(load);
      }
    });    
  }
});

// GET /loads - List all loads
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
    load_model.get_loads_by_ownerId(req, cursor).then( (boats) => {
      // if (accepts == "application/json") { // Save boat to datastore & return back object as JSON
        res.status(200).json(boats);
      // }
    });    
  }
});


// DELETE /loads/:load_id Delete load
router.delete('/:load_id', jwt_helper.checkJWT, async function(req, res) {
  var owner = req.user.sub;
  
  var load_id = req.params.load_id;
  // If load id contains non-numeric char
  if(!(load_id.match("^[0-9]*$"))) {
    res.status(404).json({
      "Error": "No load with this load_id exists"
    });
  } else {
    var result = await load_model.delete_load(load_id, owner);
    
    if (result === undefined) {
      res.status(404).json({
        "Error": "No load with this load_id exists"
      });
    } else if (result["Error"] == "Unauthorized") {
      res.status(403).json( {"Error": "Load owned by someone else"} );
    } else {
      res.status(204).end();
      }
  }
});

// PATCH /loads/:load_id - Edits a load - Partial Modifications
router.patch('/:load_id', jwt_helper.checkJWT, async function(req, res) {
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
      weight: req.body.weight,
      content: req.body.content,
    };
    var loadId = req.params.load_id;
    if ( !check_values(req, false) ){
      res.status(400).json({
        "Error": "The request object is missing at least one of the required attributes"
      });
    }
    // 404 status if loadId can't be parsed to int
    else if (loadId == undefined || !(loadId.match("^[0-9]*$"))) {
      res.status(404).json({
        "Error": "No load with this load_id exists" 
      });
    }
    else {
      var load =await load_model.update_load(loadId, data, req, owner);
      if (load === undefined) {
        res.status(404).json({
          "Error": "No load with this load_id exists"
        });
      } else if (load["Error"]) {
        res.status(403).json({
          "Error": "load owned by someone else"
        })
      } else {
        res.status(200).json(load);
      }
    }
  }
});

// PUT /loads/:load_id - Edits a load
router.put('/:load_id', jwt_helper.checkJWT, async function(req, res) {
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
      weight: req.body.weight,
      content: req.body.content,
    };

    var loadId = req.params.load_id;
    if ( !check_values(req, true) ){
      res.status(400).json({
        "Error": "The request object is missing at least one of the required attributes"
      });
    }
    // 404 status if loadId can't be parsed to int
    else if (loadId == undefined || !(loadId.match("^[0-9]*$"))) {
      res.status(404).json({
        "Error": "No load with this load_id exists" 
      });
    }
    else {
      var load =await load_model.update_load(loadId, data, req, owner);
      if (load === undefined) {
        res.status(404).json({
          "Error": "No load with this load_id exists"
        });
      } else if (load["Error"]) {
        res.status(403).json({
          "Error": "load owned by someone else"
        })
      } else {
        res.status(200).json(load);
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