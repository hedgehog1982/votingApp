/*global google*/
/*global $*/
var thisIp;
var chartData =[];
var chartKeys =[];
var chartTitle = "LOADING>>>>>";  //set these up while we wait for data
//const defaultArray = ["Selection", "People"];  //   <-- do i even need this header?


      google.charts.load('current', {'packages':['corechart']});  //for external google chart
      google.charts.setOnLoadCallback(drawChart);

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
          
          
      }
      
  $(document).ready(function() {   // right, im going to update the chart as we go. wont that be fancy......
  
    var chartNumber = window.location.pathname.split("/chart/").pop();
    
        $.getJSON("https://jsonip.com/?callback=?", function (data) {
        console.log(data);
        thisIp = data.ip;
         });
    
    $.get("https://voting-app-waynewilliamson.c9users.io/data/chart/" + chartNumber, function( data ) {
            chartData = data[0];
            chartKeys = Object.keys(chartData.options).map(function (key){ //converyy object to arra
            return [key , chartData.options[key]];
            })
            chartTitle = chartData.title; // chartTitle is
            addToSelect();  // opulate our dropdown box
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
       
       
            console.log("Current dropdown is " , $("#dropD").val());
            console.log("IP address is", thisIp);
            // what i want to do next
            
                        //send id , what was selected and value +1 + ip
                        //remove dropdown
                        //extend chart
                        //marvel in the beauty of it all
            
     });
     

    
    
  });