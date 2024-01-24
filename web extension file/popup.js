let showMarkings = true;
let toggleButton = document.getElementById('toggleButton');
const searchMethodDropdown = document.getElementById('searchMethod');

let searchMethod = 'Regex'; // default value

toggleButton.addEventListener('click', () => {
  showMarkings = !showMarkings;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: 'toggle', showMarkings: showMarkings});
  });
  
  if (showMarkings) {
    toggleButton.textContent = "Hide Markings";
    toggleButton.classList.remove('show');
    toggleButton.classList.add('hide');
  } else {
    toggleButton.textContent = "Show Markings";
    toggleButton.classList.remove('hide');
    toggleButton.classList.add('show');
  }
});

function toggleButtonClick(){
  showMarkings = !showMarkings;
  if (showMarkings) {
    toggleButton.textContent = "Hide Markings";
    toggleButton.classList.remove('show');
    toggleButton.classList.add('hide');
  } else {
    toggleButton.textContent = "Show Markings";
    toggleButton.classList.remove('hide');
    toggleButton.classList.add('show');
  }
}



searchMethodDropdown.addEventListener('change', () => {
  const selectedMethod = searchMethodDropdown.value;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: 'changeMethod', searchMethod: selectedMethod});
  });
  toggleButton.click();

});


// To update the dark pattern count
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {type: 'getCount'}, function(response) {
    if(response.darkPatternCount>0){
      document.getElementById('patternCount').textContent = `Dark Patterns Detected!`;
    } else {
      document.getElementById('patternCount').textContent = 'No Dark Patterns Detected';
    }
  });
});
