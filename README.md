
# PromptFlow - ChatGPT Prompt Chaining Extension

A Chrome extension that adds prompt chaining functionality to ChatGPT.

## Features

- Create sequential prompt chains for ChatGPT
- Save and load chains from Chrome local storage
- Drag and drop interface for reordering prompts
- Run entire chains with a single click
- Clean sidebar UI that integrates with ChatGPT's interface

## Installation Instructions

### Loading the extension for testing:

1. Download and unzip the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the `src` folder from the unzipped files
5. The extension should now be installed and ready to use

## Usage

1. Go to [ChatGPT](https://chatgpt.com/)
2. Click on the "Create Chain" button that appears in the top-right corner
3. In the sidebar that appears:
   - Name your chain
   - Add prompts using the "Add Prompt" button
   - Reorder prompts using the up/down arrows or drag and drop
   - Save your chain with the "Save" button
   - Run the chain with the "Run Chain" button
4. The chain will execute each prompt in sequence and show the final result

## Building from Source

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Load the unpacked extension from the `dist` folder

## License

MIT
