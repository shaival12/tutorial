// A2Z F16
// Daniel Shiffman
// http://shiffman.net/a2z
// https://github.com/shiffman/A2Z-F16

// Get input from user
var gameName;
var cardset;

// Keep list of DOM elements for clearing later when reloading
var listItems = [];
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

  // Input fields
  gameName = select('#gameName');

  // Submit button
  var submit = select('#submit');
  submit.mousePressed(sendToFirebase);
  
  // var update = select('#update');
  //update.mousePressed(updateToFirebase);

  // Start loading the data
  loadFirebase();
  
  document.getElementById('newGame').innerHTML = localStorage.getItem("newGame"); // newGame

}

function getRadioValue(){
	 var radioButtons = document.getElementsByName("cardset");
    for (var x = 0; x < radioButtons.length; x ++) {
		//alert(radioButtons[x].checked);
      if (radioButtons[x].checked) {
       //alert("You checked " + radioButtons[x].id);
       //alert("Value is " + radioButtons[x].value);
	   return radioButtons[x].value;
        }
     }
}

function loadFirebase() {
  var ref = database.ref("games");
  ref.on("value", gotData, errData);
}

function errData(error) {
  console.log("Something went wrong.");
  console.log(error);
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
	 name: gameName.value()
 });
}
 

// This is a function for sending data
function sendToFirebase() { 
  localStorage.setItem('poker-user','scrummaster'); // set to localStorage who creates the game 
 
  if(gameName.value()==="" || gameName.value()== null || gameName.value()=== "undefined"){
	   alert(" Enter a valid gameName.");
  }else{
	
	  var games = database.ref('games');
	  
	   cardset = getRadioValue();
	   //alert(cardset);

	  // Make an object with data in it
	  var data = {
		name: gameName.value(),
		cardset : cardset,
		admin: "scrummaster",
		users : ["scrummaster"],
		stories :[{ id: "RDP-1111", score:"0" }],
		story_users : [{ id: "RDP-1111", name : "scrummaster",  point:"0" }]
	  }
	  
	  var game = games.push(data, finished);
	  console.log("Firebase generated key: " + game.key);
	  localStorage.setItem("newGame", 'New game created '+ gameName.value() + ' : <a href="./play.html?g='+ game.key +'" >Play here .</a>');
	  
	  // Reload the data for the page
	  function finished(err) {
		if (err) {
		  console.log("ooops, something went wrong.");
		  console.log(err);
		} else {
			  //alert(localStorage.getItem("newGame"));
			
		  console.log('Data saved successfully');
		}
	  }
  
  } // else ends
}
