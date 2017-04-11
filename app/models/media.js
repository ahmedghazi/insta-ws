// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var MediaSchema = new Schema({
	id: String,
	type: String,
	created_time: Date,
	location: String,
	images: Object,
	likes_count: String,
	videos: Object,
	video_views: String
});

MediaSchema.virtual('date')
  .get(function(){
    return this._id.getTimestamp();
  });

mongoose.model('Media', MediaSchema);

