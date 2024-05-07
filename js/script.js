document.addEventListener("DOMContentLoaded", function() {
    const contentDiv = document.getElementById('content');

    // Function to load HTML content and initialize functionality
    function loadHTML(url, callback) {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (this.status === 200) {
                contentDiv.innerHTML = this.responseText;
                callback();  // Initialize functionality after content is loaded
            }
        };
        xhr.open("GET", url, true);
        xhr.send();
    }

    function initPopup() {
        const saveBtn = document.getElementById('saveBtn');
        const noteArea = document.getElementById('noteArea');
        const notesHistory = document.getElementById('notesHistory');

        saveBtn.addEventListener('click', function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                var currentUrl = tabs[0].url;
                var noteText = noteArea.value;
                var timestamp = new Date().toISOString();
                var note = { text: noteText, timestamp: timestamp };

                chrome.storage.local.get({notes: {}}, function(result) {
                    var notes = result.notes || {};
                    if (!notes[currentUrl]) {
                        notes[currentUrl] = [];
                    }
                    notes[currentUrl].push(note);
                    chrome.storage.local.set({notes: notes}, function() {
                        alert("Note saved!");
                        loadNotes(currentUrl); // Refresh the notes history
                    });
                });
            });
        });

        function loadNotes(url) {
            chrome.storage.local.get({notes: {}}, function(result) {
                var notes = result.notes[url] || [];
                notesHistory.innerHTML = '';
                notes.forEach(function(note) {
                    var noteElement = document.createElement('div');
                    noteElement.classList.add('note');
                    noteElement.textContent = `${note.timestamp}: ${note.text}`;
                    notesHistory.appendChild(noteElement);
                });
            });
        }

        // Load the saved notes for the current site when the popup opens
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var currentUrl = tabs[0].url;
            loadNotes(currentUrl);
        });
    }

    // Load the popup content and initialize
    loadHTML('html/popup.html', initPopup);
});
