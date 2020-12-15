const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

const LOAD = "Load_finalproj";

var boat_model = require('./boat');

function getUrl(req) {
  return req.protocol + '://' + req.get('host');
}

// Add IDs & Self links to boat & loads. Returns the entity
function convLoad(req, entity, load_id) {
  var url = getUrl(req);
  if (load_id)
    entity["id"] = load_id.toString();
  else
    entity["id"] = entity[Datastore.KEY].id.toString();
    
  entity["self"] = url + "/loads/" + entity.id;

  // if (entity.carrier != null) {
  //   entity.carrier.self = url + "/boats/" + entity.carrier.id;
  //   entity.carrier.id = entity.carrier.id.toString();
  // }

  entity["createdAt"] = entity["createdAt"].toLocaleString();
  entity["updatedAt"] = entity["updatedAt"].toLocaleString();

  return entity;
}

// Gets a load & returns as JSON. Returns undefined if doesn't exist
function get_load(load_id, req){
  var key = datastore.key([LOAD, parseInt(load_id)]);
  return datastore.get(key).then( (entity) => {
    if (entity[0] == undefined)
      return undefined;
    else {
      if (req)
        return convLoad(req, entity[0]);
      else
        return entity[0];
    }
  });
}

// Creates a load & returns as JSON.
function post_load(req, owner) {
  var d = new Date();
  var key = datastore.key(LOAD);
  var new_load = {
    "weight": req.body.weight, 
    "content": req.body.content,
    "createdAt": d,
    "updatedAt": d,
    "owner": owner,
    "carrier": null};
  var data = {"key": key, "data": new_load};

  return datastore.save(data)
    .then((entity) => { // entity is unused
      return convLoad(req, new_load, key["id"]);
    });
}

// Adds a boat to the load.carrier
async function add_boat(load_id, boat_id, owner) {
  var key = datastore.key([LOAD, parseInt(load_id)]);
  var entity = await datastore.get(key)

  var load = entity[0];
  if (load == undefined)
    return undefined;
  else if (load.owner != owner) {
    return {
      "Error": "Unauthorized"
    }
  }
  else if (load.carrier != null) {
    return {
      "Error": "The load is already carried by a boat"
    };
  } else {
    var load = entity[0];
    load.carrier = boat_id;
    var entity = {
      key: key,
      data: load,
    };
    return datastore.update(entity);
  }
}

// Removes boat from load.carrier by sestting it to null
async function remove_boat(load_id, boat_id, owner) {
  var key = datastore.key([LOAD, parseInt(load_id)]);
  var entity = await datastore.get(key);

  var load = entity[0];
  if (load == undefined)
    return undefined;
  else if (load.owner != owner) {
    return {
      "Error": "Unauthorized"
    }
  } else if (load.carrier != boat_id) {
    return {
      "Error": "Wrong Boat ID"
    }
  }
  else {
    load.carrier = null;

    var entity = {
      "key": key,
      "data": load
    };
    return await datastore.update(entity); // Updates carrier to null
  }
}

// Gets a lists of all loads & returns as JSON
async function get_loads_by_ownerId(req, cursor) {
  var owner = req.user.sub;

  var count_query = datastore.createQuery(LOAD).filter("owner", '=', owner);
  var allentities = await datastore.runQuery(count_query);
  var count = allentities[0].length;

  var q = datastore.createQuery(LOAD).filter("owner", '=', owner).limit(5);
  var result = {};

  if (cursor) {
    q = q.start(decodeURIComponent(cursor));
  }
  
  // Gets the filtered objets & then runs convLoad to it
  return datastore.runQuery(q).then( (entities) => {
    result.loads = entities[0].map(function(dataObj){
      return convLoad(req, dataObj);
    });

    if (entities[1].moreResults != Datastore.NO_MORE_RESULTS) {
      result.next = getUrl(req) + '/loads?cursor=' + encodeURIComponent(entities[1].endCursor);
    }

    result.total = count;
    return result;
  });
}

// Deletes a load. No error is return if doesn't exist (GCloud implementation)
async function delete_load(load_id, owner) {
  var load = await get_load(load_id);
  if (load == undefined) {
    return undefined;
  }
  else if (load.owner != owner)
    return {
      "Error": "Unauthorized"
    }
  if (load.carrier)
    await boat_model.remove_load(load.carrier, load_id, load.owner);
    
  var key = datastore.key([LOAD, parseInt(load_id)]);
  var result = await datastore.delete(key);
  return true;
}

// Updates a boat & returns json. Returns undefined if doesn't exist
async function update_load(load_id, data, req, owner) {
  var key = datastore.key([LOAD, parseInt(load_id)]);
  var load = await get_load(load_id);
    
  if (load == undefined)
    return undefined;

  if (load.owner != owner)
    return {
      "Error": "Unauthorized"
    }
  if (data.weight)
    load.weight = data.weight
  if (data.content)
    load.content = data.content;

  var d = new Date();
  load.updatedAt = d;

  var entity = {"key": key, "data": load};

  await datastore.update(entity)
  
  return convLoad(req, load, key["id"]);
}

module.exports.get_load = get_load;
module.exports.post_load = post_load;

module.exports.add_boat = add_boat;
module.exports.remove_boat = remove_boat;
module.exports.delete_load = delete_load;
module.exports.get_loads_by_ownerId = get_loads_by_ownerId;
module.exports.update_load = update_load