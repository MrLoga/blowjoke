var express = require('express');
var router = express.Router();
var http = require('http');
var https = require('https');
 

router.get('/checkmime', function(req, res) {
    var url = url.substr(url.indexOf('//')+2);
    var i = url.indexOf('/');
    if (i < 0) i = url.length;

    var isHttps = url.indexOf("https") == 0;
    var req = {
        method:"HEAD",
        port:(isHttps ? 443 : 80),
        host:url.substr(0,i),
        path:url.substr(i)
    };

    req = (isHttps ? https : http).request(req, function (res) {
        handler(res.statusCode == 200 ? res.headers["content-type"] : null);
        console.log(res.headers["content-type"]);
    });
    req.addListener('error', function(err) {
        handler(null);
    });
    req.end();
});

router.get('/sendpost', function(req, res) {
    var db = req.db;
    var collection = db.get('posts');
    var time = new Date().getTime();
    collection.insert({
        "post" : req.query.post,
        "date" : time
    }, function (err, doc) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
        }
        else {
            collection.findOne({"date": time},function(e,post){
                res.send(post);
            });
        }
    });
});

router.get('/getmorepost', function(req, res) {
    var db = req.db;
    var collection = db.get('posts');
    var time = new Date().getTime();
    collection.find({},{
        sort: {date:-1},
        limit: 5,
        skip: req.query.page*5
    },function(e,posts){
        res.send(posts);
    });
});


/* GET home page. */
router.get('/', function(req, res) {
	var db = req.db;
    var collection = db.get('posts');

    collection.find({},{
        sort: {date:-1},
        limit: 5
    },function(e,posts){
        res.render('index', {
            posts : posts
        });
    });
});

module.exports = router;