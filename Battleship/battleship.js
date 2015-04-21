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


		while (i < 3) {
			console.log("2");
			x = Math.floor(Math.random() * (controller.gridWidth - controller.shipLength + 1));
			y = Math.floor(Math.random() * (controller.gridWidth - controller.shipLength + 1));
			loc1 = x.toString() + y.toString();
			console.log(dir = Math.floor(Math.random() * 2));	
			console.log(x, y, loc1);

			if (dir == 0) {
				loc2 = (x+1) * 10 + y;
				loc3 = (x+2) * 10 + y;
				loc2 = loc2.toString();
				loc3 = loc3.toString();
			} else {
				loc2 = x * 10 + (y+1);
				loc3 = x * 10 + (y+2);
				loc2 = loc2.toString();
				loc3 = loc3.toString();
			}

			console.log(loc1, loc2, loc3);

			if (controller.shipLoc.indexOf(loc1) != -1 || controller.shipLoc.indexOf(loc2) != -1 || 
				controller.shipLoc.indexOf(loc3) != -1) {
				continue;
			}
			controller.shipLoc.push(loc1); 
			controller.shipLoc.push(loc2);
			controller.shipLoc.push(loc3);
			i++;
		} 
	}
};


var ship

var test = {
	tester: function() {
	var where = document.getElementById("messageArea");
	where.innerHTML = "Hello";	
}

};

window.onload = controller.generateShips;