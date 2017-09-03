'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');


var Twitter = require("node-twitter-api"); //for twitter login

var cookie = require('cookie');

var http = require('http');
var url = require('url');
var homepage = "https://voting-app-waynewilliamson.c9users.io/";

var chartSchema = require('../models/chartSchema'); // import my mongoose schema



module.exports = function(app) {
	
    var twitter = new Twitter({
        consumerKey: process.env.TWITKEY,
    	consumerSecret: process.env.TWITSECRET,
    	callback: process.env.TWITCALLBACK
    });
    
    var twitUser = {"id": "" ,   //twitter id       //for my user to be storeed
             "token": "",
            "username": "",   
             "displayName": ""
            };

	var newrequestSecret;  // secret passsed back from twitter
	var clickHandler = new ClickHandler();

	app.route('/')
		.get(function (req, res) {
		        res.render('index', {name : twitUser} );  //send to be rendered bu pug
		});
		
	app.route('/newpolls')
		.get(function (req, res) {
		    if (twitUser.id.length !== 0) {
		        res.render('newpolls', {name : twitUser} );  //send to be rendered bu pug
		        // i need to get this out of this file!!!! its getting messy
		        var newChart = new chartSchema() ;
		            newChart.id = twitUser.id;
                    newChart.date =  Date();
                    newChart.title = "a lovely chart";
                    newChart.options = {"key1" : "keys!"};
                    
                    
                    	newChart.save(function (err) {
						if (err) {
							throw err;
						}
                        console.log("saved to DB");
					});

		        
		        
		        
		    } else {
		        res.redirect(homepage);
		    }
		        
		});
	
	app.route('/mypolls')
		.get(function (req, res) {
		     if (twitUser.id.length !== 0) {
		        res.render('mypolls', {name : twitUser} );  //send to be rendered bu pug
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
    	    twitUser = {"id": "" ,   //clear the details
             "token": "",
            "username": "",   
             "displayName": ""
            };
		res.redirect(homepage); //redirect back to home page //going to refresh whole page though - more database reads?!
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
                        console.log(user); //store the details we need
                        twitUser.id = user.id;
                        twitUser.token = accessToken;
                        twitUser.username =  user.screen_name;
                        twitUser.displayName= user.name;
                        console.log(twitUser);  //just so i can see the output for now
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



//	app.route('/auth/github')
//		.get(passport.authenticate('github'));
//
//	app.route('/auth/github/callback')
//		.get(passport.authenticate('github', {
//			successRedirect: '/',
//			failureRedirect: '/login'
//		}));
//

};

//};