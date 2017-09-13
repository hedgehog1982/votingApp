/*global $*/

  function updateList(myList){
    $("#loading").replaceWith("<ul id='myPolls'></ul>");
      $('#myPolls').append( myList.join('') );
   // a(href= "https://voting-app-waynewilliamson.c9users.io/chart/" + val._id ) 
    //            li.list-group-item= val.title 
  }

function prepareList(data){
   var myList = [];
   for (var i = 0; i < data.length-1; i++){ //last part of array is found so dont use that
          myList.push('<li class="list-group-item mb-2"><a href="https://voting-app-waynewilliamson.c9users.io/chart/' + data[i]._id + '">' + data[i].title + '</a></li>');

   };  // close each()

    updateList(myList);
  
}

  $(document).ready(function() {   //
   
       var getData = { "id" : "findME" };
       
       $.get("https://voting-app-waynewilliamson.c9users.io/data/chart/", getData, function( data ) {
         prepareList(data);
           console.log(data);

        });
  
  
  
  
  
  });