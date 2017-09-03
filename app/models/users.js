'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	github: {
		id: String,
		displayName: String,
		username: String,
      publicRepos: Number
	},
   nbrClicks: {
      clicks: Number
   }
});

var chartSchema = mongoose.Schema({
    id: String,
    date : Date,
    title: String,
    options : Object
});

module.exports = mongoose.model('User', User);
module.exports = mongoose.model("chartSchema" , chartSchema);
