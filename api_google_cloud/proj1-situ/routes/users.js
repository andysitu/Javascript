var express = require('express');

const router = express.Router();

const {Datastore} = require('@google-cloud/datastore');

var user_model = require('../model/user.js');

// GET - Get users list
router.get('/', async function(req, res){
  const accepts = req.accepts(['application/json']);
  var boatId = req.params.boatId;

  if (!accepts) { // Only accept-JSON & HTML
    res.status(406).json({
      "Error": 'Not Acceptable',
    });
  } else { // Return the boat as a JSON/HTML
    var users = await user_model.get_users();
    var data = [];
    for (var i=0; i< users[0].length; i++) {
      data.push({
        "user_id": users[0][i].user_id
      });
    }
    res.status(200).json(data);
  }
});

module.exports = router;