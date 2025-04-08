const fs = require('fs');
const path = require('path');

function removeUnusedReactImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Remove standalone React imports
  let newContent = content.replace(/^import React from ['"]react['"];?\n?/gm, '');
  
  // Remove React from combined imports
  newContent = newContent.replace(/import React, /g, 'import ');
  
  // Remove React from destructured imports
  newContent = newContent.replace(/import { React,? /g, 'import { ');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      removeUnusedReactImports(fullPath);
    }
  }
}

// Start processing from src directory
processDirectory(path.join(__dirname, '../src')); 