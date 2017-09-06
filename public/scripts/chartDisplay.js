/*global google*/
/*global $*/
    
      google.charts.load('current', {'packages':['corechart']});  //for external google chart
      google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
      
        var newArray = [["Selection", "People"]];  //putting in a header  //our header for charts
       var datavalues = $("#pieSections").val().split('\n').filter(function(entry) { //read in data ignore spaces
            return entry.trim() != '';
            });
      
        for (var i=0 ; i < datavalues.length; i++){
             newArray.push([datavalues[i] , 1]);  //push with a value of one to display the chart
        }
      
        var data = google.visualization.arrayToDataTable(newArray); // save the data to be passed to draw function

        var options = { title: $("#chartTitle").val() };  //for the chart title
        
        var chart = new google.visualization.PieChart(document.getElementById('piechart'));

        chart.draw(data, options);
      }

      
  $(document).ready(function() {   // right, im going to update the chart as we go. wont that be fancy......

    $('#chartTitle').keyup(function(){
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
        
        if ($("#chartTitle").val().length === 0  ){  //this does not capture blank titles need regex!
              console.log("lentht is ", datavalues.length);
              window.alert("No Chart Title Entered");  //swap this for bootstrap warning
              } else if (datavalues.length < 2) {
                window.alert("Not enough field Names Entered"); 
              } else {
                                  window.alert("Passed the right variables..  would submit to database if it was set up"); 
              }
     });

    
    
  });