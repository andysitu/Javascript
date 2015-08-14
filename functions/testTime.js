/* To test for function run times.
 *
 * Make better notification than console.log
 * Need easier method to test for functions
 *
 */


function testTime(func, times) {
	var start = new Date().getTime();

	for (var i = 0; i <= times; i++) {
		func;
	}

	var end = new Date().getTime();

	console.log(end - start + " time for function");
}