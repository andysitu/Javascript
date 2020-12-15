const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

const BOAT = "Boat_assign8";

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
function post_boat(req, name, type, length) {
  var key = datastore.key(BOAT);
  var new_boat = {
    "name": name, 
    "type": type, 
    "length": length,
  };
  var data = {"key": key, "data": new_boat};

  return datastore.save(data)
    .then((boat_entity) => {
      return convBoat(req, new_boat, key["id"]);
    });
}

// Gets specific boat & returns JSON. undefined if doesn't exist
function get_boat(boatId, req){
  if (typeof(boatId) == "string")
    boatId = parseInt(boatId);
  var key = datastore.key([BOAT, boatId]);
  // const q = datastore.createQuery(BOAT).filter('__key__', '=', key);
  return datastore.get(key).then( (entity) => {
    if (entity[0] == undefined)
      return undefined;
    else {
      return convBoat(req, entity[0]);
    }
  }, (reject_reason) => {
    return undefined;
  });
}

// Gets specific boat & returns JSON. undefined if doesn't exist
function name_taken(boat_name){
  const q = datastore.createQuery(BOAT).filter('name', '=', boat_name);
  return datastore.runQuery(q).then( (entity) => {
    if (entity[0] == undefined)
      return false;
    else if (entity[0].length > 0)
      return true;
    else {
      return false;
    }
  });
}

// Gets list of boats & returns as JSON
function get_boats(req, cursor){
  var q = datastore.createQuery(BOAT).limit(3);
  var result = {};
  if (cursor) {
    q = q.start(cursor);
  }

  return datastore.runQuery(q).then( (entities) => {
    result.boats =  entities[0].map(function(dataObj){
      return convBoat(req, dataObj);
    });
    // Pagination - next link added
    if (entities[1].moreResults != Datastore.NO_MORE_RESULTS) {
      result.next = getUrl(req) + "/boats?cursor=" + entities[1].endCursor;
    }
    return result;
  });
}

// Delete Boat Only
function delete_boat(boat_id) {
  if (typeof(boat_id) == "string")
    boat_id = parseInt(boat_id);
  var key = datastore.key([BOAT, boat_id]);
  return datastore.delete(key).then(
    (q) => { return {}; }
  )
}

// Updates a boat & returns json. Returns undefined if doesn't exist
async function update_boat(boat_id, data, req) {
  if (typeof(boat_id) == "string")
    boat_id = parseInt(boat_id);
  var key = datastore.key([BOAT, boat_id]);
  if (data.name == undefined || data.type == undefined || data.length == undefined) {
    var old_boat = await get_boat(boat_id, req);
    if (old_boat == undefined)
      return undefined;
    if (data.name == undefined)
      data.name = old_boat.name;
    if (data.type == undefined)
      data.type = old_boat.type;
    if (data.length == undefined)
      data.length = old_boat.length;
  }

  var entity = {"key": key, "data": data};

  return datastore.update(entity)
  .then( (new_boat) => {
    return convBoat(req, data, key["id"]);
  }, (reject_reason)=> {
    return undefined;
  });
}


module.exports.get_boat = get_boat;
module.exports.post_boat = post_boat;
module.exports.get_boats = get_boats;
module.exports.delete_boat = delete_boat;
module.exports.update_boat = update_boat
module.exports.name_taken = name_taken;