'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');


var Twitter = require("node-twitter-api"); //for twitter login

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

//module.exports = function (app, passport) {

	var newrequestSecret;  // secret passsed back from twitter


	var clickHandler = new ClickHandler();

	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});
		
    app.get('/auth/twitter/callback', function (req, res) {  //once its passed to twitter recieve callback with oauth_token and auth_verifier
            console.log(req.originalUrl);
            console.log("does this work" + req.query.oauth_verifier) //yes it does!
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
                        //res.send(user);
                        twitUser.id = user.id;
                        twitUser.token = accessToken;
                        twitUser.Username =  user.screen_Name;
                        twitUser.displayName= user.name;
                        res.send(twitUser);
                        

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