// Find the HTML element that's the save button
saveButton = document.getElementById('saveBtn')

// Once the button is clicked, process the saving of the note
saveButton.addEventListener('click', function() {
    // Get the current active tab, save the note to this tabs url
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var currentUrl = tabs[0].url;
      var noteText = document.getElementById('noteArea').value;
      var timestamp = new Date().toLocaleString(); // This gives me a human readble timestamp
      var note = { text: noteText, timestamp: timestamp };
  
      // Save the note in Chromes local storage
      chrome.storage.local.get({notes: {}}, function(result) {
        var notes = result.notes;
        // If the current url doesn't have any previous notes, initialize a note stack
        if (!notes[currentUrl]) {
          notes[currentUrl] = [];
        }
        // Push the current note onto the url's history
        notes[currentUrl].push(note);
        // Save the updated notes into Chrome's history
        chrome.storage.local.set({notes: notes}, function() {
          document.getElementById('saveNotification').textContent = 'Note saved!'; // Update notification
          loadNotes(currentUrl);

          // Clear notification after a short delay
          setTimeout(function() {
              document.getElementById('saveNotification').textContent = '';
          }, 2000); // Clears the notification after 2 seconds
        });
      });
    });
  });
  

// Load and display notes with delete buttons
function loadNotes(url) {
  chrome.storage.local.get({notes: {}}, function(result) {
      var notes = result.notes[url] || [];
      var historyElement = document.getElementById('notesHistory');
      historyElement.innerHTML = '';

      notes.forEach(function(note, index) {
          var noteElement = document.createElement('div');
          noteElement.classList.add('note');
          noteElement.innerHTML = `
              <button class="deleteBtn" data-url="${url}" data-index="${index}">Delete</button>
              <div id="Datetime">${note.timestamp}</div>
              <div>-${note.text}</div>`;
          historyElement.appendChild(noteElement);
      });
  });
}

// Listen for click events on the history element
document.getElementById('notesHistory').addEventListener('click', function(event) {
  const target = event.target;
  if (target.classList.contains('deleteBtn')) {
      const url = target.getAttribute('data-url');
      const index = parseInt(target.getAttribute('data-index'), 10);
      deleteNote(url, index);
  }
});

// Function to delete a specific note
function deleteNote(url, index) {
  chrome.storage.local.get({notes: {}}, function(result) {
      var notes = result.notes[url];
      if (notes) {
          notes.splice(index, 1); // Remove the note at the specified index
          chrome.storage.local.set({notes: result.notes}, function() {
              loadNotes(url); // Reload notes to update the display
          });
      }
  });
}

// Function to clear all notes for a URL
document.getElementById('clearAllBtn').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var currentUrl = tabs[0].url;
      chrome.storage.local.get({notes: {}}, function(result) {
          result.notes[currentUrl] = []; // Clear all notes for the current URL
          chrome.storage.local.set({notes: result.notes}, function() {
              loadNotes(currentUrl); // Reload notes to update the display
          });
      });
  });
});
  

window.onload = function() {
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var currentUrl = tabs[0].url;
    loadNotes(currentUrl);
});
};
  