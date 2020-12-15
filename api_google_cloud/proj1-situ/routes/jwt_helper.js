var express = require('express');

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

module.exports.checkJWT = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
  }),
  issuer: "https://accounts.google.com",
  algorithms: ['RS256']
});