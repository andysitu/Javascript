var _; //globals

describe("About Applying What We Have Learnt", function() {

  var products;

  beforeEach(function () {
    products = [
       { name: "Sonoma", ingredients: ["artichoke", "sundried tomatoes", "mushrooms"], containsNuts: false },
       { name: "Pizza Primavera", ingredients: ["roma", "sundried tomatoes", "goats cheese", "rosemary"], containsNuts: false },
       { name: "South Of The Border", ingredients: ["black beans", "jalapenos", "mushrooms"], containsNuts: false },
       { name: "Blue Moon", ingredients: ["blue cheese", "garlic", "walnuts"], containsNuts: true },
       { name: "Taste Of Athens", ingredients: ["spinach", "kalamata olives", "sesame seeds"], containsNuts: true }
    ];
  });

  /*********************************************************************************/

  it("given I'm allergic to nuts and hate mushrooms, it should find a pizza I can eat (imperative)", function () {

    var i,j,hasMushrooms, productsICanEat = [];

    for (i = 0; i < products.length; i+=1) {
        if (products[i].containsNuts === false) {
            hasMushrooms = false;
            for (j = 0; j < products[i].ingredients.length; j+=1) {
               if (products[i].ingredients[j] === "mushrooms") {
                  hasMushrooms = true;
               }
            }
            if (!hasMushrooms) productsICanEat.push(products[i]);
        }
    }

    expect(productsICanEat.length).toBe(1);
  });

  it("given I'm allergic to nuts and hate mushrooms, it should find a pizza I can eat (functional)", function () {

      var productsICanEat = [];

      /* solve using filter() & all() / any() */
      productsICanEat = _.filter(products, function(obj){ 
        if (!obj.containsNuts && 
            (_.every(obj.ingredients, function(obj){
                return (obj !== "mushrooms");}))
          ) return obj.name;} );

      expect(productsICanEat.length).toBe(1);
  });

  /*********************************************************************************/

  it("should add all the natural numbers below 1000 that are multiples of 3 or 5 (imperative)", function () {

    var sum = 0;
    for(var i=1; i<1000; i+=1) {
      if (i % 3 === 0 || i % 5 === 0) {
        sum += i;
      }
    }

    expect(sum).toBe(233168);
  });

  it("should add all the natural numbers below 1000 that are multiples of 3 or 5 (functional)", function () {

    var sum1 = _.reduce(_.range(1000),function(a,b)
      {if (b % 3 === 0 || b % 5 === 0) {
        return a+b;
      } else {
        return a;
      }
      });


    /* try chaining range() and reduce() */


    expect(233168).toBe(sum1);
  });

  /*********************************************************************************/
   it("should count the ingredient occurrence (imperative)", function () {
    var ingredientCount = { "{ingredient name}": 0 };

    for (i = 0; i < products.length; i+=1) {
        for (j = 0; j < products[i].ingredients.length; j+=1) {
            ingredientCount[products[i].ingredients[j]] = (ingredientCount[products[i].ingredients[j]] || 0) + 1;
        }
    }
    expect(ingredientCount['mushrooms']).toBe(2);
  });

  it("should count the ingredient occurrence (functional)", function () {
    var ingredientCount = { "{ingredient name}": 0 };
 //   ingredientCount["mushrooms"] = 1;
 //   ingredientCount["mushrooms"]++;
 //   console.log(ingredientCount["mushrooms"]) // -> 2
    /* chain() together map(), flatten() and reduce() */  

/* WITHOUT MEMO
    var arr = {}, arr1 = [], var1 = {};
    arr = _.map(products, function(value, key, list) {return value.ingredients;});
    arr1 = _.flatten(arr)
    console.log(arr1);
    console.log(arr);
    _.reduce(arr1, function(a,b){if (ingredientCount[b]) ingredientCount[b]++;
      else ingredientCount[b] = 1;
    }, ingredientCount);

    console.log(var1);
    console.log(ingredientCount); 
*/

  _(products).chain().map(function(value, key, list) {return value.ingredients;})
        .flatten()
        .reduce(function(memo,b){
          console.log(b);
          if (typeof memo[b] === "undefined") {
            memo[b]=1;
          } else {
            memo[b]++;
          }
          return memo;
       }, ingredientCount);
    
    console.log(ingredientCount); 

    expect(ingredientCount["mushrooms"]).toBe(2);
  });

  /*********************************************************************************/
  /* UNCOMMENT FOR EXTRA CREDIT */
  /*
  it("should find the largest prime factor of a composite number", function () {

  });

  it("should find the largest palindrome made from the product of two 3 digit numbers", function () {

  });

  it("should find the smallest number divisible by each of the numbers 1 to 20", function () {


  });

  it("should find the difference between the sum of the squares and the square of the sums", function () {

  });

  it("should find the 10001st prime", function () {

  });
  */
});
