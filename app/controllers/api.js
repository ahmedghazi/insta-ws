var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  request = require('request'),
  async = require("async"),
  User = mongoose.model('User'),
  Media = mongoose.model('Media');

module.exports = function (app) {
  app.use('/api', router);
};

router.get('/:username', function (req, res, next) {
	User
	    .findOne({'username': req.params.username})
	    .populate({path: 'media'})
	    .exec(function(err, user) {
	        if (err) {
	            console.log(err)
	            return done(err);
	        }
	        /*console.log(post)
	        res.render('admin/posts/clients-view', {
	            title: 'Post',
	            post: client
	        });*/
	        if(!user){
	        	res.redirect('/api/c/'+req.params.username)
	        }else{
	        	return res.json(user);
	        }
	    
	});
});

router.get('/c/:username', function (req, res, next) {
	var url = 'https://www.instagram.com/'+req.params.username+"/media"
	request(url, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        var body = JSON.parse(body);
      
	        var user = new User(body.items[0].user)
	        user.save(function(err) {
	            if (err) {
	                return res.send(err);
	            }
	            var min_id = '';
	            async.each(body.items, function(item, callback){
	            	min_id = item.id;
	            	console.log(min_id)

            	    var query = { id: item.id };
            	    var update = {
	            		id: item.id,
	            		type: item.type,
		            	created_time: item.created_time,
		            	location: item.location.name,
		            	images: item.images,
		            	likes_count: item.likes.count,
		            	videos: item.videos,
		            	video_views: item.video_views,
	            	}

	            	Media.findOneAndUpdate(query, update, {upsert: true, 'new': true}, function (err, media, raw) {
	            	    if (err) {
	            	        return console.log(err);
	            	    } 
	            	    var _data = {$addToSet: {media: media }};
	            	    User.findOneAndUpdate({_id: user._id}, _data, {upsert: true, 'new': true}, function (err, _user, raw) {
	            	    	callback();
	            	    });
	            	});

	            }, function(__err){
	            	if(body.more_available){
	            		res.redirect('/api/c/'+user._id+"/"+req.params.username+"/"+min_id);
	            	}else{
	            		res.redirect('/api/'+req.params.username)
	            	}
	            });

	        });
	    }

	})
});

router.get('/c/:_id/:username/:min_id', function (req, res, next) {
	var url = 'https://www.instagram.com/'+req.params.username+"/media/?min_id="+req.params.min_id;
	request(url, function (error, response, body) {
		if (error) {
	        return res.send(error);
	    }
	    if (response.statusCode == 200) {
	    	var body = JSON.parse(body);
            var min_id = '';

            async.each(body.items, function(item, callback){
            	min_id = item.id;
            	console.log(min_id)
            	/*var media = new Media({
            		id: item.id,
            		type: item.type,
	            	created_time: item.created_time,
	            	location: item.location.name,
	            	images: item.images,
	            	likes_count: item.likes.count,
	            	videos: item.videos,
	            	video_views: item.video_views,
            	});
            	media.save(function(_err) {
            	    if (_err) {
            	        return res.send(_err);
            	    }
            	    
            	    var _data = {$addToSet: {media: media }};
            	    User.findOneAndUpdate({_id: req.params._id}, _data, {upsert: true, 'new': true}, function (err, _user, raw) {
            	    	callback();
            	    });
            	});*/
        	    var query = { id: item.id };
        	    var update = {
            		id: item.id,
            		type: item.type,
	            	created_time: item.created_time,
	            	location: item.location.name,
	            	images: item.images,
	            	likes_count: item.likes.count,
	            	videos: item.videos,
	            	video_views: item.video_views,
            	}

            	Media.findOneAndUpdate(query, update, {upsert: true, 'new': true}, function (err, media, raw) {
            	    if (err) {
            	        return console.log(err);
            	    } 
            	    var _data = {$addToSet: {media: media }};
            	    User.findOneAndUpdate({_id: req.params._id}, _data, {upsert: true, 'new': true}, function (err, _user, raw) {
            	    	callback();
            	    });
            	});

            }, function(__err){
            	if(body.more_available){
            		res.redirect('/api/c/'+req.params._id+"/"+req.params.username+"/"+min_id);
            	}else{
            		res.redirect('/api/'+req.params.username)
            	}
            });
	    }else{
	    	return res.send(response);
	    }
	});

});










