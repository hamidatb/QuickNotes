document.getElementById('saveBtn').addEventListener('click', function() {
    var noteText = document.getElementById('noteArea').value;
    chrome.storage.local.set({ "savedNote": noteText }, function() {
      alert("Note saved!");
    });
  });
  
  // Load the saved note when the popup opens
  window.onload = function() {
    chrome.storage.local.get("savedNote", function(items) {
      if (items.savedNote) {
        document.getElementById('noteArea').value = items.savedNote;
      }
    });
  };
  