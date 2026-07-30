document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('character-select');

  // CHARACTERS and DEFAULT_CHARACTER come from config.js
  CHARACTERS.forEach((char) => {
    const option = document.createElement('option');
    option.value = char.id;
    option.textContent = char.name;
    select.appendChild(option);
  });

  chrome.storage.sync.get(['selectedCharacter'], (result) => {
    select.value = result.selectedCharacter || DEFAULT_CHARACTER;
  });

  select.addEventListener('change', () => {
    chrome.storage.sync.set({ selectedCharacter: select.value });
  });
});
