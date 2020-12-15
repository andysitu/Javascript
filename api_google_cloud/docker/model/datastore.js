const {Datastore} = require('@google-cloud/datastore');

module.exports.Datastore = Datastore;
module.exports.datastore = new Datastore();

const datastore = new Datastore();

const BOAT = "boat_assign8";