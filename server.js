// server.js
// where your node app starts

// init project
const express = require('express');
const proxy = require('express-http-proxy');
const url = require('url');


const app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

function selectProxyHost(container) {
    const parsed = url.parse(container.url.substr(1));
    return parsed.protocol + '//' + parsed.host;
}

function resolvePath(req) {
    const parsed = url.parse(req.url.substr(1));
    return parsed.path + (parsed.hash || '');    
}

app.use('/proxy', proxy(selectProxyHost, {
    memoizeHost: false,
    proxyReqPathResolver: resolvePath
}));

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
