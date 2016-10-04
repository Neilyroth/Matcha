var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT;

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
    res.send('Hello Bear');
});

app.listen(port);
console.log('Magic happens on port ' + port);