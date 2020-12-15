const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const https = require('https');

const hbs = require("hbs");

app.set('view engine', 'hbs');
app.set('view options', { layout: 'layout'});

app.use(express.static('public'));

const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

const SECRETSTORE = "SecretStore_assign6";

app.enable('trust proxy');

const path = require('path');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Global Array used to store states generated
var stateArray = [];
// Generate state & delete old ones if too many
function saveState(stateId) {
  // Delete Keep last 25 states if more than 50
  var newStateArray = []
  if (stateArray.length > 50) {
    for (var i=25; i < stateArray.length; i++) {
      newStateArray.push(stateArray[i]);
    }
    stateArray = newStateArray;
  }
  stateArray.push(stateId);
}
// Returns true if stateId is in stateArray
function checkState(stateId) {
  if (stateId === undefined || stateId === null)
    return false;
  for (var i=0; i < stateArray.length; i++) {
    if (stateArray[i] == stateId)
      return true;
  }
  return false; // not found
}

// Generates a state string & saves it to stateArray
function generate_state() {
  var state = parseInt(Math.random()* 1000000000000).toString() + 
    parseInt(Math.random()* 1000000000000).toString();
  saveState(state);
  return state;
}

app.get('/', (req, res) => {
  // Generate a random state
  res.render('welcome');
});

// Returns a Promise that gets the token data js JSON string using https
function get_token(code) {
  return new Promise(function(resolve, reject) {
    var data = {
      client_id: "1070730762428-cqvjbp5l7kvnvj9a7l1nmucp9ok81u4u.apps.googleusercontent.com",
      client_secret: "7o2qjgzcgelXywYUW2Z9-a2H",
      code: code,
      redirect_uri: "https://oauth.appspot.com/oauth",
      grant_type: "authorization_code",
    };

    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      }
    }
    // Data is received in chunks
    var received_data = "";

    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        received_data += chunk;
      });

      res.on('end', () => {
        resolve(received_data);
      });
    });

    req.on('error', (e) => {
      reject(e.message);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

// Returns a Promise that gets the profile data js JSON string using https
// Uses the Google People API
function get_profile(token) {
  return new Promise(function(resolve, reject) {
    const options = {
      hostname: 'people.googleapis.com',
      path: '/v1/people/me?personFields=names,emailAddresses&access_token=' + token,
      method: "GET",
    }
    // Data is received in chunks
    var received_data = "";

    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        received_data += chunk;
      });

      res.on('end', () => {
        resolve(received_data);
      });
    });

    req.on('error', (e) => {
      reject(e.message);
    });

    req.end();
  });
}

// Auth Page: Checks State, Gets token from Google OAuth, Uses token to get
// Info, Then redirects to /user_info with the info as query param
app.get('/oauth', (req, res) => {
  var state = req.query.state;
  if ( !checkState(state) ) {
    res.redirect("/error"); // if state is not found, then redirect
  } else {
    var code = req.query.code;
    if (code) {
      get_token(code).then(function(response) {
        var data = JSON.parse(response);

        if (response.error) {
          res.redirect('/error');
        } else {
          var token = data.access_token,
              profile_url = data.scope;

          get_profile(token).then(function(response){
            var profile = JSON.parse(response);
            if (response.error) {
              res.redirect('/error');
            } else {
              var first_name = profile.names[0].givenName,
                last_name = profile.names[0].familyName;
              // Show the info in /user_info page
              res.redirect(`/user_info?fn=${first_name}&ln=${last_name}&state=${state}`);
            }
          });
        }
      }, function(error) {
        console.log("Error: " + error);
        res.redirect('/error');
      });
    } else {
      res.redirect('/error');
    }
  }
});

// Generate a state, save it, and redirect user to Google Auth
// This is so that a state is generated only when user clicks this.
app.get('/oauth-redirect', (req, res) => {
  // Generate a random state
  var state = generate_state();
  
  var url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&\
scope=profile+email&\
redirect_uri=https%3A//oauth.appspot.com/oauth&\
state=${state}&\
client_id=1070730762428-cqvjbp5l7kvnvj9a7l1nmucp9ok81u4u.apps.googleusercontent.com`;

  res.redirect(url);
});

app.get('/user_info', (req, res) => {
  var context = {
    first_name: req.query.fn,
    last_name: req.query.ln,
    state: req.query.state
  };
  res.render("user_info", context);
});

app.get('/error', (req, res) => {
  res.render("error");
});

app.use(function(req, res, next){
  res.status(404).send({"Error": "Not Found"});
})

app.use(function(req, res, next){
  res.status(500).send({"Error": "Server Error"});
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});