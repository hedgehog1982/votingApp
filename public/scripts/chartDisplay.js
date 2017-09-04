/*global google*/
/*global $*/
    
      google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
      
        var newArray = [["Selection", "People"]];  //putting in a header
        console.log("NEW aRRAY IS ", newArray);

        var datavalues = $("#pieSections").val().split('\n');
                console.log("data values is ", datavalues);
    
        for (var i=0 ; i < datavalues.length; i++){
             newArray.push([datavalues[i] , 1]);
        }
        
        
        console.log(datavalues);

        var data = google.visualization.arrayToDataTable(newArray);

        var options = {
          title: $("#chartTitle").val()
        };
        
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
    if ($("#chartTitle").val().length === 0  ){
              var datavalues = $("#pieSections").val().split('\n').filter("");
      console.log("lenght is ", datavalues.length);
      window.alert("No Chart Title Entered");
    }
     });

    
    
  });