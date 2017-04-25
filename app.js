

var express = require('express');
var http = require("http");
var differ = require('diff2html').Diff2Html;
var bodyParser = require('body-parser');
var simpleGit = require('simple-git')();

var PORT = 1337;

// Build the server
var app = express();

app.use(express.static('public/www'));

app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

simpleGit
    .log(function(err, log) {
        console.log(log);
    })
    .outputHandler(function (command, stdout, stderr) {
        stdout.pipe(process.stdout);
        stderr.pipe(process.stderr);
    });


app.post('/openGitRepo', function(req, res) {
    console.log('req', req.body);

    simpleGit.cwd( req.body.gitRepoPath )
    .status(function(res, ok) {
        console.log('git', res);
        console.log('ok', ok);
    });

    res.send('POST request to the homepage')
});

http.createServer( app ).listen( PORT );

// Start that server, baby
console.log("Server running at http://localhost:" + PORT + "/");