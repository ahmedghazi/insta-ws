var request = require('request'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Media = mongoose.model('Media'),
    nodemailer = require("nodemailer"),
    async = require("async"),
    schedule = require('node-schedule'),
    rand = require('randomstring'),
    jobId;
//var WS = 'https://www.instagram.com';
 
exports.init = function() {
    return this;
};

exports.cronStop = function(next){
    return schedule.cancelJob(jobId);
};

exports.cronStart = function(next){
    jobId = rand.generate(10); //randomsrting  
    return schedule.scheduleJob(jobId, "00 00 23 * * *",function(){
        console.log('hi--viral');

        handleUsersMedia(next);
    });
};

function handleUsersMedia(next){
    User
        .find()
        .populate({
            path: 'media',
            options:{
                limit:10,
                sort: {_id: 'desc'}
            }
        })
        .exec(function(err, users) {
            if (err) {
                console.log(err)
                return done(err);
            }

            async.each(users, function(user, callback){
                //console.log(user.media);
                var lastMedia = user.media[0].id;
                if(!lastMedia)callback();

                var url = 'https://www.instagram.com/'+user.username+"/media/?min_id="+lastMedia;
                request(url, function (error, response, body) {
                    if (error) {
                        return res.send(error);
                    }
                    if (response.statusCode == 200) {
                        var body = JSON.parse(body);
                        var max_id = '';

                        async.each(body.items, function(item, callback2){
                            max_id = item.id;
                            console.log(max_id)
                            
                            var query = { id: item.id };
                            var update = {
                                id: item.id,
                                type: item.type,
                                created_time: item.created_time,
                                //location: item.location.name,
                                images: item.images,
                                likes_count: item.likes.count,
                                videos: item.videos,
                                video_views: item.video_views,
                            }
                            if(item.location)update.location = item.location.name;

                            Media.findOneAndUpdate(query, update, {upsert: true, 'new': true}, function (err, media, raw) {
                                if (err) {
                                    return console.log(err);
                                } 
                                var _data = {$addToSet: {media: media }};
                                User.findOneAndUpdate({_id: user._id}, _data, {upsert: true, 'new': true}, function (err, _user, raw) {
                                    callback2();
                                });
                            });

                        }, function(__err){
                            callback();
                        });
                    }else{
                        //return res.send(response);
                        callback()
                    }
                });
                
            }, function(){
                console.log("done")
                var mailOptions = {
                    to : "atmet.ghazi@gmail.com",
                    subject : "insta ws cron",
                    text : "Cron "+user.username+" on "+new Date()+" done"
                }
                sendEmail(mailOptions, function(mess){
                    next(new Date()+" done");
                });
                
                
            });
            
            
        });
}

function sendEmail(mailOptions, cb){
    var smtpTransport = nodemailer.createTransport('SMTP',{
        service: "Gmail",
        auth: {
            user: "atmet.ghazi",
            pass: "$vviirrggiill*"
        }
    });

    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            return cb("Message error: " + error)
        }else{
            console.log("Message sent: " + response.message);
            return cb("Message sent: " + response.message)
        }
    });
}