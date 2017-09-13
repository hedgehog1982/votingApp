'use strict';  //messy messy file should not all be in here.....

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
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
	var clickHandler = new ClickHandler();
	
	function displayIndex(req, res, next){  //not really needing this at mo
		        next();
	}
	
	function displayChart(req, res, next){
	    		chartSchema.find( function (err, allCharts) { // search for all charts and just dump it into console log for now (to be reversed and then passed intp pug for display)
                    if (err) return console.error(err);
                console.log(allCharts.reverse());
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
		    if (req.session.twitUser.id.length !== 0) {
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

            /*var chartKeys ={"Selection" : "People"};   //Add headers here to stop the faff later
            
            for (var i = 0; i <req.body.chartKey.length; i++){
                var currentKey = req.body.chartKey[i];
                console.log(currentKey);
                chartKeys[currentKey] = 0;    //pass this as an integer so I dont have to swap it later
            }
            
            console.log("My Chart Keys are", chartKeys);
            
             var newChart = new chartSchema() ;  //create our new chart
		            newChart.id = req.session.twitUser.id;  //who created it
                    newChart.date =  Date();                //when it was created
                    newChart.title = req.body.title;        //title of chart
                    newChart.options = chartKeys;           //data points
                    newChart.ip = ["0.0.0.0"]     ;                 //keep track of who has filled it in
                    newChart.save(function (err, data) { //save our new chart
						if (err) {
							throw err;
						}
                        console.log("saved to DB", data._id);

					});
				*/	


        });
    
    app.route("/updateChart")  //check is logged in!
        .post(function(req, res, next){
            console.log("recieved update request")
            console.log(req.body);
            var updating =  "options." +req.body.selected ;
            var ipvalue = req.headers['x-forwarded-for'];  //store ip
            console.log("value to push is ", ipvalue);
            
                chartSchema.update(  //increment
                    {_id : req.body._id}, 
                        {$inc : {
                        [updating] : 1  //square brackets to use as variable
                                }
                        }
                        , function(err, doc){
                         if(err){
                        console.log("Something wrong when updating data!", err ,doc);

                         }
            //recieved for update
            })
            
                chartSchema.update(  //add ip (cant do this in one go as gets grumpy)
                    {_id : req.body._id}, 
                        {$push : {
                            ip: [ipvalue]
                         }    
                        }
                        , function(err, doc){
                         if(err){
                        console.log("Something wrong when updating data!", err ,doc);

                         }
            //recieved for update
            })
            
        });
		
    app.route("/remove")  //temp so I can clear stuff
        	.get(function (req, res) {
        	    chartDB.removeALL(); //remove all of the DB's
               /*  chartSchema.remove({}, function(err) { 
                     if (err) console.log("brokered");
                        console.log('collection removed'); 
                }); */
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
    
    app.route("/data/chart")  //setup for generic searches now...  // could add a section for which values i want back but opens up to messing
        .get(function(req, res){  //proper read
        chartDB.findChart(req, function(data , error){
            if (error){ res.send(error);}
            res.send(data);
            
        });
        
       /* var searchKey = Object.keys(req.query);
        var searchQuery = req.query[searchKey]
        if (searchQuery==="findME") { searchQuery= req.session.twitUser.id  ;};
        
        console.log("searching for ", searchKey, " with a value of ", searchQuery, " searching from ip ", req.headers['x-forwarded-for']);
        console.log(req.headers['x-forwarded-for'])
        
            chartSchema.find({ [searchKey[0]]: searchQuery } ,"_id title options id ip", function (err, allCharts) { // TEMPORARY would like to use this for all....
                           if (err) {
                               res.send("not Found on Database");  //try to access chart that does not exist
                               return console.error("not Found");  //needs a proper error page that is not nice
                           }
                           if (allCharts[0].ip.indexOf(req.headers['x-forwarded-for']) === -1){
                               allCharts[0].ip = "Not found";
                           } else { allCharts[0].ip = "found"; }
                          console.log("I am sending the following" , allCharts)
            res.send(allCharts);  //sending name, options and _id twitter id
         });*/
    });
    
    app.use("/chart", function(req, res, next){
         console.log(req.path);
        res.render('chartDisplay', {name : req.session.twitUser}); 
    });
         
};
