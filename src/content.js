// Content script - runs in the context of the ChatGPT page

// Create and inject the sidebar
function injectSidebar() {
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'promptflow-toggle';
  toggleButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
    </svg>
    Create Chain
  `;
  document.body.appendChild(toggleButton);
  
  // Create sidebar container
  const sidebarContainer = document.createElement('div');
  sidebarContainer.id = 'promptflow-sidebar';
  document.body.appendChild(sidebarContainer);
  
  // Load sidebar content
  loadSidebarContent();
  
  // Add event listener for toggle button
  toggleButton.addEventListener('click', () => {
    sidebarContainer.classList.toggle('visible');
    if (sidebarContainer.classList.contains('visible')) {
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        Close
      `;
    } else {
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
        </svg>
        Create Chain
      `;
    }
  });
}

// Load sidebar content
function loadSidebarContent() {
  const sidebar = document.getElementById('promptflow-sidebar');
  if (!sidebar) return;
  
  sidebar.innerHTML = `
    <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
      <h2 style="margin: 0; color: #10a37f; font-size: 20px; display: flex; align-items: center; gap: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
        </svg>
        PromptFlow
      </h2>
      <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Build and run prompt chains</p>
    </div>
    
    <div style="display: flex; padding: 16px; gap: 8px;">
      <select id="chain-selector" style="flex-grow: 1; padding: 8px; border-radius: 4px; border: 1px solid #d1d5db;">
        <option value="new">Create new chain</option>
        <!-- Existing chains will be loaded here -->
      </select>
      <button id="save-chain-btn" style="background-color: #10a37f; color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer;">
        Save
      </button>
    </div>
    
    <div style="padding: 0 16px 16px;">
      <input id="chain-name" type="text" placeholder="Chain Name" 
        style="width: 100%; padding: 8px; margin-bottom: 16px; border-radius: 4px; border: 1px solid #d1d5db;">
      
      <div id="prompts-container" style="margin-bottom: 16px;">
        <!-- Prompt items will be added here -->
      </div>
      
      <button id="add-prompt-btn" style="width: 100%; padding: 8px; margin-bottom: 16px; background-color: #f3f4f6; border: 1px dashed #d1d5db; border-radius: 4px; cursor: pointer; color: #6b7280;">
        + Add Prompt
      </button>
      
      <button id="run-chain-btn" style="width: 100%; padding: 12px; background-color: #10a37f; color: white; border: none; border-radius: 4px; font-weight: 500; cursor: pointer;">
        Run Chain
      </button>
    </div>
  `;
  
  // Initialize sidebar functionality
  initSidebar();
}

// Initialize sidebar functionality
function initSidebar() {
  const chainSelector = document.getElementById('chain-selector');
  const chainNameInput = document.getElementById('chain-name');
  const promptsContainer = document.getElementById('prompts-container');
  const addPromptBtn = document.getElementById('add-prompt-btn');
  const runChainBtn = document.getElementById('run-chain-btn');
  const saveChainBtn = document.getElementById('save-chain-btn');
  
  let currentChain = {
    id: generateId(),
    name: 'New Chain',
    prompts: []
  };
  
  // Load saved chains
  loadChains().then(chains => {
    // Populate chain selector
    chainSelector.innerHTML = '<option value="new">Create new chain</option>';
    chains.forEach(chain => {
      const option = document.createElement('option');
      option.value = chain.id;
      option.textContent = chain.name;
      chainSelector.appendChild(option);
    });
  });
  
  // Chain selector change event
  chainSelector.addEventListener('change', async () => {
    const selectedValue = chainSelector.value;
    
    if (selectedValue === 'new') {
      currentChain = {
        id: generateId(),
        name: 'New Chain',
        prompts: []
      };
      chainNameInput.value = currentChain.name;
      renderPrompts(currentChain.prompts);
    } else {
      const chains = await loadChains();
      const selectedChain = chains.find(chain => chain.id === selectedValue);
      if (selectedChain) {
        currentChain = selectedChain;
        chainNameInput.value = currentChain.name;
        renderPrompts(currentChain.prompts);
      }
    }
  });
  
  // Chain name input event
  chainNameInput.addEventListener('input', () => {
    currentChain.name = chainNameInput.value;
  });
  
  // Add prompt button event
  addPromptBtn.addEventListener('click', () => {
    currentChain.prompts.push({
      id: generateId(),
      text: '',
      order: currentChain.prompts.length
    });
    renderPrompts(currentChain.prompts);
  });
  
  // Save chain button event
  saveChainBtn.addEventListener('click', async () => {
    if (!currentChain.name.trim()) {
      alert('Please enter a chain name');
      return;
    }
    
    // Validate prompts
    const emptyPrompts = currentChain.prompts.some(prompt => !prompt.text.trim());
    if (emptyPrompts) {
      alert('Please fill in all prompts');
      return;
    }
    
    // Save chain
    await saveChain(currentChain);
    
    // Reload chains
    const chains = await loadChains();
    
    // Update chain selector
    chainSelector.innerHTML = '<option value="new">Create new chain</option>';
    chains.forEach(chain => {
      const option = document.createElement('option');
      option.value = chain.id;
      option.textContent = chain.name;
      chainSelector.appendChild(option);
    });
    
    // Select current chain
    chainSelector.value = currentChain.id;
    
    alert('Chain saved successfully');
  });
  
  // Run chain button event
  runChainBtn.addEventListener('click', async () => {
    // Validate prompts
    if (currentChain.prompts.length === 0) {
      alert('Please add at least one prompt');
      return;
    }
    
    const emptyPrompts = currentChain.prompts.some(prompt => !prompt.text.trim());
    if (emptyPrompts) {
      alert('Please fill in all prompts');
      return;
    }
    
    // Disable run button
    runChainBtn.disabled = true;
    runChainBtn.textContent = 'Running Chain...';
    
    try {
      await runPromptChain(currentChain.prompts);
    } catch (error) {
      console.error('Error running prompt chain:', error);
      alert('Error running prompt chain: ' + error.message);
    } finally {
      // Re-enable run button
      runChainBtn.disabled = false;
      runChainBtn.textContent = 'Run Chain';
    }
  });
  
  // Initial render of prompts
  renderPrompts(currentChain.prompts);
}

// Render prompts in the sidebar
function renderPrompts(prompts) {
  const promptsContainer = document.getElementById('prompts-container');
  if (!promptsContainer) return;
  
  // Clear container
  promptsContainer.innerHTML = '';
  
  // Add prompts
  prompts.forEach((prompt, index) => {
    const promptElement = document.createElement('div');
    promptElement.className = 'prompt-item';
    promptElement.dataset.id = prompt.id;
    promptElement.draggable = true;
    
    promptElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: 500; color: #374151;">Prompt ${index + 1}</span>
        <div style="display: flex; gap: 8px;">
          <button class="move-up-btn" ${index === 0 ? 'disabled' : ''} title="Move Up" style="background: none; border: none; cursor: pointer; color: #6b7280; padding: 0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </button>
          <button class="move-down-btn" ${index === prompts.length - 1 ? 'disabled' : ''} title="Move Down" style="background: none; border: none; cursor: pointer; color: #6b7280; padding: 0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          <button class="delete-prompt-btn" title="Delete" style="background: none; border: none; cursor: pointer; color: #ef4444; padding: 0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      <textarea class="prompt-textarea" placeholder="Enter your prompt here..." style="width: 100%; min-height: 80px; padding: 8px; border-radius: 4px; border: 1px solid #d1d5db; resize: vertical;">${prompt.text}</textarea>
    `;
    
    promptsContainer.appendChild(promptElement);
    
    // Textarea change event
    const textarea = promptElement.querySelector('.prompt-textarea');
    textarea.addEventListener('input', () => {
      const promptId = promptElement.dataset.id;
      const promptIndex = prompts.findIndex(p => p.id === promptId);
      if (promptIndex !== -1) {
        prompts[promptIndex].text = textarea.value;
      }
    });
    
    // Move up button event
    const moveUpBtn = promptElement.querySelector('.move-up-btn');
    moveUpBtn.addEventListener('click', () => {
      if (index > 0) {
        const temp = prompts[index];
        prompts[index] = prompts[index - 1];
        prompts[index - 1] = temp;
        
        // Update order
        prompts.forEach((p, i) => {
          p.order = i;
        });
        
        renderPrompts(prompts);
      }
    });
    
    // Move down button event
    const moveDownBtn = promptElement.querySelector('.move-down-btn');
    moveDownBtn.addEventListener('click', () => {
      if (index < prompts.length - 1) {
        const temp = prompts[index];
        prompts[index] = prompts[index + 1];
        prompts[index + 1] = temp;
        
        // Update order
        prompts.forEach((p, i) => {
          p.order = i;
        });
        
        renderPrompts(prompts);
      }
    });
    
    // Delete button event
    const deleteBtn = promptElement.querySelector('.delete-prompt-btn');
    deleteBtn.addEventListener('click', () => {
      prompts.splice(index, 1);
      
      // Update order
      prompts.forEach((p, i) => {
        p.order = i;
      });
      
      renderPrompts(prompts);
    });
    
    // Drag and drop functionality
    promptElement.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', prompt.id);
      promptElement.classList.add('prompt-dragging');
    });
    
    promptElement.addEventListener('dragend', () => {
      promptElement.classList.remove('prompt-dragging');
    });
    
    promptElement.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    
    promptElement.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      const draggedIndex = prompts.findIndex(p => p.id === draggedId);
      
      if (draggedIndex !== -1 && draggedIndex !== index) {
        // Reorder prompts
        const draggedPrompt = prompts[draggedIndex];
        prompts.splice(draggedIndex, 1);
        prompts.splice(index, 0, draggedPrompt);
        
        // Update order
        prompts.forEach((p, i) => {
          p.order = i;
        });
        
        renderPrompts(prompts);
      }
    });
  });
}

