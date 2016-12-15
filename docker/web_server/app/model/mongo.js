var Promise = require('promise');

function msgName(pseudo1, pseudo2) {
    if (pseudo1 > pseudo2)
        return (pseudo1+" & "+pseudo2);
    else
        return (pseudo2+" & "+pseudo1);
}

module.exports.loggedin = function(data) {
    return new Promise(function(fullfil, reject) {
        if (!data.args.token)
            reject({'res': data.res, state:'error', error: 'Vous n\'êtes pas connecté'});
        else {
            mongodb.collection('users').findOne({'pass.token': data.args.token}, {pseudo: 1, lastSeen:1}, function (err, result) {
                if (err)
                    reject({'res': data.res, state:'error', error: 'erreur mongo'});
                else {
                    if (result)
                    {
                        data.token = data.args.token;
                        delete data.args.token;
                        date = new Date().getTime();
                        if (date - result.lastSeen > 900000)
                            reject({'res': data.res, state:'error', error: 'votre session à expiré apres 15 minutes d\'inactivité, veuillez vous reconnecter'});
                        else
                        {
                            mongodb.collection('users').update({'pass.token': data.token}, {$set: {lastSeen: date}}, function (err, result) {
                                if (err)
                                    reject({'res': data.res, state:'error', error: 'erreur mongo'});
                                else {
                                    if (!result)
                                        reject({'res': data.res, state:'error', error: 'mise a jour de la derniere visite echouée, reessayez'});
                                    else
                                        fullfil(data);
                                }
                            });
                        }
                    }
                    else
                        reject({'res': data.res, state:'error', error: 'votre session est exiprée, veuillez vous reconnecter'});
                }
            });
        }
    })
};

//--------CREATION

module.exports.findMail = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({mail: data.args.mail}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (result)
                    reject({'res': data.res, state:'validation', error: 'Ce mail est deja pris'});
                else
                    fullfil(data);
            }
        });
    })
};
module.exports.findPseudo = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({pseudo: data.args.pseudo}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (result)
                    reject({'res': data.res, state:'validation', error: 'Ce pseudo est deja pris'});
                else
                    fullfil(data);
            }
        });
    })
};
module.exports.addUser = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').insertOne(data.args, function (err) {
            if (!err)
                fullfil(data);
            else
                reject({'res': data.res, state:'error', error: err});
        });
    })
};
module.exports.addNotifs = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('notifications').insertOne({pseudo: data.args.pseudo, notifs: []}, function (err) {
            if (!err)
                fullfil(data);
            else
                reject({'res': data.res, state:'error', error: err});
        });
    })
};
module.exports.addLikes = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('likes').insertOne({pseudo: data.args.pseudo, likedBy: []}, function (err) {
            if (!err)
                fullfil(data);
            else
                reject({'res': data.res, state:'error', error: err});
        });
    })
};
module.exports.addBlocks = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('blocks').insertOne({pseudo: data.args.pseudo, blacklist: []}, function (err) {
            if (!err)
                fullfil(data);
            else
                reject({'res': data.res, state:'error', error: err});
        });
    })
};

module.exports.resetExists = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne(data.args,{_id:0, pass:0, mail:0},null,null, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (result)
                    fullfil(data);
                else
                    reject({'res': data.res, state:'error', error: 'Aucun compte trouvé'});
            }
        });
    })
};
module.exports.resetApply = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').update(data.args,{$set: {pass: data.pass}}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (!result)
                    reject({'res': data.res, state:'validation', error: 'Vos modifications n\'ont pas pris effet, veuillez reesayer'});
                else
                    fullfil(data);
            }
        });
    })
};

//---------MYACCOUNT

module.exports.updateProfile = function(data) {
    return new Promise(function(fullfil, reject) {
        if (Object.keys(data.args).length) {
            mongodb.collection('users').update({'pass.token': data.token}, {$set: data.args}, function (err, result) {
                if (err)
                    reject({'res': data.res, state:'error', error: 'erreur mongo'});
                else {
                    if (!result)
                        reject({'res': data.res, state:'validation', error: 'Vos modifications n\'ont pas pris effet, veuillez reesayer'});
                    else
                        fullfil(data);
                }
            });
        }
        else
            fullfil(data);
    })
};

module.exports.findUserByToken = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({'pass.token': data.token},{_id:0, pass:0},null,null, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (result)
                    fullfil({'res': data.res, json: result});
                else
                    reject({'res': data.res, state:'error', error: 'no account found'});
            }
        });
    })
};

module.exports.loadNotifications = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('notifications').findOne({'pseudo': data.json.pseudo},{_id:0},null,null, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (result)
                {
                    data.json.notifications = result;
                    fullfil({'res': data.res, json: data.json});
                }
                else
                    reject({'res': data.res, state:'error', error: 'no account found'});
            }
        });
    })
};

