// Find the HTML element that's the save button
saveButton = document.getElementById('saveBtn')

// Once the button is clicked, process the saving of the note
saveButton.addEventListener('click', function() {
    // Get the current active tab, save the note to this tabs url
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var currentUrl = tabs[0].url;
      var noteText = document.getElementById('noteArea').value;
      var timestamp = new Date().toISOString();
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
          alert("Note saved!");
          // Update the display
          loadNotes(currentUrl);
        });
      });
    });
  });
  

// Function to load and display notes for a given URL
function loadNotes(url) {
    // Access Chrome's local storage to get saved notes
    chrome.storage.local.get({notes: {}}, function(result) {
      // Retrieve notes for the current URL, or use an empty array if none exist
      var notes = result.notes[url] || [];
      // Get the HTML element where notes will be displayed
      var historyElement = document.getElementById('notesHistory');
      // Clear any existing content in the history element
      historyElement.innerHTML = '';
      // Loop through each note and create an HTML element to display it
      notes.forEach(function(note) {
        // Create a new 'div' element for each note
        var noteElement = document.createElement('div');

        // Add a CSS class to the element for styling (make sure to define this in your CSS file)
        noteElement.classList.add('note');
  
        // Set the text content of the note element to include both the timestamp and the note text
        noteElement.textContent = `${note.timestamp}: ${note.text}`;
  
        // Append the new note element to the history element in the popup
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
  