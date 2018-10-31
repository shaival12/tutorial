// A2Z F16
// Daniel Shiffman
// http://shiffman.net/a2z
// https://github.com/shiffman/A2Z-F16


var loggedinUser;
// Get input from user
var gameId;
var gameName;
var selectedStory;
var users;
var cardset;

// Keep list of DOM elements for clearing later when reloading
var listItems = [];
//array
var storyIdArray = [];
var storyIdScoreArray = [];
var database;

function setup() {

   var config = {
    apiKey: "AIzaSyBmnNJ_4it3slyrWylGaRQbPlSdqlDFQtE",
    authDomain: "agilepoker-7ca04.firebaseapp.com",
    databaseURL: "https://agilepoker-7ca04.firebaseio.com",
    projectId: "agilepoker-7ca04",
    storageBucket: "agilepoker-7ca04.appspot.com",
    messagingSenderId: "340703685961"
  };
  
  firebase.initializeApp(config);
  database = firebase.database();
  
  // userName
  loggedinUser = getLoggedInUser();
  $("#admin").html("<b>"+loggedinUser+"</b>");
  //alert(loggedinUser);
  
   // based on find By Id
   gameId = getUrlVars()["g"];
   console.log(gameId);
   
   //store in localStorage
   if(gameId === undefined){
     gameId = localStorage.getItem("gameId");
   }else{
	  localStorage.setItem("gameId",gameId);
      gameId = localStorage.getItem("gameId");	  
   }
   //selectedStory
   selectedStory=getUrlVars()["s"];
    if(selectedStory === undefined){
     selectedStory = localStorage.getItem("selectedStory");
   }else{
	  localStorage.setItem("selectedStory",selectedStory);
      selectedStory = localStorage.getItem("selectedStory");	  
   }
   
   console.log("selectedStory : "+selectedStory);
   $("#selectedStory").html(selectedStory);
  

   //look in database
   var game = database.ref('games/'+ gameId)
   
   game.on('value', function(snapshot){
	   // console.log(snapshot.key);
	    //console.log(snapshot.val().name);
	   //console.log(snapshot.val().date);
	    gameName = snapshot.val().name;
	    $("#gameName").html(gameName);
		 
       users = snapshot.val().users;
	   
	   //admin = snapshot.val().admin;
	   //$("#admin").html(admin);
		
       cardset = snapshot.val().cardset;
	   console.log(snapshot.val().name);
	   //window.document.getElementById('gameName').innerHTML = gameName;
	 
	 
	  // populate CardStack
	   populateCardStack(cardset);
	   
	   
	   //resets
	   storyIdArray = [];
	   storyIdScoreArray =[];
	   
	   // loop thru to get Stories
	   var storyArray = snapshot.val().stories;
	
		//console.log(" --  storyArray length --"+storyArray.length);
		if(storyArray!=null && storyArray.length>0){
		  for(i=0;i<storyArray.length;i++){
			  //populate into the Array
			  if(storyArray[i].id === undefined){
			  //skip 
			  }else{
				  // only add valid values
				  if(selectedStory === undefined && i == 0 ){ // in case selectedStory is  undefined
					  selectedStory = storyArray[i].id; 
					  $("#selectedStory").html(selectedStory);
				  }
				  if( !storyIdArray.includes(storyArray[i].id)){
				     storyIdArray.push(storyArray[i].id);
					 storyIdScoreArray.push(storyArray[i].score);
				  }
			  }
		  }
		 }
		
		// Loop thru and populate Users for SelectedStory
		var storyUsers = game.child("story_users");
		//console.log("#####"+storyUsers);
		storyUsers.on('value', function(childSnapshot) {
        var storyArray = childSnapshot.val();
		console.log(storyArray);
		var newStoryUserArray = [];
		if(storyArray!=null && storyArray.length>0){
		  for(i=0;i<storyArray.length;i++){
			  //populate into the Array
			  if(storyArray[i].id === undefined){
			  //skip 
			  }else{
				  // if storyId matches
				  console.log(selectedStory);
				  if(selectedStory == storyArray[i].id){
					  newStoryUserArray.push(storyArray[i]);// add to the new Array
					
				  }
				  
			  }
		  }
		}
		
		//populate
		populatePlayContainer(newStoryUserArray);
		
        });
		
	
	
	
	   // populate
	   populateStoryList2();
	   
   }
   )
   
   //event handler
   var update = select('#addStory');
   update.mousePressed(addNewStoryFirebase);
   
   var flipcards = select('#flipcards');
   flipcards.mousePressed(flipcardsEvent);
   
   var closeModalButton = select('#closeModalButton');
    closeModalButton.mousePressed(closeModal);
	
	var resetLocalUserButton = select('#resetLocalUser');
	resetLocalUserButton.mousePressed(resetLocalUser);

	var storyScoreButton =  select('#storyScoreButton');
    storyScoreButton.mousePressed(updateStoryScore);
   
  // Submit button
  //var submit = select('#submit');
  //submit.mousePressed(sendToFirebase);
  
  // var update = select('#update');
  //update.mousePressed(updateToFirebase);
  
  // Start loading the data
  //loadFirebase();
}