// Run a single prompt
async function runPrompt(prompt) {
  // Find the ChatGPT input textarea
  const textarea = document.querySelector('textarea[placeholder*="Message ChatGPT"]') || 
                   document.querySelector('textarea[placeholder*="Send a message"]') ||
                   document.querySelector('textarea');
  
  if (!textarea) {
    throw new Error('ChatGPT input field not found');
  }
  
  // Clear existing input
  textarea.value = '';
  
  // Set the prompt text
  textarea.value = prompt.text;
  
  // Need to trigger input event for ChatGPT to recognize the text
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Find the send button
  const sendButton = Array.from(document.querySelectorAll('button'))
    .find(button => {
      // Look for buttons that might be the send button
      const svg = button.querySelector('svg');
      const hasArrowIcon = svg && svg.innerHTML.includes('path');
      return hasArrowIcon || button.textContent.includes('Send');
    });
  
  if (!sendButton) {
    throw new Error('Send button not found');
  }
  
  // Make sure send button is enabled
  if (sendButton.disabled) {
    throw new Error('Send button is disabled. Cannot send prompt.');
  }
  
  // Click the send button
  sendButton.click();
  
  // Wait for the response to complete
  await waitForResponse();
}

// Wait for ChatGPT to finish responding
async function waitForResponse() {
  return new Promise((resolve) => {
    const checkInterval = 500; // Check every 500ms
    const maxWaitTime = 120000; // Maximum wait time of 2 minutes
    let elapsedTime = 0;
    
    // Function to check if ChatGPT is still generating a response
    const checkResponseStatus = () => {
      // Look for elements that indicate response generation is in progress
      const isGenerating = Boolean(
        document.querySelector('button[aria-label="Stop generating"]') ||
        document.querySelector('.text-2xl.animate-spin') ||
        document.querySelector('[data-state="generating"]') ||
        document.querySelector('.result-streaming')
      );
      
      if (isGenerating && elapsedTime < maxWaitTime) {
        // Still generating, check again after interval
        elapsedTime += checkInterval;
        setTimeout(checkResponseStatus, checkInterval);
      } else {
        // Either finished generating or timed out
        // Wait a bit more to ensure everything is loaded
        setTimeout(resolve, 1000);
      }
    };
    
    // Start checking
    setTimeout(checkResponseStatus, 1000);
  });
}

