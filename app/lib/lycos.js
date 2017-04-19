var request = require('request');
var WS = 'https://www.instagram.com/';
 
exports.init = function() {
    return this;
};

exports.geocode = function(adress, next){
    geocoder.geocode(adress, function(err, result) {
        console.log(adress)
        return next(null,result);
    });
};



exports.getPageByMaxId = function(user, max_id, next){
    var url = WS+"/"+user+"/media/?max_id="+max_id;
    //request(url, function (error, response, body) {

    var options = { 
        method: 'GET',
        url: url,
        //json: true,
        headers: 
        { 
            'cache-control': 'no-cache',
            //apikey: 'b01230eb32d2e6341acbb55e8ea3fca7',
            'content-type': 'multipart/form-data;'
        },
        formData: formData
    };

    console.log(options)
    
    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(response.statusCode);
        var body = JSON.parse(body);
        //console.log(body);
        //return next(body)
    });
}