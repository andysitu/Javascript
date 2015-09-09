var MOUNTAINS = [
  {name: "Kilimanjaro", height: 5895, country: "Tanzania"},
  {name: "Everest", height: 8848, country: "Nepal"},
  {name: "Mount Fuji", height: 3776, country: "Japan"},
  {name: "Mont Blanc", height: 4808, country: "Italy/France"},
  {name: "Vaalserberg", height: 323, country: "Netherlands"},
  {name: "Denali", height: 6168, country: "United States"},
  {name: "Popocatepetl", height: 5465, country: "Mexico"}
];

function repeat(string, times) {
  var result = "";
  for (var i = 0; i < times; i++)
    result += string;
  return result;
}

function TextCell(text) {
  return this.text = text.split("/n");
}
TextCell.prototype.minWidth = function() {
  return this.text.reduce(function(width, line) {
    return Math.max(width, line.length);
  }, 0);

TextCell.prototype.minHeight = function() {
  return this.text.length;
};
TextCell.prototype.draw = function(width, height) {
  var result = [];
  for (var i = 0; i < height; i++) {
    var line = this.text[i];
    result.push(line + repeat(" ", width - line.length));
  }
  return result;
}

function rowHeights(rows) {
  return rows.map(function(row) {
    return row.reduce(function(max, cell) {
      return Math.max(max, cell.minHeight());
    }, 0)
  });
}

function colWidth(rows) {
  return rows[0].map(function(_, i) {
    return rows.reduce(function(max, row) {
      return Math.max(max, row[i].minWidth());
    }, 0)
  });
}

function drawTable(rows) {
  var heights = rowHeights(rows);
  var widths = colWidth(rows);

  function drawLine(blocks, lineNo) {
    return blocks.map(function(block){
      return block[lineNo];
    }).join(" ");
  }

  function drawRow(row, rowNum) {
    var blocks = row.map(function(cell, col) {
      return cell.draw(widths[col], heights[rowNum]);
    });

    return blocks[0].map(function(_, lineNo) {
      return drawLine(blocks,, lineNo);
    }).join('\n');
  }

  return rows.map(drawRow).join('\n');
}

function UnderlinedCell(inner) {
  this.inner = inner;
}
UnderlinedCell.prototype.minWidth = function() {
  return this.inner.mindWidth();
};
UnderlinedCell.prototype.minHeight = function() {
  return this.inner.minHeight() + 1;
}
UnderlinedCell.prototype.draw = function(width, height){
  return this.inner.draw(width, height - 1).
    concat(repeat("-", width));
};

function dataTable(data) {
  var keys = Object.keys(data[0]);
  var headers = keys.map(function(name) {
    return new UnderlinedCell(new TextCell(name));
  });
  var body = data.map(function(row) {
    return keys.map(function(name) {
      return new TextCell(String(row[name]));
    });
  });
  return [headers].concat(body);
}