var Promise = require('promise');
var Crypto  = require('crypto');

function Distance(lat_a, lon_a, lat_b, lon_b) {
    R = 6378;
    lat_a = (Math.PI * lat_a)/180;
    lon_a = (Math.PI * lon_a)/180;
    lat_b = (Math.PI * lat_b)/180;
    lon_b = (Math.PI * lon_b)/180;

    d = R * (Math.PI/2 - Math.asin( Math.sin(lat_b) * Math.sin(lat_a) + Math.cos(lon_b - lon_a) * Math.cos(lat_b) * Math.cos(lat_a)))
    return Math.floor(d);
}

function lastSeen(lastseen) {
    if (!lastseen) {
        message = 'Cette personne ne s\'est jamais connectée.';
    }
    else if (lastseen > new Date().getTime() - 900000){
        message = 'Connecté';
    }
    else if (Math.floor(lastseen / 86400000) == Math.floor(new Date().getTime() / 86400000)) {
        date = new Date(lastseen);
        message = "Dernière connexion à " + (date.getHours() + 1) + ":" + (date.getMinutes() + 1);
    }
    else {
        var mois = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
        date = new Date(lastseen);
        message = "Dernière connexion le " + date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear();
    }
    return message;
}

function keystr(nbcar) {
    var liste = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var chaine = '';
    for(i = 0; i < nbcar; i++)
        chaine = chaine + liste[Math.floor(Math.random()*liste.length)];
    return chaine;
}

function intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a
        .filter(function (e) {if (b.indexOf(e) !== -1) return true;})
        .filter(function (e, i, c) {return c.indexOf(e) === i;});
}

function likedBack(hispseudo, mypseudo) {
    return (hispseudo != mypseudo);
    /*
    mongodb.collection('likes').findOne({pseudo: hispseudo}, {_id: 0}, function (err, result) {
        if (err)
            return 1;
        else {
            if (result) {
                return 1;
            }
            else {
                return 1;
            }
        }
    })
    */
}

