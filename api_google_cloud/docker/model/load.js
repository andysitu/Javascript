const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

const LOAD = "Load_assign8";

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

  if (entity.carrier != null) {
    entity.carrier.self = url + "/boats/" + entity.carrier.id;
    entity.carrier.id = entity.carrier.id.toString();
  }

  return entity;
}

// Gets a load & returns as JSON. Returns undefined if doesn't exist
function get_load(req, load_id){
  if (typeof(load_id) == "string")
    load_id = parseInt(load_id);
  var key = datastore.key([LOAD, load_id]);
  return datastore.get(key).then( (entity) => {
    if (entity[0] == undefined)
      return undefined;
    else {
      return convLoad(req, entity[0]);
    }
  });
}

// Creates a load & returns as JSON.
function post_load(weight, content, delivery_date, url) {
  if (typeof(weight) == "string")
    weight = parseInt(weight);
  var key = datastore.key(LOAD);
  var new_load = {
    "weight": weight, 
    "content": content, 
    "delivery_date": delivery_date, 
    "carrier": null};
  var data = {"key": key, "data": new_load};

  return datastore.save(data)
    .then((entity) => {
      new_load.id = key.id.toString();
      new_load.self = url + "/loads/" + key["id"];
      return new_load;
    });
}

// Adds a boat to the load.carrier
function add_boat(load_id, boat_id, boat_name) {
  var key = datastore.key([LOAD, load_id]);
  return datastore.get(key).then( (entity) => {
    if (entity[0] == undefined)
      return undefined;
    else if (entity[0].carrier != null) {
      return {
        "Error": "The load is already carried by a boat"
      };
    } else {
      var entity = {
        key: key,
        data: {
          "weight": entity[0].weight, 
          "content": entity[0].content, 
          "delivery_date": entity[0].delivery_date, 
          "carrier": {
            "id": boat_id,
            "name": boat_name,
          },
        }
      };
      return datastore.update(entity);
    }
  });
}

// Removes boat from load.carrier by sestting it to null
async function remove_boat(load_id, boat_id) {
  var key = datastore.key([LOAD, load_id]);
  return datastore.get(key).then( (entity) => {
    if (entity[0] == undefined)
      return undefined;
    else if (entity[0].carrier == null || entity[0].carrier.id != boat_id) {
      return {
        "Error": "The boat does not carry this load"
      };
    } else {
      var entity = {
        key: key,
        data: {
          "weight": entity[0].weight, 
          "content": entity[0].content, 
          "delivery_date": entity[0].delivery_date, 
          "carrier": null,
        }
      };
      return datastore.update(entity); // Updates carrier to null
    }
  });
}

// Gets a lists of all loads & returns as JSON
function get_loads(req, cursor) {
  var q = datastore.createQuery(LOAD).limit(3);
  var result = {};
  if (cursor) {
    q = q.start(cursor);
  }
  // Gets the filtered objets & then runs convLoad to it
  return datastore.runQuery(q).then( (entities) => {
    result.loads = entities[0].map(function(dataObj){
      return convLoad(req, dataObj);
    });

    if (entities[1].moreResults != Datastore.NO_MORE_RESULTS) {
      result.next = getUrl(req) + '/loads?cursor=' + entities[1].endCursor;
    }
    return result;
  });
}

// Returns all loads with a boat_id
function get_loads_with_boat(req, boat_id) {
  if (typeof(boat_id) == "string")
    boat_id = parseInt(boat_id);
  var query = datastore.createQuery(LOAD)
    .filter("carrier.id", "=", boat_id);
  return datastore.runQuery(query).then( (entities) => {
    return entities[0].map(function(dataObj) {
      return convLoad(req, dataObj);
    });
  });
}

// Deletes a load. No error is return if doesn't exist (GCloud implementation)
function delete_load(load_id) {
  if (typeof(load_id) == "string")
    load_id = parseInt(load_id);
  var key = datastore.key([LOAD, load_id]);
  return datastore.delete(key).then(
    (entity) => { return {}; }
  );
}

// Finds if a boat is in a load & empties if it so. Returns true
// If it that boat doesn't exist, returns false
async function find_and_empty_load(boat_id) {
  if (typeof(boat_id) == "string")
    boat_id = parseInt(boat_id);
  var query = datastore.createQuery(LOAD)
    .filter("carrier.id", "=", boat_id);
  await datastore.runQuery(query).then( async (entities) => {
    var load_id;
    for (var i=0; i<entities[0].length; i++) {
      load_id = entities[0][i][Datastore.KEY].id;
      
      var key = datastore.key([LOAD, parseInt(load_id)]);
      var entity = {
        key: key,
        data: {
          "weight": entities[0][i].weight, 
          "content": entities[0][i].content, 
          "delivery_date": entities[0][i].delivery_date, 
          "carrier": null,
        }
      }
      await datastore.update(entity);
    }
    return true;
  });
}W

module.exports.get_load = get_load;
module.exports.post_load = post_load;
module.exports.get_loads = get_loads;

module.exports.add_boat = add_boat;
module.exports.remove_boat = remove_boat;
module.exports.get_loads_with_boat = get_loads_with_boat
module.exports.delete_load = delete_load;
module.exports.find_and_empty_load = find_and_empty_load;