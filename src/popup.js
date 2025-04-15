
// Initialize popup functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get button elements
  const createChainBtn = document.getElementById('createChain');
  const manageChainsBtn = document.getElementById('manageChains');
  
  // Event listener for Create Chain button
  createChainBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script to toggle sidebar
    chrome.tabs.sendMessage(tab.id, { action: "toggleSidebar" });
  });
  
  // Event listener for Manage Chains button
  manageChainsBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script to show chain management
    chrome.tabs.sendMessage(tab.id, { action: "showChainManager" });
  });
});
