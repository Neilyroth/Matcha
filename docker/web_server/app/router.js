var Check = require('./model/checker.js');
var Mongo = require('./model/mongo.js');
var Mail = require('./model/mail.js');

module.exports = function(router, app, io) {
    router.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PROPFIND');
        res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
        console.log('V');
        next();
    }); //MIDDLEWARE
    router.get('/', function (req, res) {
        res.send('Matcha API online !');
    });

    router.post('/create', function (req, res) {
        Check.args(req, res, ['mail','pseudo','password','password2','firstname','lastname'])
            .then(Mongo.findMail)
            .then(Mongo.findPseudo)
            .then(Check.passwordCreate)
            .then(Check.accountInit)
            .then(Mongo.addUser)
            .then(Mongo.addNotifs)
            .then(Mongo.addLikes)
            .then(Mongo.addBlocks)
            .then(Mail.welcome)
            .then(
                function(data) {console.log('Create OK');data.res.send({state:'success', json:'Votre compte à bien été créé.'});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/reset', function (req, res) {
        Check.args(req, res, ['pseudo','mail'])
            .then(Mongo.resetExists)
            .then(Check.hashNewPassword)
            .then(Mongo.resetApply)
            .then(Mail.resetPassword)
            .then(
                function(data) {console.log('Login OK');data.res.send({state:'success', json:data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/login', function (req, res) {
        Check.args(req, res, ['pseudo','password'])
            .then(Check.login)
            .then(Check.giveToken)
            .then(
                function(data) {console.log('Login OK');data.res.send({state:'success', json:data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/myaccount', function (req, res) {
        Check.args(req, res, [], ['token','mail','firstname','lastname','gender','orient','bio','age','tags',
            'lat','long','image0','image1','image2','image3','image4'])
            .then(Check.setImages)
            .then(Check.setLatLng)
            .then(Mongo.loggedin)
            .then(Mongo.updateProfile)
            .then(Mongo.findUserByToken)
            .then(Mongo.loadNotifications)
            .then(
                function(data) {console.log('Infos OK');data.res.send({state:'success', json: data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
        });
    router.post('/users', function (req, res) {
        Check.args(req, res, ['minScore','maxScore','minAge','maxAge','maxDist'], ['token','tags'])
            .then(Mongo.loggedin)
            .then(Mongo.findUsers)
            .then(Mongo.retrieveUser)
            .then(Check.filter)
            .then(
                function(data) {console.log('Search OK');data.res.send({state:'success', json: data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json: data.error});}
            );
    });
    router.post('/useraccount', function (req, res) {
        Check.args(req, res, ['pseudo'], ['token'])
            .then(Mongo.loggedin)
            .then(Mongo.findUserById)
            .then(Mongo.retrieveUser)
            .then(Check.allInfos)
            .then(Mongo.liked)
            .then(Mongo.likes)
            .then(Mongo.amIBlocked)
            .then(Mongo.visitUser)
            .then(
                function(data) {console.log('Visite OK');data.res.send({state:'success', json:data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });

    router.post('/deletenotifs', function (req, res) {
        Check.args(req, res, [], ['token'])
            .then(Mongo.loggedin)
            .then(Mongo.retrieveUser)
            .then(Mongo.deleteNotifs)
            .then(
                function(data) {console.log('Notifs suppr OK');data.res.send({state:'success', json:data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/userlike', function (req, res) {
        Check.args(req, res, ['pseudo'], ['token'])
            .then(Mongo.loggedin)
            .then(Mongo.findUserById)
            .then(Mongo.retrieveUser)
            .then(Check.photos)
            .then(Mongo.liked)
            .then(Mongo.amIBlocked)
            .then(Mongo.likeUser)
            .then(Mongo.addScore)
            .then(
                function(data) {console.log('Like OK');data.res.send({state:'success', json: !data.json.liked});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/userreport', function (req, res) {
        Check.args(req, res, ['pseudo'], ['token'])
            .then(Mongo.loggedin)
            .then(Mongo.retrieveUser)
            .then(Mongo.reportUser)
            .then(
                function(data) {console.log('Report OK');data.res.send({success:true, json: data.json});},
                function(data) {console.log(data.error);data.res.send({success:false, json:data.error});}
            );
    });
    router.post('/userblock', function (req, res) {
        Check.args(req, res, ['pseudo'], ['token'])
            .then(Mongo.loggedin)
            .then(Mongo.retrieveUser)
            .then(Mongo.blockUser)
            .then(
                function(data) {console.log('Report OK');data.res.send({success:true, json: data.json});},
                function(data) {console.log(data.error);data.res.send({success:false, json:data.error});}
            );
    });
    router.post('/userchat', function (req, res) {
        Check.args(req, res, ['pseudo','message'], ['token'])
            .then(Mongo.loggedin)
            .then(Mongo.findUserById)
            .then(Mongo.retrieveUser)
            .then(Mongo.matched)
            .then(Mongo.message)
            .then(
                function(data) {console.log('message OK');data.res.send({state:'success', json:data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/chathisto', function (req, res) {
        Check.args(req, res, ['pseudo'], ['token'])
            .then(Mongo.loggedin)
            .then(Mongo.retrieveUser)
            .then(Mongo.retrieveMatchs)
            .then(Mongo.retrieveHisto)
            .then(Check.filterMatchs)
            .then(
                function(data) {console.log('histo OK');data.res.send({state:'success', json:data.json, likes:data.likes});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });

    router.all('*', function (req, res) {
        res.send({state :'error', json:'Les informations que vous essayez d\'obtenir on peut être changé d\'adresse, veuillez contacter le support technique.'});
    });
};