module.exports.addPhoto = function(data) {
    return new Promise(function(fullfil, reject) {
        if (data.user.images.length < 5){
            mongodb.collection('users').update({'pass.token': data.token},{$addToSet:{images:data.args.images}}, function (err, result) {
                if (err)
                    reject({'res': data.res, state:'error', error: 'erreur mongo'});
                else {
                    if (result)
                    {
                        data.user.images.push(data.args.photo);
                        fullfil({'res': data.res, json: data.user.images});
                    }
                    else
                        reject({'res': data.res, state:'error', error: 'La photo n\'a pas pu être ajoutée'});
                }
            });
        }
        else
        {
            reject({'res': data.res, state:'validation', error: 'Vous avez déja 5 images, enlevez en une'});
        }
    })
};

module.exports.deleteNotifs = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('notifications').update({'pseudo': data.user.pseudo},{$set:{notifs:[]}}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (result){
                    fullfil(data);
                }
                else
                    reject({'res': data.res, state:'error', error: 'Vos notifications n\'ont pas pu être supprimées'});
            }
        });
    })
};

//--------SEARCH

module.exports.findUsers = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').find({score:{$gte:data.args.minScore,$lte:data.args.maxScore},
                age:{$gte:data.args.minAge,$lte:data.args.maxAge}},
            {_id:0, pass:0, mail:0},null,null).toArray(function (err, search) {
            if (!err) {
                data.json = search;
                fullfil(data);
            }
            else
                reject({'res': data.res, state:'error', error: err});
        });
    })
};

module.exports.retrieveUser = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({'pass.token': data.token},{_id:0, pass:0},null,null, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (result) {
                    data.user = result;
                    mongodb.collection('blocks').findOne({'pseudo': data.user.pseudo},{blacklist:1}, function (err, result) {
                        if (err)
                            reject({'res': data.res, state:'error', error: 'erreur mongo'});
                        else {
                            if (result) {
                                data.user.blacklist = result;
                                fullfil(data);
                            }
                            else
                                reject({'res': data.res, state:'error', error: 'no blacklist found'});
                        }
                    });
                }
                else
                    reject({'res': data.res, state:'error', error: 'no account found'});
            }
        });
    })
};

//--------USER & ACTIONS

module.exports.findUserById = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({pseudo: data.args.pseudo},{_id:0, pass:0, mail:0},null,null, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (result) {
                    data.json = result;
                    fullfil(data);
                }
                else
                    reject({'res': data.res, state:'error', error: 'Aucun compte trouvé avec ce pseudo'});
            }
        });
    })
};

module.exports.liked = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('likes').findOne({pseudo: data.args.pseudo, likedBy: data.user.pseudo}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                data.json.liked = (result) ? true : false;
                fullfil(data);
            }
        });
    })
};

module.exports.likes = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('likes').findOne({pseudo: data.user.pseudo, likedBy: data.args.pseudo}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                data.json.likes = (result) ? true : false;
                fullfil(data);
            }
        });
    })
};

module.exports.matched = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('likes').findOne({pseudo: data.user.pseudo, likedBy: data.args.pseudo}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (result) {
                    mongodb.collection('likes').findOne({pseudo: data.args.pseudo, likedBy: data.user.pseudo}, function (err, result) {
                        if (err)
                            reject({'res': data.res, state:'error', error: 'erreur mongo'});
                        else {
                            if (result) {
                                fullfil(data)
                            }
                            else {
                                reject({'res': data.res, state:'validation', error: 'vous n\'etes pas matchés'});
                            }
                        }
                    });
                }
                else {
                    reject({'res': data.res, state:'validation', error: 'vous n\'etes pas matchés'});
                }
            }
        });
    })
};

module.exports.amIBlocked = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('blocks').findOne({'pseudo': data.args.pseudo},{blacklist:1}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (result) {
                    if (result.blacklist.indexOf(data.user.pseudo) != -1)
                        reject({'res': data.res, state:'error', error: 'You can\'t do that.'});
                    else
                        fullfil(data);
                }
                else
                    reject({'res': data.res, state:'error', error: 'no blacklist found'});
            }
        });
    })
};

module.exports.message = function(data) {
    return new Promise(function(fullfil, reject) {
        pseudos = msgName(data.args.pseudo,data.user.pseudo);
        mongodb.collection('messages').update({pseudos: pseudos},{$push: {messages: {pseudo: data.user.pseudo, text: data.args.message}}}, {"upsert" : true}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (!result)
                    reject({'res': data.res, state:'error', error: 'Vos modifications n\'ont pas pris effet, veuillez reesayer'});
                else
                {
                    date = new Date().getDate() + "/" + (new Date().getMonth() + 1) + " :\n";
                    mongodb.collection('notifications').update({pseudo: data.args.pseudo},{$push: {notifs: (date + data.user.pseudo+' just sent you a message')}}, function (err, result) {
                        if (err)
                            reject({'res': data.res, state:'error', error: 'erreur mongo'});
                        else {
                            if (!result)
                                reject({'res': data.res, state:'error', error: 'Vos modifications n\'ont pas pris effet, veuillez reesayer'});
                            else
                                fullfil(data);
                        }
                    });
                }
            }
        });
    })
};

