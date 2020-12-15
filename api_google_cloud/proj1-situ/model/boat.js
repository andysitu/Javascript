const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

const BOAT = "Boat_finalproj";

var load_model = require('./load');

// Get URL, eg https://localhost:8080
function getUrl(req) {
  return req.protocol + '://' + req.get('host');
}

// Add IDs & Self links to boat & loads. Returns the entity
function convBoat(req, entity, boat_id) {
  var url = getUrl(req);
  if (boat_id)
    entity["id"] = boat_id.toString();
  else
    entity["id"] = entity[Datastore.KEY].id.toString();

  entity["self"] = url + "/boats/" + entity.id;

  return entity;
}

// Creates a boat & returns results as JSON
function post_boat (req, owner) {
  var key = datastore.key(BOAT);
  var new_boat = {
    "name": req.body.name, 
    "type": req.body.type, 
    "length": req.body.length,
    "owner": owner,
    "load": null,
  };
  var data = {"key": key, "data": new_boat};

  return datastore.save(data)
    .then(async (boat_entity) => {
      return convBoat(req, new_boat, key["id"]);
    });
}

// Gets specific boat & returns JSON. undefined if doesn't exist
function get_boat(boatId, req){
  var key = datastore.key([BOAT, parseInt(boatId)]);
  // const q = datastore.createQuery(BOAT).filter('__key__', '=', key);
  return datastore.get(key).then( (entity) => {
    if (entity[0] == undefined)
      return undefined;
    else {
      if (req) {
        return convBoat(req, entity[0]);
      } else {
        return entity[0];
      }
      
    }
  }, (reject_reason) => {
    return undefined;
  });
}

// Gets list of boats & returns as JSON
async function get_boats_by_ownerId(req, cursor){
  var owner = req.user.sub;

  var count_query = datastore.createQuery(BOAT).filter("owner", '=', owner);
  var allentities = await datastore.runQuery(count_query);
  var count = allentities[0].length;

  var q = datastore.createQuery(BOAT).filter("owner", '=', owner).limit(5);
  var result = {};

  if (cursor) {
    q = q.start(decodeURIComponent(cursor));
  }

  return datastore.runQuery(q).then( (entities) => {
    result.boats = entities[0].map(function(dataObj){
      return convBoat(req, dataObj);
    });
    // Pagination - next link added
    if (entities[1].moreResults != Datastore.NO_MORE_RESULTS) {
      result.next = getUrl(req) + "/boats?cursor=" + encodeURIComponent(entities[1].endCursor);
    }
    
    result.total = count;
    return result;
  });
}

async function delete_boat(boat_id, owner) {
  var boat = await get_boat(boat_id);
  if (boat == undefined) {
    return undefined;
  }
  else if (boat.owner != owner)
    return {
      "Error": "Unauthorized"
    }
  if (boat.load)
    await load_model.remove_boat(boat.load, boat_id, owner);
    
  var key = datastore.key([BOAT, parseInt(boat_id)]);
  await datastore.delete(key);
  return true; 
}

// Adds a boat to the load & returns JSON. 
// Returns undefined if doesn't exist, Error JSON if error
async function add_load(boat_id, load_id, owner) {
  var key = datastore.key([BOAT, parseInt(boat_id)]);

  var entity = await datastore.get(key);

  var boat_obj = entity[0];

  if (boat_obj === undefined)
    return undefined;
  if (boat_obj.load) 
    return {
      "Error": "The boat already has a load"
    };
  if (boat_obj.owner != owner) {
    return {
      "Error": "Unauthorized"
    };
  }
    
  // Add boat to the load.carrier
  var result = await load_model.add_boat(load_id, boat_id, owner);
  if (result == undefined)
    return undefined
  else if (result["Error"])
    return result;
  else {
    boat_obj.load = load_id;

    // Save the boat to datastore
    var updated_entity = {"key": key, "data": boat_obj};
    return datastore.update(updated_entity);
  }
}

// Removes a boat to the load & returns JSON. 
// Returns undefined if doesn't exist, Error JSON if error
async function remove_load(boat_id, load_id, owner, check_load_obj) {

  var key = datastore.key([BOAT, parseInt(boat_id)]);

  var entity = await datastore.get(key);

  var boat_obj = entity[0];

  if (boat_obj === undefined)
    return undefined;
  if (!boat_obj.load) 
    return {
      "Error": "The boat's load is empty"
    }
  if (boat_obj.load != load_id) 
    return {
      "Error": "Wrong load"
    };
  if (boat_obj.owner != owner)
    return {
      "Error": "Unauthorized"
    };
    
  // Add boat to the load.carrier
  var result = await load_model.remove_boat(load_id, boat_id, owner);
  if (result == undefined)
    return undefined
  else if (result["Error"])
    return result;
  else {
    boat_obj.load = null;

    // Save the boat to datastore
    var updated_entity = {"key": key, "data": boat_obj};
    return datastore.update(updated_entity);
  }
}

// Updates a boat & returns json. Returns undefined if doesn't exist
async function update_boat(boat_id, data, req, owner) {
  var key = datastore.key([BOAT, parseInt(boat_id)]);
  var boat = await get_boat(boat_id);
    
  if (boat == undefined)
    return undefined;

  if (boat.owner != owner)
    return {
      "Error": "Unauthorized"
    }
  if (data.name)
    boat.name = data.name
  if (data.type)
    boat.type = data.type;
  if (data.length)
    boat.length = data.length;

  var entity = {"key": key, "data": boat};

  await datastore.update(entity)
  
  return convBoat(req, boat, key["id"]);
}


module.exports.get_boat = get_boat;
module.exports.add_load = add_load;
module.exports.remove_load = remove_load;
module.exports.get_boats_by_ownerId = get_boats_by_ownerId;
module.exports.delete_boat = delete_boat;
module.exports.post_boat= post_boat

module.exports.update_boat= update_boat