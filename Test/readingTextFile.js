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

function loadFileEvent() {
  var fileToLoad = document.getElementById("fileToLoad").files[0];
  var fileReader = new FileReader();
  fileReader.onload = function(event) {
    var text = event.target.result;
    document.getElementById("inputText").value = text;
  }
  fileReader.readAsText(fileToLoad, "UTF-8");
}

window.onload = function() {
  var saveButton = document.getElementById("saveFile");
  saveButton.onclick = saveText;

  var loadFile = document.getElementById("loadFile");
  loadFile.onclick = loadFileEvent;

  var fileToLoad = document.getElementById("fileToLoad");
  fileToLoad.onchange = function(e) {
    console.log("You uploaded a file!", e.target.files[0]);
  }
};