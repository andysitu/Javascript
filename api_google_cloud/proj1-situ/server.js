const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const https = require('https');

const hbs = require("hbs");

var client_id = "46070418507-9o3105jqa5nnt4b6d2i7fqgq541t5b2r.apps.googleusercontent.com",
    client_secret = "AiSDX1lQRSqC9h8ambSHYNuE";

var site_protocol = "https",
    domain = "proj1-situ.appspot.com";
// var site_protocol = "http",
//     domain = "localhost:8080";

app.set('view engine', 'hbs');
app.set('view options', { layout: 'layout'});

var session = require('express-session');

const {Datastore} = require('@google-cloud/datastore');

const DatastoreStore = require('@google-cloud/connect-datastore')(session);

var user_model = require('./model/user.js');
// session used for state verification
app.use(session({
  store: new DatastoreStore({
    kind: 'express-sessions',
    expirationMs: 0,
    dataset: new Datastore({
      projectId: 'proj1-situ',
      // keyFilename: "D:\Documents\proj1-situ-6667024d61af.json"
    })
  }),
  secret: "supersecret@5678abc",
}));

app.use(express.static('public'));

app.enable('trust proxy');

const path = require('path');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/boats', require('./routes/boats'));
app.use('/loads', require('./routes/loads'));
app.use('/users', require('./routes/users'));

/** Welcome & Info Page */

// Generates a state string & saves it to stateArray
function generate_state() {
  var state = parseInt(Math.random()* 1000000000000).toString() + 
    parseInt(Math.random()* 1000000000000).toString();
  return state;
}

// Returns a Promise that gets the token data js JSON string using https
function get_token(code) {
  return new Promise(function(resolve, reject) {
    var data = {
      client_id: client_id,
      client_secret: client_secret,
      code: code,
      redirect_uri: `${site_protocol}://${domain}/oauth`,
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

// Welcome page
app.get('/', (req, res) => {
  // Generate a random state
  res.render('welcome');
});

// Auth Page: Checks State, Gets token from Google OAuth, Uses token to get
// Info, Then renders user_info with the info as query param
app.get('/oauth', async (req, res) => {
  var state = req.query.state;
  if ( state != req.session.state ) {
    console.log("Error: state", state, req.session.state)
    res.redirect("/error"); // if state is not found, then redirect
  } else {
    var code = req.query.code;
    if (code) {
      get_token(code).then(function(response) {
        var data = JSON.parse(response);

        if (response.error) {
          console.log("Error, response.error", response.error);
          res.redirect('/error');
        } else {
          var token = data.access_token,
              profile_url = data.scope;

          get_profile(token).then(async function(response){
            var profile = JSON.parse(response);
            if (response.error) {
              console.log("Error, profile", response.error);
              res.redirect('/error');
            } else {
              var user_id = profile.resourceName.split("/")[1];
              await user_model.create_user(user_id);

              var context = {
                first_name: profile.names[0].givenName,
                last_name: profile.names[0].familyName,
                state: state,
                id_token: data.id_token,
                user_id: user_id,
              };

              // Show in info page
              res.render("user_info", context);
            }
          });
        }
      }, function(error) {
        console.log("Error, redirect: " + error);
        res.redirect('/error');
      });
    } else {
      console.log("Error", code);
      res.redirect('/error');
    }
  }
});

// Generate a state, save it, and redirect user to Google Auth
// This is so that a state is generated only when user clicks this.
app.get('/oauth-redirect', (req, res) => {
  // Generate a random state
  var state = generate_state();
  req.session.state = state;
  var url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&\
scope=profile+email&\
redirect_uri=${site_protocol}%3A//${domain}/oauth&\
state=${state}&\
client_id=${client_id}`;

  res.redirect(url);
});

/** Error Pages */

app.get('/error', (req, res) => {
  res.render("error");
});

app.use(function(req, res, next){
  res.status(404).send({"Error": "Not Found"});
});

// Handle invalid token & credentials_required
app.use(function(err, req, res, next){
  if (err.code == "invalid_token" || err.code == "credentials_required") {
    res.status(401).send({"Error": "Missing or invalid JWT"});
  } else if (err instanceof SyntaxError) {
    res.status(415).json({
      "Error": 'Only Accept application/json',
    });
  } else  {
    console.log(err);
    res.status(500).send({"Error": "Server Error"});
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});