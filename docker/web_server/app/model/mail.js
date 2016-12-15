var nodemailer = require('nodemailer');

module.exports.resetPassword = function(data) {
        return new Promise(function(fullfil, reject) {
            var transporter = nodemailer.createTransport({
                host: '188.166.159.156',
                port: 4203,
                ignoreTLS: true
            });
            var mailOptions = {
                from: 'The matcha team',
                to: data.args.mail,
                subject: 'Reseting your password',
                text: 'Voici votre nouveau mot de passe pour matcha : ' + data.new_pass,
                html: 'Voici votre nouveau mot de passe pour matcha : <b>' + data.new_pass + ' !<b/>'
            };
            transporter.sendMail(mailOptions, function(error, info){
                transporter.close();
                fullfil(data);
            });
        })
    };

module.exports.welcome = function(data) {
    return new Promise(function(fullfil, reject) {
        var transporter = nodemailer.createTransport({
            host: '188.166.159.156',
            port: 4203,
            ignoreTLS: true
        });
        var mailOptions = {
            from: 'The matcha team',
            to: data.args.mail,
            subject: 'Welcome to matcha',
            text: 'Welcome to matcha '+data.args.pseudo+' !',
            html: 'Welcome to matcha <b>'+data.args.pseudo+' !<b/>'
        };
        transporter.sendMail(mailOptions, function(error, info){
            transporter.close();
            fullfil(data);
        });
    })
};