/**
 * Created by nterrier on 10/3/16.
 */
var express = require('express');
var app = express();
var router = express.Router();

var entry = function (app) {
    app.get('/coucou', function(req,res){
        res.send('Hello world');
    })

    app.get('/', function(req, res){
        res.send('Hello Bear');
    });
};

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/Matcha/docker/mongo');

entry(app);

app.listen(4201);