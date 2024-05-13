/*
 * Registers event listeners for various button clicks and keypress events within the application.
 * This centralizes event management in the application, ensuring that all UI interactions are handled efficiently.
 */
function registerEventListeners() {
  // Event listener for saving note on Enter keypress within the note input area
  document.getElementById('noteArea').addEventListener('keypress', function(event) {
      // Check if the key pressed is the Enter key
      if (event.key === "Enter") {
          event.preventDefault(); // Prevent the default action to avoid form submission or any other unwanted behavior
          saveCurrentNote(); // Call the function to save the note
      }
  });

  // Event listener for clicking the save button
  document.getElementById('saveBtn').addEventListener('click', saveCurrentNote);

  // Event listener for managing clicks in the notes history section
  document.getElementById('notesHistory').addEventListener('click', handleHistoryClick);

  // Event listener for clearing all notes
  document.getElementById('clearAllBtn').addEventListener('click', clearAllNotes);

  // Event listeners for hover effects on notes in the history list
  document.getElementById('notesHistory').addEventListener('mouseover', handleNoteMouseOver);
  document.getElementById('notesHistory').addEventListener('mouseout', handleNoteMouseOut);
}

/* 
* Saves the note currently entered in the textarea to the local storage.
* This function captures the current tab's URL, the text in the textarea, and the current timestamp.
* It stores the note in Chrome's local storage associated with the URL.
*/
function saveCurrentNote() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var currentUrl = tabs[0].url;
      var noteText = document.getElementById('noteArea').value;
      var timestamp = new Date().toLocaleString();
      var note = { text: noteText, timestamp: timestamp };

      chrome.storage.local.get({notes: {}}, function(result) {
          var notes = result.notes;
          if (!notes[currentUrl]) {
              notes[currentUrl] = [];
          }
          /* unshift pushes to the top of the list instead of .push, which pushes to the bottom of the */
          notes[currentUrl].unshift(note);
          chrome.storage.local.set({notes: notes}, function() {
              document.getElementById('saveNotification').textContent = 'Note saved!';
              loadNotes(currentUrl);
              setTimeout(() => document.getElementById('saveNotification').textContent = '', 2000);
          });
      document.getElementById('noteArea').value = " ";
      });
  });
}

/*
* Loads notes from local storage for the current URL and displays them in the notes history section.
*/
function loadCurrentUrlNotes() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var currentUrl = tabs[0].url;
      loadNotes(currentUrl);
  });
}

/*
* Loads and displays notes for a given URL.
* @param {string} url - URL of the notes to load
*/
function loadNotes(url) {
  chrome.storage.local.get({ notes: {} }, function (result) {
      var notes = result.notes[url] || [];
      var historyElement = document.getElementById('notesHistory');
      historyElement.innerHTML = '';
      notes.forEach((note, index) => {
          var noteElement = document.createElement('div');
          noteElement.classList.add('note');
          /* Store timestamp as a data attribute */
          noteElement.dataset.timestamp = note.timestamp;
          /* This is what will actually be shown of the note */
          noteElement.innerHTML = `
              <button class="deleteBtn" data-url="${url}" data-index="${index}">Delete</button>
              <div class="note-content">${note.text}</div>`;
          historyElement.appendChild(noteElement);
      });
  });
}

/**
* Event handler for note mouse over event. 
* Shows a tooltip on hover.
*/
function handleNoteMouseOver(event) {
  var noteElement = event.target.closest('.note');
  if (noteElement) {
      var timestamp = noteElement.dataset.timestamp;
      var tooltip = document.createElement('div');
      tooltip.classList.add('tooltip');
      tooltip.textContent = timestamp;
      noteElement.appendChild(tooltip);
  }
}

/**
* Event handler for note mouse out event.
*/
function handleNoteMouseOut(event) {
  var noteElement = event.target.closest('.note');
  if (noteElement) {
      var tooltip = noteElement.querySelector('.tooltip');
      if (tooltip) {
          tooltip.remove();
      }
  }
}


/**
* Handles click events on the history element, specifically for deleting notes.
* @param {Event} event - The click event
*/
function handleHistoryClick(event) {
  const target = event.target;
  if (target.classList.contains('deleteBtn')) {
      const url = target.getAttribute('data-url');
      const index = parseInt(target.getAttribute('data-index'), 10);
      deleteNote(url, index);
  }
}

/**
* Deletes a specific note from the local storage.
* @param {string} url - URL of the note to delete
* @param {number} index - Index of the note to delete
*/
function deleteNote(url, index) {
  chrome.storage.local.get({notes: {}}, function(result) {
      var notes = result.notes[url];
      if (notes) {
          notes.splice(index, 1);
          chrome.storage.local.set({notes: result.notes}, function() {
              loadNotes(url);
          });
      }
  });
}

/**
* Clears all notes for the current URL.
*/
function clearAllNotes() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var currentUrl = tabs[0].url;
      chrome.storage.local.get({notes: {}}, function(result) {
          result.notes[currentUrl] = [];
          chrome.storage.local.set({notes: result.notes}, function() {
              loadNotes(currentUrl);
          });
      });
  });
}

/* Initialize the application when the window is loaded */
window.onload = function() {
  initializeNoteApp();
};

/**
* Sets up the note application by registering event listeners and loading initial notes.
*/
function initializeNoteApp() {
  registerEventListeners();
  loadCurrentUrlNotes();
}