function updateStoryScore(){
	
	var score = document.getElementById('storyScore').value ;
	//alert(score);
	var gameStories ;
	var game = database.ref('games/'+ gameId)
	   game.on('value', function(snapshot){
		   console.log(snapshot.val());
		   gameStories = snapshot.val().stories;
		  // snapshot.val().stories.push({ id: newStory.value(), score:"0"});
	   });
	   
	console.log(gameStories);
	var isExists = false;
	if(gameStories!=null && gameStories.length >0){
		for(var i=0;i<gameStories.length;i++){
			if(gameStories[i].id == selectedStory ){
			   gameStories[i].score = score;	
			   break;
			}
		}
	
		 
		  database.ref('games/'+ gameId).update({
			 stories:gameStories
		  });
	}   
	
}


function flipcardsEvent(){
	
	 $(".text-dark").toggle();
	 $(".text-danger").toggle();
	
}


//-----------------------
// point Story
//----------------
function pointSelectedStory(point){
	var user = getLoggedInUser();
	var id = '#'+user;
	var point = point;
	//alert(point);
	//alert(id);
	$(id).html(point);
	
	
   // add to database 	
    addStoryUserPoint(selectedStory,user,point );
	
	$(id).attr("class", "card-header bg-warning");
   
   //reload the page
   //location.reload();
}

function getTotalUsers(){
	
	var newUsers ; 
	var game = database.ref('games/'+ gameId)
	   game.on('value', function(snapshot){
		   newUsers = snapshot.val().users;
	   });
	  //alert(newUsers.length); 
	 
	 document.getElementById('totalPlayers').innerHTML = newUsers.length;
	 $('#totalPlayers').attr('title', newUsers.join(", "));
}


function addStoryUserPoint(storyId, user, point){
	//alert(storyId);alert(user);alert(point);
	
	var story_users ; 
	var game = database.ref('games/'+ gameId);
	 game.on('value', function(snapshot){
		   story_users = snapshot.val().story_users;
	   });
	
	console.log(story_users);
	var isExists = false;
	if(story_users!=null && story_users.length >0){
		for(var i=0;i<story_users.length;i++){
			if(story_users[i].name == user && story_users[i].id == storyId ){
			   story_users[i].point = point;	
			   isExists = true;
			}
		}
		if(!isExists){ // if duplicate exits
		   story_users.push({ id: storyId, name : user, point : point });
		}
		 
		  database.ref('games/'+ gameId).update({
			 story_users:story_users
		  });
	}
	 
     //$("#playerContainer" ).empty();
	 //$("#cardstack" ).empty();
	 
	//push to the  
	//story_users.push({ id: storyId, name : user, point : point });
	
	// update users List
	// database.ref('games/'+ gameId).update({
	//     story_users:story_users
	//  });
	  
	
	//location.reload();
	
}


