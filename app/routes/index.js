'use strict';  //

var path = process.cwd();
var mongoose = require('mongoose');

var Twitter = require("node-twitter-api"); //for twitter login

var homepage = "https://voting-app-waynewilliamson.c9users.io/";

var chartSchema = require('../models/users'); // import my mongoose schema

var bodyParser = require('body-parser'); // to get data from POST file

var logout = require('../my_modules/logout.js');  //first attempt at external module
var chartDB = require('../my_modules/chartDB.js');   //for database reads


module.exports = function(app) {
	
    var twitter = new Twitter({
        consumerKey: process.env.TWITKEY,
    	consumerSecret: process.env.TWITSECRET,
    	callback: process.env.TWITCALLBACK
    });

	var newrequestSecret;  // secret passsed back from twitter

	function displayIndex(req, res, next){  //not really needing this at mo
		        next();
	}
	
	function displayChart(req, res, next){
	    		chartSchema.find({}).sort('date').exec( function (err, allCharts) { // search for all charts and just dump it into console log for now (to be reversed and then passed intp pug for display)
                    if (err) return console.error(err);
                 res.render('index', {name : req.session.twitUser, charts : allCharts.reverse()});  //throwing an error until charts is populated.
                 next();
                });       
                	}
    app.use(bodyParser.json()); //to get data from POST file
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    })); 
    

	app.use(function(req, res, next){  //needed to have individual users.
            if (req.session.twitUser === undefined){  //if no stored session data
            req.session.twitUser = {"id": "" ,   //twitter id       
             "token": "",
            "username": "",   
             "displayName": ""
            };
            }
            next();
            });
	
	
	app.get('/', displayIndex,  displayChart);  //display index and read charts. while this is a small amount of data this will work fine... not so much after
		
	app.route('/newpolls')
		.get(function (req, res) {
		    if (req.session.twitUser.id.length !== 0) {  //can access unless logged in
		        res.render('chartInput', {name : req.session.twitUser} );  //send to be rendered bu pug

		    } else {
		        res.redirect(homepage);
		    }
		        
		});
	
	app.route('/mypolls')
		.get(function (req, res) {
		     if (req.session.twitUser.id.length !== 0) {
		        res.render('mypolls', {name : req.session.twitUser} );  //send to be rendered bu pug
		        
		        chartSchema.find({ date: "2017-09-03T10:26:58.000Z" }, function (err, allCharts) { // search for all charts and just dump it into console log for now
                if (err) return console.error(err);
                    console.log(allCharts);
                });
                
		     } else {
		        res.redirect(homepage);		         
		     }
		});

	app.route('/login')  //no longer needed - all handled in a pug file now
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});
	
    app.route('/logout')
    	.get(function (req, res) {
    	    logout.logout(req);  //logout function
		res.redirect(homepage); //redirect back to home page //going to refresh whole page though - more database reads?!
		});
		
	app.route("/makeChart")
	    .post(function(req, res, next) {
            console.log("recieved a post from front end to make new");  //how do I pass this in?!
            chartDB.makeOne(req, function (data) {
                res.send(data);
            }); //make a chart
        });
    
    app.route("/updateChart")  
        .post(function(req, res, next){
            chartDB.updateChart(req);
        });
        
     app.route("/removeone")  //check if user is correct before we remove? 
        	.post(function (req, res) {
        chartDB.removeOne(req.body);
		});
        
    app.route("/remove")  //temp so I can clear stuff
        	.get(function (req, res) {
        	    chartDB.removeALL(); //remove all of the DB's
		res.send("DELETED"); //redirect back to home page //going to refresh whole page though - more database reads?!
		});
		
		
    app.get('/auth/twitter/callback', function (req, res) {  //once its passed to twitter recieve callback with oauth_token and auth_verifier
            var oauth_token = (req.query.oauth_token);  //easier way? ()
            var oauth_verifier = req.query.oauth_verifier;
            
            twitter.getAccessToken(oauth_token, newrequestSecret, oauth_verifier, function(err, accessToken, accessSecret) {
            if (err)
                res.status(500).send(err);
            else
                twitter.verifyCredentials(accessToken, accessSecret, function(err, user) {
                    if (err)
                        res.status(500).send(err);
                    else
                        //console.log(user); //store the details we need
                        req.session.twitUser.id = user.id;
                        req.session.twitUser.token = accessToken;
                        req.session.twitUser.username =  user.screen_name;
                        req.session.twitUser.displayName= user.name;
                        console.log(req.session.twitUser);  //just so i can see the output for now
                        res.redirect(homepage); //redirect back to home page
                    });
            });
    });

    app.get("/auth/twitter", function(req, res) {  //requet a token and store
        twitter.getRequestToken(function(err, requestToken, requestSecret) {
            if (err)
                res.status(500).send(err);
            else {
                newrequestSecret = requestSecret;
                console.log(requestSecret);
                console.log(requestToken);
                res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken);
            }
        });
    });
    
   app.route("/data/chart")  //setup for generic searches now...  
        .get(function(req, res){  //proper read
        chartDB.findChart(req, function(error, data){  
            if (error){ 
                res.redirect("/error"); //redirect to an error page
            } else {
            console.log("recieved")
             res.send(data);
            }
        });

    });
    
    app.use("/chart", function(req, res, next){  // need a
         var searchTerm = {"_id" : req.path.split("/").pop()};
         chartSchema.find(searchTerm, function (err, allCharts){  // not using my function probably should
            if (err) {
                console.log("/ chart is an error") // Chart doesnt exist
                res.redirect("/error"); 
            } else if (allCharts[0] == undefined){  //
                console.log("/ chart has been removed", err) //chart existed but does no longer
                res.redirect("/error"); 
            } else {  //chart exists
                console.log("/ chart is not an error", allCharts[0]);
              res.render('chartDisplay', {name : req.session.twitUser}); 
            }
        })

    });
    
    app.use("/error", function(req, res, next){  // need an error page here
         console.log(req.path);
        res.render('error', {name : req.session.twitUser}); //display error
    });
         
};
