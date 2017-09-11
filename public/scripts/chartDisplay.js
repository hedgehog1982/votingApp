/*global google*/
/*global $*/
var chartData =[];
var chartKeys =[];
var chartTitle = "LOADING>>>>>";  //set these up while we wait for data
//const defaultArray = ["Selection", "People"];  //   <-- do i even need this header?


      google.charts.load('current', {'packages':['corechart']});  //for external google chart
      google.charts.setOnLoadCallback(drawChart);
      
      function removeForm(){
          console.log("removing form");
          $('#formcol').removeAttr("hidden");
          $("form").replaceWith("<h1> YOU HAVE VOTED ALREADY AND CAN NOT VOTE AGAIN <h1>");

         // window.alert("You have already have voted already!"); 
      }

      function drawChart() {
         var newArray =[]
        //newArray.push(defaultArray);

            for (var i=0 ; i < chartKeys.length; i++){
               newArray.push([chartKeys[i][0] ,(chartKeys[i][1])]);  //changed on back end so parseint no longer needed
             }

        var data = google.visualization.arrayToDataTable(newArray);
        var options = {title: chartTitle , sliceVisibilityThreshold:0};  //for the chart title and to ensure slices appear even if they have no votes
        var chart = new google.visualization.PieChart(document.getElementById('piechart'));
        chart.draw(data, options);
      }
      
      function addToSelect(){   //add chart options into chart
          $.each(chartKeys, function (i, item) {  //for all chart keys

                if (item[0] !== "Selection"){  //dont include the table headers
                    $('#dropD').append($('<option>', { 
                    value : item[0],
                    text : item[0]
                    }));
                }
        });
         $('#formcol').removeAttr("hidden");
          
          
      }
      
  $(document).ready(function() {   // right, im going to update the chart as we go. wont that be fancy......
  
              $('#formcol').removeClass("hidden").hide();
  
    var chartNumber = window.location.pathname.split("/chart/").pop();
    var getData = { "_id" : chartNumber };

    $.get("https://voting-app-waynewilliamson.c9users.io/data/chart/", getData, function( data ) {
            chartData = data[0];
            chartKeys = Object.keys(chartData.options).map(function (key){ //converyy object to arra
            return [key , chartData.options[key]];
            })
            chartTitle = chartData.title; // chartTitle is
            console.log(chartData.ip[0]);
            if (chartData.ip[0] !== "found") {
                    addToSelect();   // populate our dropdown box if the ip has not been used before
                } else {
                    removeForm();
                }
             drawChart();  //update chart
        });
        
    
        
    $( "#dropD" ).change(function() {
            console.log("this has fired ", this.value);
            console.log("chartdata is ",chartData.options[this.value])
            chartData.options[this.value] ++ //mutating the original data really shouldnt be done,,,,
            chartKeys = Object.keys(chartData.options).map(function (key){ // used this code twice > in a function probs best?
                    return [key , chartData.options[key]];
            })
            drawChart();
            chartData.options[this.value] --  //put it back to what it was for now

        });

     $("#submit").click(function(event) {   //data checking! is it valid? is it enough?
       event.preventDefault(); //needed to stop html button deafult i think
            console.log("Current dropdown is " ,$("#dropD").val() );

             $.post("/updateChart", { 
                 
                _id : chartData._id,
               // ip : chartData.ip.push(thisIp),  // what if someone else updates at a similiar time this break stuff....
               // chartKey :chartData.options
                selected : $("#dropD").val()
                    })
            // what i want to do next
            
                        //send id , what was selected and value +1 + ip
                        //remove dropdown
                        //extend chart
                        //marvel in the beauty of it all
            
     });
     

    
    
  });