function addRawUsers(newUser){
	
	var newUsers ; 
	var game = database.ref('games/'+ gameId)
	   game.on('value', function(snapshot){
		   console.log(snapshot.val());
		   newUsers = snapshot.val().users;
	   });
	   
	newUsers.push(newUser);
	
	// update users List
	 database.ref('games/'+ gameId).update({
	     users:newUsers
	  });
	  
	
	location.reload();
	
}

function addNewStoryFirebase(){
	
	 var newStory = select('#newStory');
	 //alert(newStory.value());
	 //alert(gameId); 
	 
	var gameStories ; 
	var game = database.ref('games/'+ gameId)
	   game.on('value', function(snapshot){
		   console.log(snapshot.val());
		   gameStories = snapshot.val().stories;
		  // snapshot.val().stories.push({ id: newStory.value(), score:"0"});
	   });
	   
	  console.log(gameStories);
	 
      gameStories.push({ id: newStory.value(), score:"0"});
	
	// update stories
	  database.ref('games/'+ gameId).update({
	     stories:gameStories
	  });
	  
	  return true;
	  
 }
 
//--------------
// storyList
//-------------
function populateStoryList2(){
   console.log("----storyID list--"+storyIdArray.length);	
	
   clearList();
   document.getElementById('storyList').innerHTML = "";	
   
   // Make an HTML list
   var html = [];
   html.push('<ul class="list-group " >');
  
   // Loop through array
   for (var i = 0; i < storyIdArray.length; i++) {
	   if(storyIdArray[i] == selectedStory){
		 html.push('<li class="list-group-item d-flex justify-content-between align-items-center bg-warning">');  
		}else{
		 html.push('<li class="list-group-item d-flex justify-content-between align-items-center">'); 
	   }
	    html.push('<a id="'+storyIdArray[i] +'" href="./play.html?g='+ gameId +'&s='+storyIdArray[i]+'" >'+ storyIdArray[i] +'</a>');
		html.push('<span class="badge badge-primary badge-pill">'+storyIdScoreArray[i]+'</span>');
		html.push('</li>');  
   }
   
   html.push('</ul>');
   
   // add to the DOm 
   document.getElementById('storyList').innerHTML = html.join("");
   
   
}

function populateStoryList(){
   console.log("----storyID list--"+storyIdArray.length);	
	
   clearList();
   document.getElementById('storyList').innerHTML = "";	
   
   // Make an HTML list
   var list = createElement('ol');
   list.parent('storyList');
  
   // Loop through array
   for (var i = 0; i < storyIdArray.length; i++) {
	   if(storyIdArray[i] == selectedStory){
		var li = createElement('li', '<a class="bg-warning" id="'+storyIdArray[i] +'" href="./play.html?g='+ gameId +'&s='+storyIdArray[i]+'" >'+ storyIdScoreArray[i] +'</a>');
		li.parent(list);
	   }else{
		 var li = createElement('li', '<a id="'+storyIdArray[i] +'" href="./play.html?g='+ gameId +'&s='+storyIdArray[i]+'" >'+ storyIdScoreArray[i] +'</a>');
		li.parent(list);  
	   }
   }
}

function clearList() {
  for (var i = 0; i < listItems.length; i++) {
    listItems[i].remove();
  }
}

//---------------------------------
// only with users of selected Story
//--------------------------------