// Run the entire prompt chain
async function runPromptChain(prompts) {
  // Find the 'New chat' button or link
  const newChatButton = Array.from(document.querySelectorAll('a, button'))
    .find(el => {
      const text = el.textContent.toLowerCase();
      return text.includes('new chat') || text.includes('clear chat');
    });
  
  if (newChatButton) {
    newChatButton.click();
    // Wait for the new chat to load
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Run each prompt in sequence
  for (let i = 0; i < prompts.length; i++) {
    const promptElement = document.querySelector(`.prompt-item[data-id="${prompts[i].id}"]`);
    if (promptElement) {
      promptElement.classList.add('prompt-running');
    }
    
    await runPrompt(prompts[i]);
    
    if (promptElement) {
      promptElement.classList.remove('prompt-running');
    }
    
    // Add a short delay between prompts to ensure UI updates and proper flow
    if (i < prompts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// Generate a unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Load chains from storage
async function loadChains() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getChains' }, (response) => {
      resolve(response.chains || []);
    });
  });
}

// Save chain to storage
async function saveChain(chain) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'saveChain', chain }, (response) => {
      resolve(response);
    });
  });
}

// Delete chain from storage
async function deleteChain(chainId) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'deleteChain', chainId }, (response) => {
      resolve(response);
    });
  });
}

// Listen for messages from background script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleSidebar') {
    const sidebar = document.getElementById('promptflow-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('visible');
      
      // Update toggle button text
      const toggleButton = document.getElementById('promptflow-toggle');
      if (toggleButton) {
        if (sidebar.classList.contains('visible')) {
          toggleButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Close
          `;
        } else {
          toggleButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
            </svg>
            Create Chain
          `;
        }
      }
    }
  }
  
  if (message.action === 'showChainManager') {
    const sidebar = document.getElementById('promptflow-sidebar');
    if (sidebar && !sidebar.classList.contains('visible')) {
      sidebar.classList.add('visible');
      
      // Update toggle button text
      const toggleButton = document.getElementById('promptflow-toggle');
      if (toggleButton) {
        toggleButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Close
        `;
      }
    }
  }
});

// Initialize the extension when the page is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectSidebar);
} else {
  injectSidebar();
}
