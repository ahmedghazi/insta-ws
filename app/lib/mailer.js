var nodemailer = require('nodemailer');
 
// Its not a good idea to provide your credentials like this, they should come from an external source. This is only for the demo.

var EMAIL_ACCOUNT_USER = 'developpeur.soixanteseize@gmail.com';
var EMAIL_ACCOUNT_USER = 'support@couriier.com';
var EMAIL_ACCOUNT_PASSWORD = 'Soixante16*'
var YOUR_NAME = 'Messenger Courrier';
//console.log(isLocal)
//reusable transport, look at the docs to see other service/protocol options
/*var smtpTransport = nodemailer.createTransport('SMTP',{
    service: 'Gmail',
    auth: {
        user: EMAIL_ACCOUNT_USER,
        pass: EMAIL_ACCOUNT_PASSWORD
    }
});*/


var smtpTransport = nodemailer.createTransport('SMTP',{
    host: 'smtp.mandrillapp.com',
    port: 587,
    secure: false, // use SSL
    auth: {
        user: 'COURIIER',
        pass: 'MDXjaCRd5IhYTXRNxO7Drw'
    }
});


// Public method that actually sends the email
exports.sendMail = function(toAddress, subject, content, next){
    var success = true;

    var mailOptions = {
        // NOTE: the fromAdress can actually be different than the email address you're sending it from. Which is good and bad I suppose. Use it wisely.
        from: YOUR_NAME + ' <' + EMAIL_ACCOUNT_USER + '>',
        to: toAddress,
        replyTo: EMAIL_ACCOUNT_USER,
        subject: subject,
        html: content
    };

    // send the email!
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log('[ERROR] Message NOT sent: ', error);
            success = false;
        }
        else {
            console.log(response);
            console.log('[INFO] Message Sent: ' + response.message);
        }
        
        next(error, success);
    });
};