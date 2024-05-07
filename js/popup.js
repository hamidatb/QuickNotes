document.getElementById('saveBtn').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var currentUrl = tabs[0].url;
      var noteText = document.getElementById('noteArea').value;
      var timestamp = new Date().toISOString();
      var note = { text: noteText, timestamp: timestamp };
  
      chrome.storage.local.get({notes: {}}, function(result) {
        var notes = result.notes;
        if (!notes[currentUrl]) {
          notes[currentUrl] = [];
        }
        notes[currentUrl].push(note);
        chrome.storage.local.set({notes: notes}, function() {
          alert("Note saved!");
          loadNotes(currentUrl);
        });
      });
    });
  });
  
  function loadNotes(url) {
    chrome.storage.local.get({notes: {}}, function(result) {
      var notes = result.notes[url] || [];
      var historyElement = document.getElementById('notesHistory');
      historyElement.innerHTML = '';
      notes.forEach(function(note) {
        var noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.textContent = `${note.timestamp}: ${note.text}`;
        historyElement.appendChild(noteElement);
      });
    });
  }
  
  window.onload = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var currentUrl = tabs[0].url;
      loadNotes(currentUrl);
    });
  };
  