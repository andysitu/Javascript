function saveText() {
  var inputText = document.getElementById("inputText").value;
  var textAsBlob = new Blob([inputText], {type:'text/plain'});
  var fileName = document.getElementById("fileName").value;

  var downloadLink = document.createElement("a");
  downloadLink.download = fileName;
  downloadLink.innerHTML = "Download File";
  downloadLink.href = window.URL.createObjectURL(textAsBlob);

  document.body.appendChild(downloadLink);
  downloadLink.onclick = function(event) {
    document.body.removeChild(event.target);
  };
}


window.onload = function() {
  var saveButton = document.getElementById("saveFile");
  saveButton.onclick = saveText;
};