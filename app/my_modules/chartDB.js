var chartSchema = require('../models/users'); // import my mongoose schema

function removeALL(){
    chartSchema.remove({}, function(err) { 
                     if (err) console.log("brokered");
                        console.log('collection removed'); 
                });
}

function makeOne (req, callback) {
            var chartKeys ={"Selection" : "People"};   //Add headers here to stop the faff later
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
							throw err;
						}
                        return callback(data._id);
					});

}

module.exports = {removeALL : removeALL, makeOne : makeOne};  //export removeALL and make one  function
//module.exports = {makeOne : makeOne};