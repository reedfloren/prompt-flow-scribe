
// Listen for installation event
chrome.runtime.onInstalled.addListener(() => {
  console.log('PromptFlow extension installed');
  
  // Initialize default chains in storage
  chrome.storage.local.get('promptChains', (data) => {
    if (!data.promptChains) {
      chrome.storage.local.set({
        promptChains: [],
        activeChain: null
      });
    }
  });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getChains") {
    chrome.storage.local.get('promptChains', (data) => {
      sendResponse({ chains: data.promptChains || [] });
    });
    return true; // Required for async sendResponse
  }
  
  if (message.action === "saveChain") {
    chrome.storage.local.get('promptChains', (data) => {
      const chains = data.promptChains || [];
      const existingIndex = chains.findIndex(chain => chain.id === message.chain.id);
      
      if (existingIndex >= 0) {
        chains[existingIndex] = message.chain;
      } else {
        chains.push(message.chain);
      }
      
      chrome.storage.local.set({ promptChains: chains }, () => {
        sendResponse({ success: true, chains });
      });
    });
    return true;
  }
  
  if (message.action === "deleteChain") {
    chrome.storage.local.get('promptChains', (data) => {
      const chains = (data.promptChains || []).filter(chain => chain.id !== message.chainId);
      chrome.storage.local.set({ promptChains: chains }, () => {
        sendResponse({ success: true, chains });
      });
    });
    return true;
  }
});
