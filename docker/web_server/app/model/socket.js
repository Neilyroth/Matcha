module.exports.message = function(data) {
    return new Promise(function(fullfil, reject) {

        //io.sockets.broadcast.emit('newNotif', "_on").catch(function(err){console.log(err);});
        //socket.emit(pseudo, titre, message);
        //socket.emit(data.args.pseudo, 'new_message', data.user.pseudo);
        //socket.emit(data.args.pseudo, 'new_notification', 1);
        fullfil(data);
    })
};
