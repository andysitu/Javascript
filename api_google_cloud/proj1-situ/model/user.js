const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

const USERS = "User_finalproj";

module.exports.get_users = get_users;
module.exports.create_user = create_user;
module.exports.add_boat = add_boat;
module.exports.remove_boat = remove_boat;

// Creates a boat & returns results as JSON
async function create_user (user_id) {
  // Check if user exist already
  var q = datastore.createQuery(USERS).filter('user_id', '=', user_id);

  var result = await datastore.runQuery(q);
  // Return user ID & stop running function if it exist
  if (result[0] != undefined && result[0].length > 0)
    return result[0][0].user_id;

  var key = datastore.key(USERS);
  var new_user = {
    "user_id": user_id, 
  };
  var data = {"key": key, "data": new_user};

  return datastore.save(data)
    .then(() => {
      return key["id"];
    });
}

// Gets list of users & returns as JSON
function get_users(){
  var q = datastore.createQuery(USERS);

  return datastore.runQuery(q).then( (entities) => {
    return entities;
  });
}

async function add_boat(user_id, boat_id) {
  const q = datastore.createQuery(USERS).filter('user_id', '=', user_id);
  
  var result = await datastore.runQuery(q);
  var user = result[0][0];

  user.boats.push(boat_id);

  var updated_entity = {"key": user[datastore.KEY], "data": user};
  return await datastore.update(updated_entity);
}

async function remove_boat(user_id, boat_id) {
  const q = datastore.createQuery(USERS).filter('user_id', '=', user_id);
  
  var result = await datastore.runQuery(q);
  var user = result[0][0];

  var boats = user.boats;

  for (var i=0; i< boats.length; i++) {
    if (boats[i] == boat_id) {
      boats.splice(i, 1);
      break;
    }
  }

  var updated_entity = {"key": user[datastore.KEY], "data": user};
  return await datastore.update(updated_entity);
}