function populatePlayContainer(storyUserArray){
	console.log("------ inside populatePlayContainer ----- "+storyUserArray.length);
	//console.log(users);
	
  document.getElementById('playerContainer').innerHTML = "";
   
  var html =[];	
  var htmlTemp = '<div class="card text-black border-primary mb-3" style="max-width: 10rem;margin-left:2%;">'+
                  '<div class="card-header" id="[name]"><center><span class="text-dark" style="display:none;">[i]</span><span class="text-danger">?</span></center></div>'+
                     '<div class="card-body">'+
                     '<p class="card-text">[name]</p>'+
                   '</div>'+
                 '</div>';
	 if(storyUserArray!=null && storyUserArray.length>0){		 
		for(var i=0; i <storyUserArray.length; i++){
           var storyUser =	 storyUserArray[i];
	       html.push(htmlTemp.replace("[i]",storyUser.point).replace("[name]",storyUser.name).replace("[name]",storyUser.name));
		}
	}
	
	//change dom
	document.getElementById('playerContainer').innerHTML = html.join("");
	
}
//------------
// cardStack
//------------
function populateCardStack(cardset){
	
	var cardsetArray = cardset.split(',');
	
	document.getElementById('cardstack').innerHTML = "";
	
	var htmlTemp ='<div class="flip-card"  onClick="pointSelectedStory(\'[i]\');">'+
		        '<div class="flip-card-inner">'+
			     '<div class="flip-card-front">[i] </div>'+
			     '<div class="flip-card-back">'+
					  '<h1>[i]</h1> '+
					'</div>'+
				  '</div>'+
				'</div>' ;
    var html =[];					
	for(i = 0; i < cardsetArray.length; i++) {
        html.push(htmlTemp.replace("[i]",cardsetArray[i]).replace("[i]",cardsetArray[i]).replace("[i]",cardsetArray[i]));
    }
   
	document.getElementById('cardstack').innerHTML =  html.join("");
	
	getTotalUsers();
	
}






function loadFirebase() {
  var ref = database.ref("games");
  ref.on("value", gotData, errData);
}

function errData(error) {
  console.log("Something went wrong.");
  console.log(error);
}

function getLoggedInUser(){
	
	// Check browser support
	if (typeof(Storage) !== "undefined") {
		// Store
		//localStorage.setItem("poker-user", "");
		if(!localStorage.getItem("poker-user")){
		    $('#myModal').modal('show');
		}else{
		  return localStorage.getItem("poker-user");
		}
	} else {
		alert("Sorry, your browser does not support Web Storage...");
	}
}

function closeModal(){
	localStorage.setItem('poker-user', document.getElementById('form3').value);
	addRawUsers(localStorage.getItem('poker-user'));
	$('#myModal').modal('hide');
	//alert(localStorage.getItem("poker-user"));
}

function resetLocalUser(){
	localStorage.setItem('poker-user', '');
}

function getSelectedStory(){
	localStorage.getItem("selectedStory");
}



// The data comes back as an object
function gotData(data) {
  var games = data.val();
  // Grab all the keys to iterate over the object
  var keys = Object.keys(games);

  // clear previous HTML list
  clearList();

  // Make an HTML list
  var list = createElement('ol');
  list.parent('data');

  // Loop through array
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var game = games[key];
    var li = createElement('li', game.name + ' : <a href="./play.html?g='+ key +'" >Play </a>');
    li.parent(list);
    listItems.push(li);
  }
}

// Clear everything
function clearList() {
  for (var i = 0; i < listItems.length; i++) {
    listItems[i].remove();
  }
}


function updateToFirebase(){
	 key = select('#key');
	 //alert(key.value());
	 database.ref('games/'+ key.value()).update({
	 name: gameName.value(),
	 users: users.value()
	 });
 }


// This is a function for sending data
function sendToFirebase() {
  var games = database.ref('games');

  // Make an object with data in it
  var data = {
    name: gameName.value(),
    date: date.value(),
	cardset : cardset.value(),
	admin: "scrummaster",
	stories:[{ id: "1111", score:"0", users:[{ name : "james", point : "5"}, { name : "radha", point : "23"}]  },
	{ id: "2222", score:"0", users:[{ name : "james", point : "3"}, { name : "radha", point : "9"}]  }
	
	]
  }
  
  var game = games.push(data, finished);
  console.log("Firebase generated key: " + game.key);

  // Reload the data for the page
  function finished(err) {
    if (err) {
      console.log("ooops, something went wrong.");
      console.log(err);
    } else {
      console.log('Data saved successfully');
    }
  }
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
