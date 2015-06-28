Array.prototype.mapper = function(callback){
    var arr = [];
    
    for (var i = 0; i < this.length; i++)
        callback(this[i]);
        
    return arr;
};




var arr = [1, 2, 3];
Array.prototype.mapper = function(callback){
    for (var i = 0; i < this.length; i++)
        this[i] = callback(this[i]);
};

arr.mapper();
console.log(arr) // -> [2,4,6]