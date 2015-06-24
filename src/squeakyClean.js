function squeakyClean(arr) {
 
  for (var i = 0; i < arr.length; i++) {
    if (!arr[i]) {
      arr.splice(i++, 1);
    }
  }
  
  return arr;
}




function squeakyClean(arr) {
  return arr.filter(Boolean);
}

