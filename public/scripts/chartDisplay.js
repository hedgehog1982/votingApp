/*global google*/
/*global $*/
var chartData =[];
var chartKeys =[];
var chartTitle = "LOADING>>>>>";  //set these up while we wait for data
const defaultArray = ["Selection", "People"];  //   <-- do i even need this header?


      google.charts.load('current', {'packages':['corechart']});  //for external google chart
      google.charts.setOnLoadCallback(drawChart);
      
      function addTitle(){
          $('#chartTitle').append("<h1 class='display-4'>"+ chartTitle + "<h1>")
      }
      
      function addRemove() {
          console.log("add remove button");
          $("#delete").append('<button id="delete" class="btn btn-block btn-danger">DELETE</button>');
          
      }
      
      function removeForm(){
          console.log("removing form");
          $('#formcol').removeAttr("hidden");
          $("#vote").replaceWith("<h3> YOU HAVE VOTED ALREADY AND CAN NOT VOTE AGAIN </h3>");
          $("form").hide();

         // window.alert("You have already have voted already!"); 
      }

      function drawChart() {
         var newArray =[]
        newArray.push(defaultArray);

            for (var i=0 ; i < chartKeys.length; i++){
               newArray.push([chartKeys[i][0] ,(chartKeys[i][1])]);  //changed on back end so parseint no longer needed
             }

        var data = google.visualization.arrayToDataTable(newArray);
        var options = {
            //title: chartTitle , 
            backgroundColor: {fill : '#FFF9E3' } ,
            'legend': {'position': 'bottom'},
            chartArea: {'width': '100%', 'height': '75%'},
            is3D: true,
            fontSize : "22",
            sliceVisibilityThreshold:0};  //for the chart title and to ensure slices appear even if they have no votes
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
        
         $("#dropD").append($('<option>', {value : "Custom", text : "Custom"}))  //add custom option to drop down 
         $('#formcol').removeAttr("hidden"); //show the hidden form
      }
      
  $(document).ready(function() {   // right, im going to update the chart as we go. wont that be fancy......
     
     $("#customT").hide();  //custom text hidden 
     $('#chartCol').hide();
  
    var chartNumber = window.location.pathname.split("/chart/").pop();
    var getData = { "_id" : chartNumber };

    $.get("https://voting-app-waynewilliamson.c9users.io/data/chart/", getData, function( data ) {
            chartData = data[0];
            chartKeys = Object.keys(chartData.options).map(function (key){ //converyy object to arra
            return [key , chartData.options[key]];
            })
            if (data[1].found === true) {
                 console.log("FOUND IT!");
                 addRemove();
             };

            chartTitle = chartData.title; // chartTitle is
            console.log("is found is ", data[1].found);
            if (chartData.ip[0] !== "found") {
                    addToSelect();   // populate our dropdown box if the ip has not been used before
                } else {
                    removeForm();  //while testing remove this
                    //addToSelect();  //while testing add this
                }
            addTitle();
             $("#chartCol").show();
             drawChart();  //update chart

             //$('#formcol').removeClass("hidden");
        });
        
    $( "#dropD" ).change(function() {
            if (this.value === "Custom"){  //dont need to add to chart for custom only when typing in text box
                //show text box
                $("#customT").show();
                console.log(chartData.options)
        
            } else {
               $("#customT").hide().val("");
                //hide text box and clear
            console.log("this has fired ", this.value);
            console.log("chartdata is ",chartData.options[this.value])
            chartData.options[this.value] ++ //mutating the original data really shouldnt be done,,,,
            chartKeys = Object.keys(chartData.options).map(function (key){ // used this code twice > in a function probs best?
                    return [key , chartData.options[key]];
            })
            drawChart();
            chartData.options[this.value] --  //put it back to what it was for now
            }
        });

     $("#submit").click(function(event) {   //data checking needed 
       event.preventDefault(); //needed to stop html button deafult i think
            console.log("Current dropdown is " ,$("#dropD").val() );
            
            var dropSelected = $("#dropD").val();
            if (dropSelected == "Custom") {dropSelected = $("#customT").val()} // if custom option entered

             $.post("/updateChart", { 
                _id : chartData._id,
                selected : dropSelected  
                    });
        window.location.reload();
         window.alert("Thank you for voting, Chart is now Updating ");
        //window.location.reload();
            
            
     });
     
     $("#delete").click(function(event){
         event.preventDefault();
         console.log("deleted");
         $.post("/removeone", { 
                _id : chartData._id
                    });
                    
        window.alert("The Chart has now been Deleted")
        window.location.replace("https://voting-app-waynewilliamson.c9users.io/");
                    
     });
     
    $('#customT').keyup(function(){  //if we type in custom box  
        //console.log("detected typing");
        var customKey = $("#customT").val() ;
       chartData.options[customKey] = 1;
       console.log("typing", chartData.options);
        chartKeys = Object.keys(chartData.options).map(function (key){ // used this code three times in a function probs best?
                    return [key , chartData.options[key]];
            });
       drawChart();
       delete chartData.options[customKey]; //remove the key once updated chart 
       });
  });