module.exports.args = function(req, res, obligatoire, facultatif) {
    return  new Promise(function(fullfil, reject) {
        for (var i in obligatoire) {
            if (!req.body[obligatoire[i]]) {
                reject({'res': res, state:'validation', 'error': 'Il manque un champ obligatoire.'});
            }
        }
        var regexp = {
            pseudo:     {reg: /^[a-zA-Z]{3,30}$/, msg: "Votre pseudo doit comporter entre 3 et 30 lettres"},
            mail:       {reg: /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9-]+)*$/,msg: "Votre mail n'est pas valide"},
            password:   {reg: /^.{8,30}$/, msg: "Votre mot de passe doit comporter entre 8 et 42 caractères"},
            password2:  {reg: /^.{8,30}$/, msg: "Vos mots de passes doivent être identiques"},
            firstname:  {reg: /^[a-zA-Z\- ]{3,30}$/,msg: "Votre prénom doit comporter entre 3 et 30 lettres"},
            lastname:   {reg: /^[a-zA-Z\- ]{3,30}$/,msg: "Votre nom doit comporter entre 3 et 30 lettres"},
            age:        {reg: /^1[8-9]$|^[2-9][0-9]$|^100$/, msg: "Votre age doit etre compris entre 18 et 100 ans"},
            gender:     {reg: /^[MF]$/, msg: "Votre sexe ne peut etre que M F"},
            orient:     {reg: /^[MFB]$/, msg: "Votre orientation ne peut etre que M F ou B"},
            tags:       {reg: /^[a-zA-Z\-, ]{0,300}$/, msg: "Vos tags doivent etre uniquement composés de lettres"},
            bio:        {reg: /^.{20,300}$/, msg: "Votre biographie doit contenir entre 20 et 500 caractères, pas de retours a la lignes"},
            token:      {reg: /^[a-zA-Z0-9]{42}$/, msg: "Votre session est invalide, veuillez vous reconnecter"},
            lat:        {reg: /^[0-9.-]{1,20}$/, msg: "La latitude entrée n'est pas valide"},
            long:       {reg: /^[0-9.-]{1,20}$/, msg: "La longitude entrée n'est pas valide"},
            message:    {reg: /^.{1,60000}$/, msg: "votre message n'est pas valide."},

            minScore:   {reg: /^[1-9][0-9]$|^100$|^[1-9]$/, msg: "minScore doit etre compris entre 1 et 100"},
            maxScore:   {reg: /^[1-9][0-9]$|^100$|^[1-9]$/, msg: "maxScore doit etre compris entre 1 et 100"},
            minAge:     {reg: /^1[8-9]$|^[2-9][0-9]$|^100$/, msg: "minAge doit etre compris entre 18 et 100 ans"},
            maxAge:     {reg: /^1[8-9]$|^[2-9][0-9]$|^100$/, msg: "maxAge doit etre compris entre 18 et 100 ans"},
            maxDist:    {reg: /^[0-9]{1,3}$/, msg: "La distance doit etre comprise entre 0 et 999 km"},
            image0:     {reg: /^.{10,1000000}$/, msg: "Votre photo principale n'est pas valide, la taille maximale est de 60KB"},
            image1:     {reg: /^.{10,1000000}$/, msg: "Votre photo secondaire 1 n'est pas valide, la taille maximale est de 60KB"},
            image2:     {reg: /^.{10,1000000}$/, msg: "Votre photo secondaire 2 n'est pas valide, la taille maximale est de 60KB"},
            image3:     {reg: /^.{10,1000000}$/, msg: "Votre photo secondaire 3 n'est pas valide, la taille maximale est de 60KB"},
            image4:     {reg: /^.{10,1000000}$/, msg: "Votre photo secondaire 4 n'est pas valide, la taille maximale est de 60KB"}
        };
        for (var j in req.body) {
            if (!(obligatoire.indexOf(j) > -1) && !(facultatif.indexOf(j) > -1)) {
                reject({'res': res, state:'error', error: 'Champ non autorisé rempli ?'});
                //console.log('[HACKATTEMPT] Too many arguments');
            }
            if (!(regexp[j].reg.test(req.body[j]))){
                reject({'res': res, state:'validation', 'error': regexp[j].msg});
            }
        }
        fullfil({'res': res, 'args': req.body});
    })
};

module.exports.passwordCreate = function(data) {
    return  new Promise(function(fullfil, reject) {
        if (data.args.password != data.args.password2)
            reject({'res': data.res, state:'validation', 'error': 'Les mots de passe sont différents'});
        var pass = {};
        if (pass.salt = keystr(21)) {
            if (pass.password = Crypto.createHash('sha512').update(pass.salt + data.args.password + pass.salt).digest('hex')) {
                data.args.pass = pass;
                delete data.args.password;
                delete data.args.password2;
                fullfil(data);
            }
        }
        else
            reject({'res': res, state:'error', error: 'Can\'t create string salt'});
    })
};

module.exports.accountInit = function(data) {
    return  new Promise(function(fullfil, reject) {
        data.args.score = 5;
        data.args.age = 18;
        data.args.gender = "M";
        data.args.orient = "B";
        data.args.bio = " ";
        data.args.images = [];
        data.args.tags = "rencontres";
        data.args.loca = {lat: 48.896648, long: 2.319092};
        fullfil(data);
    })
};

module.exports.login = function(data) {
    return  new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({pseudo: data.args.pseudo},{pseudo:1, pass:1}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (!result)
                    reject({'res': data.res, state:'validation', error: 'cet utilisateur n\'existe pas'});
                else {
                    if (result.pass.password != Crypto.createHash('sha512').update(result.pass.salt + data.args.password + result.pass.salt).digest('hex'))
                        reject({'res': data.res, state:'error', error: 'Mauvais mot de passe'});
                    else
                        fullfil(data);
                }
            }
        });
    })
};

