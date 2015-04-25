/** Battle ship Game
*/

var controller = {
	numShips: 3,
	shipLength: 3,
	gridWidth: 7,
	gridHeight: 7,
	numOfShots: 0,
	numOfHits: 0,
	shipLoc: [ 	{ships: [0, 0, 0], hits: ["", "", ""]},
				{ships: [0, 0, 0], hits: ["", "", ""]},
				{ships: [0, 0, 0], hits: ["", "", ""]} ],

// Uses a do while loop where as long as collisions matches, it returns true
// and the loop keeps on running.
	generator: function() {
		var i = 0, arrTest;
		while (i < this.numShips) {
			do {
				arrTest = this.generateShip();
			} while (this.collisions(arrTest));
			this.shipLoc[i].ships = arrTest;
			i++;
		}

		return "";
	},

//Generates an array locations
	generateShip: function() {
		var x, y, dirc, loc1, loc2, loc3, i = 0;
		var locations = [];

		x = Math.floor(Math.random() * (this.gridWidth - this.shipLength + 2));
		y = Math.floor(Math.random() * (this.gridWidth - this.shipLength + 2));
		loc1 = x.toString() + y.toString();
		dir = Math.floor(Math.random() * 2);	

		if (dir == 0) {
			for (var j = 0; j < this.shipLength; j++) {
				locations.push( (x + j) + "" + y);
			}
		} else {
			for (var j = 0; j < this.shipLength; j++) {
				locations.push( x + "" + (y+ j) );
			}
		}

		return locations; 
	},

//Tests arr if it a location in controller.shipLoc already exists.
//Directly searches with indexOf of the object so don't let this be arr.
	collisions: function(arr) {
		for (var j = 0; j < this.numShips; j++) {
			var loc = this.shipLoc[j];
			for (var k = 0; k < this.shipLength; k++) {
				if (loc.ships.indexOf(arr[k]) >= 0)
					return true;
			}
		}

		return false;
	}
};

var message = {
	msg: function(message) {
		var msgArea = document.getElementById("messageArea");
		msgArea.innerHTML = message;
	},

	hit: function(location) {
		var loc = document.getElementById(location);
		loc.setAttribute("class", "hit");
	},

	miss: function(location) {
		var loc = document.getElementById(location);
		loc.setAttribute("class", "miss");
	}
};


function hitOrMiss(value) {
	var index;
	var shipObj = controller.shipLoc;
	for (var i = 0; i < controller.numShips; i++) {
		if ((index = shipObj[i].ships.indexOf(value)) >= 0) {
			if (shipObj[i].hits[index] == true) {
				message.msg("You have already hit this location!");
				return value;
			} else {
				message.msg("Hit!");
				message.hit(value);
				shipObj[i].hits[index] = true;
				controller.numOfHits++;
				controller.numOfShots++;
				if (controller.numOfHits === controller.numShips * controller.shipLength) {
					var accuracy = (controller.numOfHits / controller.numOfShots).toString();
					var accuracy = accuracy.substr(0, 5);
					message.msg("You've hit all the ships!\nYou Win!\nAccuracy: " + accuracy);
				}
				return value;
			}
		}
	}	

	message.msg("Miss!");
	controller.numOfShots++;
	message.miss(value);
	return false;
}

function converter(value) {
	var a, b;
	if (typeof value != "string") {
		message.msg("I need a string value!");
		return false;
	}
	else {
		var first = value.charAt(0).toUpperCase();
		switch (first) {
			case "A": a = "0"; break;
			case "B": a = "1"; break;
			case "C": a = "2"; break;
			case "D": a = "3"; break;
			case "E": a = "4"; break;
			case "F": a = "5"; break;
			case "G": a = "6"; break;
			default: break;
		}
		var b = value.charAt(1);
		hitOrMiss(a + "" + b);
	}
};

function onLoadFunction() {	
	var buttonLoc = document.getElementById("guessInput");
	var msgArea = document.getElementById("messageArea");
	var clickLoc = document.getElementById("fireButton");

	function uponClick() {
		converter(buttonLoc.value.toString());
		buttonLoc.value = "";
	};

	function ifEnter(key) {
		if (key.keyCode === 13) {
			clickLoc.click();
			return false;
		}
	}

	clickLoc.onclick =	uponClick;

	buttonLoc.onkeypress = ifEnter;

	controller.generator();
};

window.onload = onLoadFunction;