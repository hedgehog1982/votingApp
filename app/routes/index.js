'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var mongoose = require('mongoose');


var Twitter = require("node-twitter-api"); //for twitter login


var homepage = "https://voting-app-waynewilliamson.c9users.io/";

var chartSchema = require('../models/users'); // import my mongoose schema



module.exports = function(app) {
	
    var twitter = new Twitter({
        consumerKey: process.env.TWITKEY,
    	consumerSecret: process.env.TWITSECRET,
    	callback: process.env.TWITCALLBACK
    });
    

	var newrequestSecret;  // secret passsed back from twitter
	var clickHandler = new ClickHandler();
	
	function displayIndex(req, res, next){
	    		   console.log("should be 1st");

		        next();
	}
	
	function displayChart(req, res, next){
	                console.log(" shoud be second");
	    		chartSchema.find( function (err, allCharts) { // search for all charts and just dump it into console log for now (to be reversed and then passed intp pug for display)
                    if (err) return console.error(err);
                console.log(allCharts.reverse());
                 res.render('index', {name : req.session.twitUser, charts : allCharts.reverse()});
                 next();
                });       
                
	  
	}

	app.use(function(req, res, next){  //need to use r
            console.log("in this route" ,req.session.twitUser);
            if (req.session.twitUser === undefined){
            req.session.twitUser = {"id": "" ,   //twitter id       //for my user to be storeed
             "token": "",
            "username": "",   
             "displayName": ""
            };
            }
            next();
            });
	
	
	app.get('/', displayIndex,  displayChart);
	
	

		
	app.route('/newpolls')
		.get(function (req, res) {
		    if (req.session.twitUser.id.length !== 0) {
		        res.render('chartInput', {name : req.session.twitUser} );  //send to be rendered bu pug
		        // i need to get this out of this file!!!! its getting messy
		        /*
		        var newChart = new chartSchema() ;  //create our new chart
		            newChart.id = twitUser.id;
                    newChart.date =  Date();
                    newChart.title = "a lovely chart";
                    newChart.options = {"key1" : "keys!", "key2": "another KEY!"};
                    
                    
                    newChart.save(function (err) { //save our new chart
						if (err) {
							throw err;
						}
                        console.log("saved to DB");
					});
				*/
					
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
    	    req.session.twitUser = {"id": "" ,   //clear the details
             "token": "",
            "username": "",   
             "displayName": ""
            };
		res.redirect(homepage); //redirect back to home page //going to refresh whole page though - more database reads?!
		});
		
    app.route("/remove")  //temp so I can clear stuff
        	.get(function (req, res) {
                 chartSchema.remove({}, function(err) { 
                     if (err) console.log("brokered");
                        console.log('collection removed'); 
                });
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
                        console.log(user); //store the details we need
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
    
app.use("/chart", function(req, res, next){
      console.log(req.path);
      chartSchema.find({ _id: req.path.replace("/", "") }, function (err, allCharts) { // TEMPORARY 
                           if (err) {
                               res.send("not Found on Database");  //try to access chart that does not exist
                               return console.error("not Found");  //needs a proper error page that is not nice
                           }
        res.send(allCharts);  //else display a chart
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