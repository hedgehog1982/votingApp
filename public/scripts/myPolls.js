/*global $*/

  $(document).ready(function() {   //
   
       var getData = { "id" : "findME" };
       
       $.get("https://voting-app-waynewilliamson.c9users.io/data/chart/", getData, function( data ) {
           console.log(data);

        });
  
  
  
  
  
  });