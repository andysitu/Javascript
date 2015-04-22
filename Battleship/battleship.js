/** Battle ship Game
*/

var controller = {
	numShips: 3,
	shipsLeft: 0,
	shipLength: 3,
	gridWidth: 7,
	gridHeight: 7,
	shipLoc: [],

	processGuess: function(guess) {
		console.log(this.shipLength);
	},

	generateShips: function() {
		var x, y, dirc, loc1, loc2, loc3, i = 0;
		var locations = [];

		for (var i = 0; i < 3; i++) {
			x = Math.floor(Math.random() * (this.gridWidth - this.shipLength + 2));
			y = Math.floor(Math.random() * (this.gridWidth - this.shipLength + 2));
			loc1 = x.toString() + y.toString();
			dir = Math.floor(Math.random() * 2);	
			console.log(x, y, loc1);

			if (dir == 0) {
				for (var j = 0; j < this.shipLength; j++) {
					this.shipLoc.push( (x + j) + "" + y);
				}
			} else {
				for (var j = 0; j < this.shipLength; j++) {
					this.shipLoc.push( x + "" + (y+ j) );
				}
			}

//			if (controller.shipLoc.indexOf(loc1) != -1 || controller.shipLoc.indexOf(loc2) != -1 || 
//				controller.shipLoc.indexOf(loc3) != -1) {
//				continue;
//			}

		}

		return this.shipLoc; 
	}
};


var ship

var test = {
	tester: function() {
	var where = document.getElementById("messageArea");
	where.innerHTML = "Hello";	
}

};

window.onload = controller.generateShips();