module.exports.retrieveHisto = function(data) {
    return new Promise(function(fullfil, reject) {
        pseudos = msgName(data.args.pseudo,data.user.pseudo);
        mongodb.collection('messages').findOne({pseudos: pseudos},{_id:0}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (result)
                {
                    data.json = result.messages;
                    fullfil(data);
                }
                else
                {
                    data.json = {messages:{pseudo:'matchaBot',text:'Vous n\'avez pas encore de messages, faites le premier pas ;)'}};
                    fullfil(data);
                }
            }
        });
    })
};

module.exports.retrieveMatchs = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('likes').findOne({pseudo: data.user.pseudo},{_id:0}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (result)
                {
                    data.likes = result.likedBy;
                    fullfil(data);
                }
                else
                {
                    data.json.likes = 'Vous n\'avez pas de matchs, faites plutot une recherche';
                    fullfil(data);
                }
            }
        });
    })
};


module.exports.visitUser = function(data) {
    return new Promise(function(fullfil, reject) {
        date = new Date().getDate() + "/" + (new Date().getMonth() + 1) + " :\n";
        mongodb.collection('notifications').update({pseudo: data.args.pseudo},{$addToSet: {notifs: (date + data.user.pseudo+' a visité votre profil')}}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (!result)
                    reject({'res': data.res, state:'error', error: 'Vos modifications n\'ont pas pris effet, veuillez reesayer'});
                else
                    fullfil(data);
            }
        });
    })
};

module.exports.likeUser = function(data) {
    return new Promise(function(fullfil, reject) {
        if (!data.json.liked) {
            mongodb.collection('likes').update({pseudo: data.args.pseudo}, {$addToSet: {likedBy: data.user.pseudo}}, function (err, result) {
                if (err)
                    reject({'res': data.res, state:'error', error: 'erreur mongo'});
                else {
                    if (!result)
                        reject({'res': data.res, state:'error', error: 'Vos modifications n\'ont pas pris effet, veuillez reesayer'});
                    else {
                        date = new Date().getDate() + "/" + (new Date().getMonth() + 1) + " :\n";
                        mongodb.collection('notifications').update({pseudo: data.args.pseudo}, {$push: {notifs: (date + data.user.pseudo + ' vous a liké')}}, function (err, result) {
                            if (err)
                                reject({'res': data.res, state:'error', error: 'erreur mongo'});
                            else {
                                if (!result)
                                    reject({'res': data.res, state:'error', error: 'Vos modifications n\'ont pas pris effet, veuillez reesayer'});
                                else
                                    fullfil(data);
                            }
                        });
                    }
                }
            });
        }
        else {
            mongodb.collection('likes').update({pseudo: data.args.pseudo}, {$pull: {likedBy: data.user.pseudo}}, function (err, result) {
                if (err)
                    reject({'res': data.res, error: 'erreur mongo'});
                else {
                    if (!result)
                        reject({'res': data.res, error: 'Vos modifications n\'ont pas pris effet, veuillez reesayer'});
                    else {
                        date = new Date().getDate() + "/" + (new Date().getMonth() + 1) + " :\n";
                        mongodb.collection('notifications').update({pseudo: data.args.pseudo}, {$push: {notifs: (date + data.user.pseudo + ' ne vous like plus')}}, function (err, result) {
                            if (err)
                                reject({'res': data.res, error: 'erreur mongo'});
                            else {
                                if (!result)
                                    reject({
                                        'res': data.res,
                                        error: 'Vos modifications n\'ont pas pris effet, veuillez reesayer'
                                    });
                                else
                                    fullfil(data);
                            }
                        });
                    }
                }
            });
        }
    })
};

module.exports.addScore = function(data) {
    return new Promise(function(fullfil, reject) {
        var new_score = (data.json.score + ((data.json.liked) ? -5 : 5));
        new_score = ((new_score > 0)? new_score:1);
        new_score = ((new_score <= 100)? new_score : 100);
        mongodb.collection('users').update({pseudo: data.json.pseudo}, {$set: {score: new_score}}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'erreur mongo'});
            else {
                if (!result)
                    reject({'res': data.res, state:'error', error: 'Vos modifications n\'ont pas pris effet, veuillez reesayer'});
                else {
                    fullfil(data);
                }
            }
        });
    })
};

module.exports.reportUser = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('reports').insertOne({reported: data.args.pseudo, by: data.user.pseudo}, function (err, result) {
            if (err)
                reject({'res': data.res, error: 'erreur mongo'});
            else
                fullfil(data);
        });
    })
};

module.exports.blockUser = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('blocks').update({pseudo: data.user.pseudo}, {$addToSet: {blacklist: data.args.pseudo}}, function (err, result) {
            if (err)
                reject({'res': data.res, error: 'erreur mongo'});
            else
                fullfil(data);
        });
    })
};