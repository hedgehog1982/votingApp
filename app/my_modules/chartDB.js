var chartSchema = require('../models/users'); // import my mongoose schema

function removeALL(){
    chartSchema.remove({}, function(err) { 
                     if (err) console.log("brokered");
                        console.log('collection removed'); 
                });
}

function removeOne(deleteId){
      console.log("I would like to delete", deleteId);
     chartSchema.remove({_id : deleteId._id}, function(err) { 
                     if (err) console.log("brokered");
                        console.log('collection removed'); 
                });
}



function makeOne (req, callback) {
            //var chartKeys ={"Selection" : "People"};   //Add headers here to stop the faff later
            var chartKeys = {}
            for (var i = 0; i <req.body.chartKey.length; i++){
                var currentKey = req.body.chartKey[i];
                chartKeys[currentKey] = 0;    //pass this as an integer so I dont have to swap it later
            }

             var newChart = new chartSchema() ;  //create our new chart
		            newChart.id = req.session.twitUser.id;  //who created it
                    newChart.date =  Date();                //when it was created
                    newChart.title = req.body.title;        //title of chart
                    newChart.options = chartKeys;           //data points
                    newChart.ip = ["0.0.0.0"]     ;                 //keep track of who has filled it in
                    newChart.save(function (err, data) { //save our new chart
						if (err) {
							console.log(err);
						}
                        return callback(data._id);
					});
				

}

function findChart (req, callback) {  // for get request
    var searchKey = Object.keys(req.query);
        var searchQuery = req.query[searchKey];
        if (searchQuery==="findME") { searchQuery= req.session.twitUser.id;  }  //if searching for own charts
        
        console.log("searching for ", searchKey, " with a value of ", searchQuery, " searching from ip ", req.headers['x-forwarded-for']);

            chartSchema.find({ [searchKey[0]]: searchQuery } ,"_id title options id ip", function (err, allCharts) { // TEMPORARY would like to use this for all....
                           if (err ) {
                              console.error("not Found");  //needs a proper error page that is not nice
                               return callback("not Found on Database");  //try to access chart that does not exist
                           } else if (allCharts[0] == null) {
                            console.log("no chart Found");
                            return callback("not Found on Database")
                           
                           } else {
                               console.log("recieved ", allCharts[0], " an error of ", err);
                           
                           if (allCharts[0].ip.indexOf(req.headers['x-forwarded-for']) === -1){
                               allCharts[0].ip = "Not found";
                           } else { allCharts[0].ip = "found"; }
                           
                         if (allCharts[0].id == req.session.twitUser.id){
                             console.log("it is the same user")
                             allCharts.push({"found" : true});
                         } else {
                              allCharts.push({"found" : false});
                         }
                         console.log("I am sending the following" , allCharts);
                        return callback (null, allCharts);  //sending name, options and _id twitter id
                           }
                            
                           
         });
}

function updateChart(req){  //if error?
    console.log("recieved update request");
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
                         if(err){console.log("Something wrong when updating data!", err ,doc);}
            });
            
            chartSchema.update(  //add ip (cant do this in one go as gets grumpy)
                {_id : req.body._id}, 
                    {$push : {
                            ip: [ipvalue]
                            }    
                    }
                    , function(err, doc){
                        if(err){ console.log("Something wrong when updating data!", err ,doc); }
            });
}

module.exports = {removeALL : removeALL, makeOne : makeOne, findChart : findChart, updateChart : updateChart, removeOne: removeOne};  //export removeALL and make one  function
