var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  request = require('request'),
  async = require("async"),
  User = mongoose.model('User'),
  Media = mongoose.model('Media'),
  postsPerPage = 10;

module.exports = function (app) {
  app.use('/api', router);
};

router.get('/g/:username/:page', function (req, res, next) {
	var skip = req.params.page * postsPerPage;
	User
	    .findOne({'username': req.params.username})
	    .populate({
	    	path: 'media',
	    	options:{
      			limit:postsPerPage,
      			skip:skip,
      			sort: {_id: 'asc'}
    		}
		})
	    .exec(function(err, user) {
	        if (err) {
	            console.log(err)
	            return done(err);
	        }
	     	console.log(user)
	     	if(!user)
	     		res.redirect('/api/c/'+req.params.username)
	     	else
	     		return res.send(user);
	     	/*
	        return res.render('page', {
	        	title: 'User',
	          	user: user
	        });
	    	*/
	});
});

router.get('/d/:username', function (req, res, next) {
	User.remove({
	    'username': req.params.username
	}, function(err, post) {
	    if (err) {
	      return res.send(err);
	    }

	    res.redirect('/api/');
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
	            var max_id = '';
	            async.each(body.items, function(item, callback){
	            	max_id = item.id;
	            	console.log(max_id)

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
	            		res.redirect('/api/i/'+user._id+"/"+req.params.username+"/"+max_id);
	            	}else{
	            		res.redirect('/api/g/'+req.params.username+"/0")
	            	}
	            });

	        });
	    }

	})
});

router.get('/i/:_id/:username/:max_id', function (req, res, next) {
	var url = 'https://www.instagram.com/'+req.params.username+"/media/?max_id="+req.params.max_id;
	request(url, function (error, response, body) {
		if (error) {
	        return res.send(error);
	    }
	    if (response.statusCode == 200) {
	    	var body = JSON.parse(body);
            var max_id = '';

            async.each(body.items, function(item, callback){
            	max_id = item.id;
            	console.log(max_id, item.location)
            	
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
            	    User.findOneAndUpdate({_id: req.params._id}, _data, {upsert: true, 'new': true}, function (err, _user, raw) {
            	    	callback();
            	    });
            	});

            }, function(__err){
            	if(body.more_available){
            		res.redirect('/api/i/'+req.params._id+"/"+req.params.username+"/"+max_id);
            	}else{
            		res.redirect('/api/g/'+req.params.username+"/0")
            		//res.redirect('/api/'+req.params.username)
            	}
            });
	    }else{
	    	return res.send(response);
	    }
	});

});


/*
router.get('/cron-start', function (req, res, next) {

	//var rand = require('randomstring');    
	jobId = rand.generate(10); //randomsrting  
	return schedule.scheduleJob(jobId, "10 * * * * *",function(){
	    //schedule.cancelJob(jobId);
	    console.log('hi--viral');
	    handleUsersMedia();
	 });
});

router.get('/cron-stop', function (req, res, next) {
	return schedule.cancelJob(jobId);
});
*/

/*function handleUsersMedia(){
	User
	    .find()
	    .populate({
	    	path: 'media',
	    	options:{
      			limit:postsPerPage,
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
    		            	console.log(max_id, item.location)
    		            	
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
    			    	return res.send(response);
    			    }
    			});
	    		//console.log(lastMedia);

	    		
	    	}, function(){
	    		console.log("done")
	    	});
	    	
	    	
	    });
}*/

router.get('/test', function (req, res, next) {
	console.log("test")
	User
	    .find()
	    .populate({
	    	path: 'media',
	    	options:{
      			limit:postsPerPage,
      			sort: {'_id': 'asc'}
    		}
		})
	    .exec(function(err, users) {
	    	if (err) {
	    	    console.log(err)
	    	    return done(err);
	    	}

	    	async.each(users, function(user, callback){
	    		console.log(user.media);
	    		var lastMedia = user.media[0].id;
	    		
	    		console.log(lastMedia);

	    		callback();
	    	}, function(){
	    		console.log("done")
	    	});
	    	
	    	
	    });
});

