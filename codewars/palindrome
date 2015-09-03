function isPalindrome(str) {
    // Without global search, it'll consider only the first case, which might be the newline?
  var newStr = str.replace(/[\W\s]*/gi, "").toUpperCase();
  
  function recur(str1) {
      if (str1.length <= 1)
        return true;
      else  if (str1.charAt(0) != str1.charAt(str1.length -1)) {
        return false;
      }
      else {
        return recur(str1.slice(1, str1.length - 1));
      }
  }
  
  
  return recur(newStr);
}

isPalindrome("race car");







function isPalindrome(str){
  // Processing and then returning with comma operator
  return str ? (str = norm(str), str == reverse(str)) : false;
}
function norm(str){ return str.replace(/[^\w]/g, '').toLowerCase() }
// Reverses the string
function reverse(str){ return str.split('').reverse().join('') }


function isPalindrome(str) {
  if(str==null) return false;
  str = str.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return str.split('').reverse().join('')== str;
}


function isPalindrome(str) {
  if (str == null) return false
  
  var s = str.toLowerCase().replace(/[^a-z0-9]/g, '')
  var n = s.length
  
  for (var i = 0; i < s.length; i++) {
    if (s[i] !== s[n - i - 1]) return false
  }
  
  return true
}