/*global google*/
/*global $*/
    
      google.charts.load('current', {'packages':['corechart']});  //for external google chart
      google.charts.setOnLoadCallback(drawChart);

    function drawChart() {  //draw google chart
      
        var newArray = [["Selection", "People"]];  //putting in a header  //our header for charts
        var datavalues = $("#pieSections").val().split('\n').filter(function(entry) { //read in data ignore spac
            return entry.trim() != '';
            }).map(function(value){
            return value.trim();
            }
            );
            
        var uniqueItems = Array.from(new Set(datavalues)); // to stop duplicates, mongoose looks to remove these anyway but this stops us passing one value

        for (var i=0 ; i < uniqueItems.length; i++){
             newArray.push([uniqueItems[i] , 1]);  //push with a value of one to display the chart
        }
        var data = google.visualization.arrayToDataTable(newArray); // save the data to be passed to draw function

        var options = { title: $("#chartTitle").val() ,
                        backgroundColor: {fill : '#FFF9E3' } ,
            'legend': {'position': 'bottom'},
            chartArea: {'width': '100%', 'height': '75%'},
            is3D: true,
            fontSize : "22"
        };  //for the chart title
        
        var chart = new google.visualization.PieChart(document.getElementById('piechart'));

        chart.draw(data, options);
      }

      
  $(document).ready(function() {   // right, im going to update the chart as we go. wont that be fancy......

    $('#chartTitle').keyup(function(){  //update title
    (drawChart());  // if we type anything in the fields we update the pie chart!
    });
    
     $('#pieSections').keyup(function(){
       drawChart();
       });
   
     $("#submit").click(function(event) {   //data checking! is it valid? is it enough?
       event.preventDefault(); //needed to stop html button deafult i think
        var datavalues = $("#pieSections").val().split('\n').filter(function(entry) { 
            return entry.trim() != '';
        }).map(function(value){
            return value.trim();
            }
            );
        
        var uniqueItems = Array.from(new Set(datavalues)); // to stop duplicates

        console.log("data in text field is ", datavalues);
        
        if ($("#chartTitle").val().length === 0 ){  //this does not capture blank titles need regex! check we have data.
              console.log("length is ", datavalues.length);
              window.alert("No Chart Title Entered");  //swap this for bootstrap warning
              } else if (uniqueItems.length < 2) {
                window.alert("Not enough unique field Names Entered"); 
              } else {
                
                $.post("/makeChart", {
                    title : $("#chartTitle").val(),  //title pulled in through J Query
                    chartKey : uniqueItems           //object of 
                    }
              ).done(function( data ) {
                    window.location.replace("https://voting-app-waynewilliamson.c9users.io/chart/" + data);  //redirect to newly created chart
                });
              }
                
              
     });

    
    
  });