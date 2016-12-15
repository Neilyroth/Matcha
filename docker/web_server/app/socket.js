module.exports = function (http, listOfConnected) {

    var io = require('socket.io').listen(http);

    io.sockets.on('connection', function (socket) {
        console.log('new socket recieved.');

        socket.on('login', function (user) {
            mongodb.collection('users').findOne({'pass.token': user.token},{pseudo:1}, function (err, result) {
                if (!err && result) {
                    listOfConnected[result.pseudo] = socket.id;
                    console.log("user",result.pseudo,"just connected");
                    console.log(listOfConnected);
                }
            });
        });

        socket.on('sendNotif', function (user) {
            if ((socketId = listOfConnected[user.to]) && (io.sockets.connected[socketId])) {
                console.log('new notif sended to', user.to);
                io.sockets.connected[socketId].emit('newNotif', {state: true});
            }
        });

        socket.on('sendMessage', function (user) {
            if ((socketId = listOfConnected[user.to]) && (io.sockets.connected[socketId])) {
                console.log('new message sended to',user.to);
                io.sockets.connected[socketId].emit('newMessage', {state: true});
            }
        });
    });
};