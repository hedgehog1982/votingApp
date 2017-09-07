/*global google*/
/*global $*/
var chartData =[];
var chartKeys =[];
var chartTitle = "LOADING>>>>>"  //set these up while we wait for data
const defaultArray = ["Selection", "People"];  //   <-- do i even need this header?


      google.charts.load('current', {'packages':['corechart']});  //for external google chart
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
         var newArray =[]
        newArray.push(defaultArray);

            for (var i=0 ; i < chartKeys.length; i++){
               newArray.push([chartKeys[i][0] ,parseInt(chartKeys[i][1])]);  //need to pass as numbers or it gets grumpy
             }
            
          
          
        var data = google.visualization.arrayToDataTable(newArray);
        var options = {title: chartTitle , sliceVisibilityThreshold:0};  //for the chart title and to ensure slices appear even if they have no votes
        var chart = new google.visualization.PieChart(document.getElementById('piechart'));
        chart.draw(data, options);
      }
      
      function addToSelect(){   //add chart options into chart
          $.each(chartKeys, function (i, item) {  //for all chart keys
             $('#dropD').append($('<option>', { 
                value : item[0],
                text : item[0]
             }));
        });
          
          
      }
      
  $(document).ready(function() {   // right, im going to update the chart as we go. wont that be fancy......
  
    var chartNumber = window.location.pathname.split("/chart/").pop();
    
    $.get("https://voting-app-waynewilliamson.c9users.io/data/chart/" + chartNumber, function( data ) {
            chartData = data[0];
            chartKeys = Object.keys(chartData.options).map(function (key){ //converyy object to arra
            return [key , chartData.options[key]];
            })
            //console.log("chart keys are ", chartKeys);
            chartTitle = chartData.title;
            

             
         addToSelect();
         drawChart();
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




    

    /*$('#chartTitle').keyup(function(){
    (drawChart());  // if we type anything in the fields we update the pie chart!
    });
    
     $('#pieSections').keyup(function(){
       drawChart();
       });
   
     $("#submit").click(function(event) {   //data checking! is it valid? is it enough?
       event.preventDefault(); //needed to stop html button deafult i think
        var datavalues = $("#pieSections").val().split('\n').filter(function(entry) { 
            return entry.trim() != '';
            });
            ; //read in from text area
        console.log("data in text field is ", datavalues)
        
        if ($("#chartTitle").val().length === 0 ){  //this does not capture blank titles need regex! check we have data.
              console.log("length is ", datavalues.length);
              window.alert("No Chart Title Entered");  //swap this for bootstrap warning
              } else if (datavalues.length < 2) {
                window.alert("Not enough field Names Entered"); 
              } else {
                console.log("posting");
                
                $.post("/makeChart", {
                    title : $("#chartTitle").val(),  //title pulled in through J Query
                    chartKey : datavalues            //object of 
                    }
                    
                    
              );
              }
                
              
     });
     */

    
    
  });