module.exports.giveToken= function(data) {
    return  new Promise(function(fullfil, reject) {
        var token = keystr(42);
        date = new Date().getTime();
        mongodb.collection('users').update({pseudo: data.args.pseudo},{$set:{'pass.token': token, lastSeen: date}}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (!result)
                    reject({'res': data.res, state:'error', error: 'Votre session n\'a pas pu être enregistrée, veuillez vous reconnecter'});
                else
                    fullfil({res: data.res, json: token});
            }
        });
    })
};

module.exports.filter = function(data) {
    return  new Promise(function(fullfil, reject) {
        for (var i = data.json.length - 1; i >= 0; i--){
            data.json[i].distance = Distance(data.user.loca.lat, data.user.loca.long, data.json[i].loca.lat, data.json[i].loca.long);
            data.json[i].nbTags = intersect(data.user.tags.split(','),data.json[i].tags.split(',')).length;
            if (
                (data.json[i].pseudo == data.user.pseudo) || //si c'est nous ?
                (data.json[i].gender != data.user.orient && data.user.orient != 'B') || //si c'est un gars et qu'on cherche une fille ?
                (data.json[i].distance > data.args.maxDist) || //si il est trop loin ?
                (data.user.blacklist.blacklist.indexOf(data.json[i].pseudo) != -1) || //si on a bloqué l'utilisateur
                (data.args.tags && !intersect(data.args.tags.split(','),data.json[i].tags.split(',')).length)//si les tags ne correspondent pas ??
            ) {
                data.json.splice(i, 1);
            }
        }
        fullfil(data);
    })
};

module.exports.filterMatchs = function(data) {
    return  new Promise(function(fullfil, reject) {
        for (var i = data.likes.length - 1; i >= 0; i--){
            if ((data.likes[i] == data.user.pseudo) || !(likedBack(data.likes[i], data.user.pseudo))) {
                data.likes.splice(i, 1);
            }
        }
        fullfil(data);
    })
};

module.exports.allInfos = function(data) {
    return  new Promise(function(fullfil, reject) {
        data.json.distance = Distance(data.user.loca.lat, data.user.loca.long, data.json.loca.lat, data.json.loca.long);
        data.json.nbTags = intersect(data.user.tags.split(','),data.json.tags.split(',')).length;
        data.json.lastConnect = lastSeen(data.json.lastSeen);
        fullfil(data);
    })
};

module.exports.setImages = function(data) {
    return  new Promise(function(fullfil, reject) {
        data.args.images = [];
        data.args.images[0] = data.args.image0;
        data.args.images[1] = data.args.image1;
        data.args.images[2] = data.args.image2;
        data.args.images[3] = data.args.image3;
        data.args.images[4] = data.args.image4;
        delete data.args.image0;
        delete data.args.image1;
        delete data.args.image2;
        delete data.args.image3;
        delete data.args.image4;
        if (data.args.images[0])
            fullfil(data);
        else
        {
            delete data.args.images;
            fullfil(data);
        }
    })
};

module.exports.setLatLng = function(data) {
    return  new Promise(function(fullfil, reject) {
        if (data.args.lat && data.args.long) {
            data.args.loca = {lat:data.args.lat, long:data.args.long};
            delete data.args.lat;
            delete data.args.long;
        }
        fullfil(data);
    })
};

module.exports.photos = function(data) {
    return  new Promise(function(fullfil, reject) {
        if ((data.json.images && data.user.images && data.json.images[0] && data.user.images[0]))
            fullfil(data);
        else
            reject({'res': data.res, state:'validation', error: 'Vous devez tout les deux posseder une photo pour faire cela'});
    })
};

module.exports.hashNewPassword = function(data) {
    return new Promise(function(fullfil, reject) {
        data.new_pass = keystr(12);
        var pass = {};
        if (pass.salt = keystr(21)) {
            if (pass.password = Crypto.createHash('sha512').update(pass.salt + data.new_pass + pass.salt).digest('hex')) {
                data.pass = pass;
                fullfil(data);
            }
        }
        else
            reject({'res': res, state:'error', error: 'Can\'t create string salt'});
    })
};