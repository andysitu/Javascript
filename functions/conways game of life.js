function nextGen(cells){
  // counts adjacent live cells
  function counter(arr, x, y) {
    var count = 0;
    var dir = [-1, 0, 1];

    for (var i = 0; i < dir.length; i++) {
      for (var j = 0; j < dir.length; j++) {
        if (x + dir[i] >= 0 && x + dir[i] < arr.length && y + dir[j] >= 0 && y + dir[j] < arr[x + dir[i]].length) {
          if (i != 1 || j != 1 ) {
           if (arr[x + dir[i]][y + dir[j]])
             count++;
          }
        }
      }
    }
    
    return count;
  }
  
  // Copy cell into cell1
    var cells1 = [];
    for (var i = 0; i < cells.length; i++)
        cells1.push([]);
  
  // replicates results onto cells 1
  for (var i = 0; i < cells.length; i++) {
    for (var j = 0; j < cells[i].length; j++) {
      if (cells[i][j]) {
        var count = counter(cells, i, j);
        
        if (count < 2) {
          cells1[i][j] = 0;
        } else if (count > 3) {
          cells1[i][j] = 0;
        } else {
          cells1[i][j] = 1;
        }
      } else {
        var count = counter(cells, i, j);
        
        if (count == 3)
          cells1[i][j] = 1;
        else
          cells1[i][j] = 0;
      }
    }
  }

  return cells1;
}

nextGen([[0,1,0],[0,1,0],[0,1,0]]);
nextGen()

http://www.codewars.com/kata/conways-game-of-life/train/javascript





function nextGen(cells) {
  var get = function (i, j) { return (cells[i] && cells[i][j]) | 0 };
  
  cells = cells.map(function (row, i) {
    return row.map(function (alive, j) {
      var neighbors =
        get(i-1, j-1) + get(i-1, j) + get(i-1, j+1) +
        get(i  , j-1)               + get(i  , j+1) +
        get(i+1, j-1) + get(i+1, j) + get(i+1, j+1);
        
      return (neighbors === 3 || (neighbors === 2 && alive)) | 0;
    });
  });
  
  return cells;
}