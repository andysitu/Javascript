function comboMaker(n, arr) {
  if (n === 1) {
    return arr;
  } else if (arr === undefined) {
    return comboMaker(n, [[0], [1]]);
  } else {
    var newArr = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      newArr.push(arr[i].concat(0));
      newArr.push(arr[i].concat(1));
    }

    return comboMaker(n-1, newArr);
  }
}

function comboMixer(arr) {
  var arrLength = arr.length,
      combo = comboMaker(arrLength);

  var i = 0, len = combo.length;
  for ( ; i < len; i++) {
    var newArr = [];
    for (var j = 0; j < arrLength; j++) {
      newArr.push(combo[i][j] * arr[j]);
    }
    combo[i] = newArr;
  }

  return combo;
}

function ArrayAddition(arr) {
  arr.sort(function(a,b){
    return a-b;
  });
  var max = arr[arr.length-1];

  arr.pop();

  var combo = comboMixer(arr),
      len = combo.length,
      arrLength = arr.length;

  for (var i = 0; i < len; i++) {
    var sum = combo[i].reduce(function(prev, val, i, arr){
      return prev + val;
    });
    if (sum == max) {
      return true;
    }
  }

  return false;
}


Doesn't work for many cases
function ArrayAddition(arr) { 
  arr.sort(function compareNumbers(a, b) {
    return b -a;
  });
  
  var sum = 0, max = arr[0];
  
  for (i = 1; i < arr.length; i++) {
    sum = arr[i];
    for (var j = 2; j < arr.length; j++) {
    sum += arr[j];
      if (sum > max) {
        j++;
        continue;
      }
      else if (sum == max)
        return true;
    }
  }
  return false;
         
}










function ArrayAddition(arr) { 
  var largest = arr.sort(function(a,b){return a-b}).pop();
  function rec(target,array){
    if(array.length === 0){
      return target === 0; 
    }
    var n = array[0];
    array = array.slice(1);
    return rec(target,array) || rec(target-n,array);
  }
  return rec(largest,arr);
}