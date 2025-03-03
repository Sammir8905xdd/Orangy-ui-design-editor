// Orangy - Interactive UI Editor for XML-based Animations and UI Design
// Main application script

// Global state
const state = {
  assets: [], // Stores all assets (images, spritesheets, audio)
  animations: [], // Stores all animations detected from XML data
  canvasElements: [], // Stores all elements on the canvas
  selectedElement: null, // Currently selected element
  animationsPlaying: false, // Whether animations are currently playing
  undoStack: [], // For undo functionality
  redoStack: [], // For redo functionality
  currentTool: 'move', // Current active tool
  timeline: {
    expanded: false,
    layers: [],
    currentTime: 0,
    playing: false,
    duration: 5000 // Default timeline duration in ms
  },
  audio: {
    backgroundMusic: null,
    volume: 0.5,
    playing: false
  },
  canvasSize: {
    width: 800,
    height: 600
  },
  exportOptions: {
    currentTab: 'html',
    previewDevice: 'desktop'
  },
  project: {
    name: 'Untitled Project',
    modified: false
  },
  transformOptions: {
    proportionalScaling: true // New option for proportional scaling
  },
  templates: {
    selected: null,
    list: [
      {
        id: 'default',
        name: 'Empty Canvas',
        thumbnail: '',
        elements: []
      },
      {
        id: 'basic-menu',
        name: 'Basic Menu',
        thumbnail: '',
        elements: [
          // Pre-configured menu elements
        ]
      },
      {
        id: 'game-ui',
        name: 'Game UI',
        thumbnail: '',
        elements: [
          // Pre-configured game UI elements
        ]
      }
    ]
  }
};

// DOM Elements
const domElements = {
  canvas: document.getElementById('canvas'),
  assetLibrary: document.querySelector('#assetLibrary'),
  animationsList: document.querySelector('#animationsList'),
  fileInput: document.getElementById('fileInput'),
  imageFileInput: document.getElementById('imageFileInput'),
  audioFileInput: document.getElementById('audioFileInput'),
  projectFileInput: document.getElementById('projectFileInput'),
  spritesheetUpload: document.getElementById('spritesheetUpload'),
  imageUpload: document.getElementById('imageUpload'),
  audioUpload: document.getElementById('audioUpload'),
  propertiesPanel: document.getElementById('propertiesPanel'),
  elementProperties: document.getElementById('elementProperties'),
  noSelectionInfo: document.getElementById('noSelectionInfo'),
  timeline: document.getElementById('timeline'),
  expandTimelineBtn: document.getElementById('expandTimelineBtn'),
  exportModal: document.getElementById('exportModal'),
  previewModal: document.getElementById('previewModal'),
  previewContainer: document.getElementById('previewContainer'),
  exportZipBtn: document.getElementById('exportZipBtn'),
  exportJsonBtn: document.getElementById('exportJsonBtn'),
  copyCodeBtn: document.getElementById('copyCodeBtn'),
  exportCode: document.getElementById('exportCode'),
  newProjectBtn: document.getElementById('newProjectBtn'),
  openProjectBtn: document.getElementById('openProjectBtn'),
  saveProjectBtn: document.getElementById('saveProjectBtn'),
  exportBtn: document.getElementById('exportBtn'),
  moveToolBtn: document.getElementById('moveToolBtn'),
  selectToolBtn: document.getElementById('selectToolBtn'),
  rotateToolBtn: document.getElementById('rotateToolBtn'),
  undoBtn: document.getElementById('undoBtn'),
  redoBtn: document.getElementById('redoBtn'),
  alignLeftBtn: document.getElementById('alignLeftBtn'),
  alignCenterBtn: document.getElementById('alignCenterBtn'),
  alignRightBtn: document.getElementById('alignRightBtn'),
  playBtn: document.getElementById('playBtn'),
  stopBtn: document.getElementById('stopBtn'),
  previewBtn: document.getElementById('previewBtn'),
  volumeSlider: document.getElementById('volumeSlider'),
  previewPlayBtn: document.getElementById('previewPlayBtn'),
  previewPauseBtn: document.getElementById('previewPauseBtn'),
  previewMobileBtn: document.getElementById('previewMobileBtn'),
  previewTabletBtn: document.getElementById('previewTabletBtn'),
  previewDesktopBtn: document.getElementById('previewDesktopBtn'),
};

// Initialize the application
function init() {
  // First check if all required DOM elements exist before proceeding
  for (const [key, element] of Object.entries(domElements)) {
    if (!element) {
      console.warn(`DOM element "${key}" not found. Some features may not work correctly.`);
    }
  }
  
  setupEventListeners();
  setupToolbar();
  setupFileDragAndDrop();
  setupExportModal();
  setupPreviewModal();
  setupTimeline();
  updateUndoRedoButtons();
  setupTransformOptions();
}

// Set up all event listeners
function setupEventListeners() {
  // Spritesheet upload
  if (domElements.spritesheetUpload && domElements.fileInput) {
    domElements.spritesheetUpload.addEventListener('click', () => {
      domElements.fileInput.click();
    });
    
    domElements.fileInput.addEventListener('change', handleSpritesheetUpload);
  }
  
  // Image upload
  if (domElements.imageUpload && domElements.imageFileInput) {
    domElements.imageUpload.addEventListener('click', () => {
      domElements.imageFileInput.click();
    });
    
    domElements.imageFileInput.addEventListener('change', handleImageUpload);
  }
  
  // Audio upload
  if (domElements.audioUpload && domElements.audioFileInput) {
    domElements.audioUpload.addEventListener('click', () => {
      domElements.audioFileInput.click();
    });
    
    domElements.audioFileInput.addEventListener('change', handleAudioUpload);
  }
  
  // Project actions
  if (domElements.newProjectBtn) {
    domElements.newProjectBtn.addEventListener('click', showNewProjectModal);
  }
  
  if (domElements.openProjectBtn && domElements.projectFileInput) {
    domElements.openProjectBtn.addEventListener('click', () => {
      domElements.projectFileInput.click();
    });
    domElements.projectFileInput.addEventListener('change', openProject);
  }
  
  if (domElements.saveProjectBtn) {
    domElements.saveProjectBtn.addEventListener('click', saveProject);
  }
  
  if (domElements.exportBtn) {
    domElements.exportBtn.addEventListener('click', showExportModal);
  }
  
  // UI Elements drag and drop
  document.querySelectorAll('.ui-element').forEach(element => {
    if (element) {
      element.addEventListener('dragstart', handleUiElementDragStart);
    }
  });
  
  // Timeline toggle
  if (domElements.expandTimelineBtn) {
    domElements.expandTimelineBtn.addEventListener('click', toggleTimeline);
  }
  
  // Canvas events
  if (domElements.canvas) {
    domElements.canvas.addEventListener('click', handleCanvasClick);
    domElements.canvas.addEventListener('dragover', handleCanvasDragOver);
    domElements.canvas.addEventListener('drop', handleCanvasDrop);
  }
  
  // Preview button
  if (domElements.previewBtn) {
    domElements.previewBtn.addEventListener('click', showPreviewModal);
  }
  
  // Export buttons
  if (domElements.exportZipBtn) {
    domElements.exportZipBtn.addEventListener('click', exportAsZip);
  }
  
  if (domElements.exportJsonBtn) {
    domElements.exportJsonBtn.addEventListener('click', exportAsJson);
  }
  
  if (domElements.copyCodeBtn) {
    domElements.copyCodeBtn.addEventListener('click', copyExportCode);
  }
  
  // Close modals when clicking on the close button
  document.querySelectorAll('.modal-close').forEach(closeBtn => {
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
          modal.classList.remove('show');
        });
      });
    }
  });
  
  // Handle audio controls
  if (domElements.volumeSlider) {
    domElements.volumeSlider.addEventListener('input', (e) => {
      state.audio.volume = parseFloat(e.target.value);
      updateAudioVolume();
    });
  }
  
  if (domElements.previewPlayBtn) {
    domElements.previewPlayBtn.addEventListener('click', playBackgroundMusic);
  }
  
  if (domElements.previewPauseBtn) {
    domElements.previewPauseBtn.addEventListener('click', pauseBackgroundMusic);
  }
  
  // Preview device buttons
  if (domElements.previewMobileBtn) {
    domElements.previewMobileBtn.addEventListener('click', () => setPreviewDevice('mobile'));
  }
  
  if (domElements.previewTabletBtn) {
    domElements.previewTabletBtn.addEventListener('click', () => setPreviewDevice('tablet'));
  }
  
  if (domElements.previewDesktopBtn) {
    domElements.previewDesktopBtn.addEventListener('click', () => setPreviewDevice('desktop'));
  }
  
  // Animation controls
  if (domElements.playBtn) {
    domElements.playBtn.addEventListener('click', playAnimations);
  }
  
  if (domElements.stopBtn) {
    domElements.stopBtn.addEventListener('click', stopAnimations);
  }
  
  // Undo/Redo
  if (domElements.undoBtn) {
    domElements.undoBtn.addEventListener('click', undo);
  }
  
  if (domElements.redoBtn) {
    domElements.redoBtn.addEventListener('click', redo);
  }
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  // Toggle proportional scaling
  const proportionalScalingToggle = document.getElementById('proportionalScalingToggle');
  if (proportionalScalingToggle) {
    proportionalScalingToggle.addEventListener('change', toggleProportionalScaling);
  }
  
  // Template selection
  document.querySelectorAll('.template-item').forEach(item => {
    if (item) {
      item.addEventListener('click', () => selectTemplate(item.dataset.id));
    }
  });
}

// Set up toolbar buttons
function setupToolbar() {
  // Tool selection
  if (domElements.moveToolBtn) {
    domElements.moveToolBtn.addEventListener('click', () => setActiveTool('move'));
  }
  
  if (domElements.selectToolBtn) {
    domElements.selectToolBtn.addEventListener('click', () => setActiveTool('select'));
  }
  
  if (domElements.rotateToolBtn) {
    domElements.rotateToolBtn.addEventListener('click', () => setActiveTool('rotate'));
  }
  
  // Alignment buttons
  if (domElements.alignLeftBtn) {
    domElements.alignLeftBtn.addEventListener('click', () => alignSelectedElement('left'));
  }
  
  if (domElements.alignCenterBtn) {
    domElements.alignCenterBtn.addEventListener('click', () => alignSelectedElement('center'));
  }
  
  if (domElements.alignRightBtn) {
    domElements.alignRightBtn.addEventListener('click', () => alignSelectedElement('right'));
  }
}

// Set the active tool
function setActiveTool(toolName) {
  state.currentTool = toolName;
  
  // Update UI
  document.querySelectorAll('.toolbar button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  switch(toolName) {
    case 'move':
      if (domElements.moveToolBtn) {
        domElements.moveToolBtn.classList.add('active');
      }
      break;
    case 'select':
      if (domElements.selectToolBtn) {
        domElements.selectToolBtn.classList.add('active');
      }
      break;
    case 'rotate':
      if (domElements.rotateToolBtn) {
        domElements.rotateToolBtn.classList.add('active');
      }
      break;
  }
}

// Set up file drag and drop
function setupFileDragAndDrop() {
  const dropZones = [
    domElements.spritesheetUpload,
    domElements.imageUpload,
    domElements.audioUpload
  ];
  
  dropZones.forEach(zone => {
    if (zone) {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.add('drag-over');
      });
      
      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
      });
      
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          if (zone === domElements.spritesheetUpload) {
            handleSpritesheetDrop(files);
          } else if (zone === domElements.imageUpload) {
            handleImageDrop(files);
          } else if (zone === domElements.audioUpload) {
            handleAudioDrop(files);
          }
        }
      });
    }
  });
}

// Set up export modal
function setupExportModal() {
  // Set up code tabs
  document.querySelectorAll('.code-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.exportOptions.currentTab = tab.dataset.tab;
      updateExportCode();
    });
  });
}

// Set up preview modal
function setupPreviewModal() {
  // Preview functionality will be implemented here
}

// Set up timeline
function setupTimeline() {
  // Timeline functionality will be implemented here
}

// Toggle timeline expansion
function toggleTimeline() {
  state.timeline.expanded = !state.timeline.expanded;
  if (domElements.timeline) {
    domElements.timeline.classList.toggle('expanded', state.timeline.expanded);
  }
}

// Handle spritesheet upload
function handleSpritesheetUpload(e) {
  const files = e.target.files;
  if (files.length === 0) return;
  
  // Look for PNG and XML files
  let pngFile = null;
  let xmlFile = null;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type === 'image/png') {
      pngFile = file;
    } else if (file.name.endsWith('.xml') || file.type === 'application/xml' || file.type === 'text/xml') {
      xmlFile = file;
    }
  }
  
  if (pngFile && xmlFile) {
    processSpritesheetWithXML(pngFile, xmlFile);
  } else if (pngFile) {
    // Just add the PNG as a regular image
    processImage(pngFile);
  } else {
    alert('Please upload a PNG file with its corresponding XML file');
  }
  
  // Reset the file input
  e.target.value = '';
}

// Process spritesheet with XML
function processSpritesheetWithXML(pngFile, xmlFile) {
  const pngReader = new FileReader();
  const xmlReader = new FileReader();
  
  pngReader.onload = function(e) {
    const pngDataUrl = e.target.result;
    
    xmlReader.onload = function(e) {
      const xmlContent = e.target.result;
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
        
        // Process the XML to extract animation data
        const animations = extractAnimationsFromXML(xmlDoc, pngDataUrl, pngFile.name);
        
        // Add to state
        state.animations = [...state.animations, ...animations];
        
        // Add spritesheet to assets
        const asset = {
          id: generateId(),
          name: pngFile.name,
          type: 'spritesheet',
          url: pngDataUrl,
          xmlData: xmlContent,
          animations: animations.map(a => a.id)
        };
        
        state.assets.push(asset);
        
        // Update UI
        updateAssetLibrary();
        updateAnimationsList();
        
        // Add to undo stack
        addToUndoStack();
        
      } catch (error) {
        console.error('Error parsing XML:', error);
        alert('Error parsing XML file. Please check the file format.');
      }
    };
    
    xmlReader.readAsText(xmlFile);
  };
  
  pngReader.readAsDataURL(pngFile);
}

// Extract animations from XML
function extractAnimationsFromXML(xmlDoc, spriteSheetUrl, fileName) {
  const animations = [];
  
  // This function will be customized based on the XML format
  // Here's a generic implementation that works with common formats
  
  // Try to find TextureAtlas format (common in libGDX, Starling, etc)
  const subtextures = xmlDoc.getElementsByTagName('SubTexture');
  if (subtextures.length > 0) {
    // Group subtextures by animation name (usually prefix before number)
    const animationGroups = {};
    
    for (let i = 0; i < subtextures.length; i++) {
      const subtexture = subtextures[i];
      const name = subtexture.getAttribute('name');
      
      // Extract animation name (remove numbers and extensions)
      const animName = name.replace(/[0-9]+\..*$|[0-9]+$/, '');
      
      if (!animationGroups[animName]) {
        animationGroups[animName] = [];
      }
      
      // Extract frame data
      const frame = {
        x: parseInt(subtexture.getAttribute('x')),
        y: parseInt(subtexture.getAttribute('y')),
        width: parseInt(subtexture.getAttribute('width')),
        height: parseInt(subtexture.getAttribute('height'))
      };
      
      animationGroups[animName].push(frame);
    }
    
    // Create animation objects
    for (const [animName, frames] of Object.entries(animationGroups)) {
      if (frames.length > 0) {
        animations.push({
          id: generateId(),
          name: animName,
          spriteSheetUrl: spriteSheetUrl,
          frames: frames,
          frameDuration: 100, // Default frame duration
          fileName: fileName
        });
      }
    }
  }
  
  // Try alternative formats if no animations were found
  if (animations.length === 0) {
    // Try FNF format
    const animationElements = xmlDoc.getElementsByTagName('Animation');
    if (animationElements.length > 0) {
      for (let i = 0; i < animationElements.length; i++) {
        const animElement = animationElements[i];
        const animName = animElement.getAttribute('name');
        
        const frames = [];
        const frameElements = animElement.getElementsByTagName('Frame');
        
        for (let j = 0; j < frameElements.length; j++) {
          const frameElement = frameElements[j];
          const frame = {
            x: parseInt(frameElement.getAttribute('x')),
            y: parseInt(frameElement.getAttribute('y')),
            width: parseInt(frameElement.getAttribute('width')),
            height: parseInt(frameElement.getAttribute('height'))
          };
          frames.push(frame);
        }
        
        if (frames.length > 0) {
          animations.push({
            id: generateId(),
            name: animName,
            spriteSheetUrl: spriteSheetUrl,
            frames: frames,
            frameDuration: 100, // Default frame duration
            fileName: fileName
          });
        }
      }
    }
  }
  
  return animations;
}

// Handle image upload
function handleImageUpload(e) {
  const files = e.target.files;
  if (files.length === 0) return;
  
  for (let i = 0; i < files.length; i++) {
    processImage(files[i]);
  }
  
  // Reset the file input
  e.target.value = '';
}

// Process a single image
function processImage(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    
    // Add to state
    const asset = {
      id: generateId(),
      name: file.name,
      type: 'image',
      url: dataUrl
    };
    
    state.assets.push(asset);
    
    // Update UI
    updateAssetLibrary();
    
    // Add to undo stack
    addToUndoStack();
  };
  
  reader.readAsDataURL(file);
}

// Handle audio upload
function handleAudioUpload(e) {
  const files = e.target.files;
  if (files.length === 0) return;
  
  for (let i = 0; i < files.length; i++) {
    processAudio(files[i]);
  }
  
  // Reset the file input
  e.target.value = '';
}

// Process a single audio file
function processAudio(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    
    // Add to state
    const asset = {
      id: generateId(),
      name: file.name,
      type: 'audio',
      url: dataUrl
    };
    
    state.assets.push(asset);
    
    // Update UI
    updateAssetLibrary();
    
    // Add to undo stack
    addToUndoStack();
  };
  
  reader.readAsDataURL(file);
}

// Handle spritesheet drop
function handleSpritesheetDrop(files) {
  // Look for PNG and XML files
  let pngFile = null;
  let xmlFile = null;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type === 'image/png') {
      pngFile = file;
    } else if (file.name.endsWith('.xml') || file.type === 'application/xml' || file.type === 'text/xml') {
      xmlFile = file;
    }
  }
  
  if (pngFile && xmlFile) {
    processSpritesheetWithXML(pngFile, xmlFile);
  } else if (pngFile) {
    // Just add the PNG as a regular image
    processImage(pngFile);
  } else {
    alert('Please upload a PNG file with its corresponding XML file');
  }
}

// Handle image drop
function handleImageDrop(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith('image/')) {
      processImage(file);
    }
  }
}

// Handle audio drop
function handleAudioDrop(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith('audio/')) {
      processAudio(file);
    }
  }
}

// Update asset library UI
function updateAssetLibrary() {
  const assetLibrary = domElements.assetLibrary;
  if (!assetLibrary) return;
  
  assetLibrary.innerHTML = '';
  
  if (state.assets.length === 0) {
    assetLibrary.innerHTML = '<div class="empty-state">No assets uploaded yet</div>';
    return;
  }
  
  for (const asset of state.assets) {
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';
    assetItem.setAttribute('draggable', 'true');
    assetItem.setAttribute('data-id', asset.id);
    assetItem.setAttribute('data-type', asset.type);
    
    // Create asset thumbnail
    const thumbnail = document.createElement('div');
    thumbnail.className = 'asset-thumbnail';
    
    if (asset.type === 'image' || asset.type === 'spritesheet') {
      const img = document.createElement('img');
      img.src = asset.url;
      thumbnail.appendChild(img);
    } else if (asset.type === 'audio') {
      const audioIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      audioIcon.setAttribute('width', '24');
      audioIcon.setAttribute('height', '24');
      audioIcon.setAttribute('viewBox', '0 0 24 24');
      audioIcon.setAttribute('fill', 'none');
      audioIcon.innerHTML = `
        <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="#FF8C42" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" stroke="#FF8C42" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19.07 5.93C20.9447 7.80527 21.9979 10.3447 21.9979 13C21.9979 15.6553 20.9447 18.1947 19.07 20.07" stroke="#FF8C42" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      thumbnail.appendChild(audioIcon);
    }
    
    // Create asset name
    const name = document.createElement('div');
    name.className = 'asset-name';
    name.textContent = asset.name;
    
    // Create asset actions
    const actions = document.createElement('div');
    actions.className = 'asset-actions';
    
    // Delete action
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'asset-action';
    deleteBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteAsset(asset.id);
    });
    
    actions.appendChild(deleteBtn);
    
    // Assemble asset item
    assetItem.appendChild(thumbnail);
    assetItem.appendChild(name);
    assetItem.appendChild(actions);
    
    // Add drag event
    assetItem.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'asset',
        assetType: asset.type,
        id: asset.id
      }));
    });
    
    assetLibrary.appendChild(assetItem);
  }
}

// Update animations list UI
function updateAnimationsList() {
  const animationsList = domElements.animationsList;
  if (!animationsList) return;
  
  animationsList.innerHTML = '';
  
  if (state.animations.length === 0) {
    animationsList.innerHTML = '<div class="empty-state">No animations detected</div>';
    return;
  }
  
  for (const animation of state.animations) {
    const animItem = document.createElement('div');
    animItem.className = 'animation-item';
    animItem.setAttribute('draggable', 'true');
    animItem.setAttribute('data-id', animation.id);
    
    // Create animation thumbnail
    const thumbnail = document.createElement('div');
    thumbnail.className = 'animation-thumbnail';
    
    // If animation has frames, show the first frame
    if (animation.frames && animation.frames.length > 0) {
      const frame = animation.frames[0];
      const img = document.createElement('img');
      img.src = animation.spriteSheetUrl;
      img.style.clipPath = `inset(${frame.y}px ${frame.x}px ${frame.height}px ${frame.width}px)`;
      thumbnail.appendChild(img);
    }
    
    // Create animation name
    const name = document.createElement('div');
    name.className = 'animation-name';
    name.textContent = animation.name;
    
    // Create animation actions
    const actions = document.createElement('div');
    actions.className = 'animation-actions';
    
    // Play action
    const playBtn = document.createElement('button');
    playBtn.className = 'animation-action';
    playBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5V19L19 12L8 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      previewAnimation(animation.id);
    });
    
    actions.appendChild(playBtn);
    
    // Assemble animation item
    animItem.appendChild(thumbnail);
    animItem.appendChild(name);
    animItem.appendChild(actions);
    
    // Add drag event
    animItem.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'animation',
        id: animation.id
      }));
    });
    
    animationsList.appendChild(animItem);
  }
}

// Handle UI element drag start
function handleUiElementDragStart(e) {
  e.dataTransfer.setData('text/plain', JSON.stringify({
    type: 'ui-element',
    elementType: e.target.dataset.type
  }));
}

// Handle canvas drag over
function handleCanvasDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
}

// Handle canvas drop
function handleCanvasDrop(e) {
  e.preventDefault();
  
  // Get drop coordinates relative to the canvas
  const rect = domElements.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  try {
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    switch(data.type) {
      case 'asset':
        addAssetToCanvas(data.id, x, y, data.assetType);
        break;
      case 'animation':
        addAnimationToCanvas(data.id, x, y);
        break;
      case 'ui-element':
        addUiElementToCanvas(data.elementType, x, y);
        break;
    }
  } catch(error) {
    console.error('Error handling drop:', error);
  }
}

// Add asset to canvas
function addAssetToCanvas(assetId, x, y, assetType) {
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset) return;
  
  let element;
  
  switch(asset.type) {
    case 'image':
    case 'spritesheet':
      element = {
        id: generateId(),
        type: 'image',
        assetId: asset.id,
        x: x,
        y: y,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
        visible: true,
        order: state.canvasElements.length
      };
      break;
    case 'audio':
      element = {
        id: generateId(),
        type: 'audio',
        assetId: asset.id,
        x: x,
        y: y,
        width: 50,
        height: 50,
        rotation: 0,
        volume: 1,
        loop: false,
        autoplay: false,
        visible: true,
        order: state.canvasElements.length
      };
      break;
  }
  
  if (element) {
    state.canvasElements.push(element);
    renderCanvasElements();
    selectElement(element.id);
    addToUndoStack();
  }
}

// Add animation to canvas
function addAnimationToCanvas(animationId, x, y) {
  const animation = state.animations.find(a => a.id === animationId);
  if (!animation) return;
  
  const element = {
    id: generateId(),
    type: 'sprite',
    animationId: animation.id,
    x: x,
    y: y,
    width: 100,
    height: 100,
    rotation: 0,
    opacity: 1,
    playing: false,
    speed: 1,
    loop: true,
    visible: true,
    order: state.canvasElements.length
  };
  
  state.canvasElements.push(element);
  renderCanvasElements();
  selectElement(element.id);
  addToUndoStack();
}

// Add UI element to canvas
function addUiElementToCanvas(elementType, x, y) {
  let element;
  
  switch(elementType) {
    case 'text':
      element = {
        id: generateId(),
        type: 'text',
        text: 'Text',
        x: x,
        y: y,
        width: 100,
        height: 30,
        rotation: 0,
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#000000',
        textAlign: 'left',
        opacity: 1,
        visible: true,
        order: state.canvasElements.length
      };
      break;
    case 'button':
      element = {
        id: generateId(),
        type: 'button',
        text: 'Button',
        x: x,
        y: y,
        width: 100,
        height: 40,
        rotation: 0,
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#FFFFFF',
        backgroundColor: '#FF8C42',
        borderRadius: 4,
        opacity: 1,
        visible: true,
        order: state.canvasElements.length
      };
      break;
    case 'container':
      element = {
        id: generateId(),
        type: 'container',
        x: x,
        y: y,
        width: 200,
        height: 150,
        rotation: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderStyle: 'dashed',
        borderRadius: 0,
        opacity: 1,
        visible: true,
        order: state.canvasElements.length
      };
      break;
  }
  
  if (element) {
    state.canvasElements.push(element);
    renderCanvasElements();
    selectElement(element.id);
    addToUndoStack();
  }
}

// Handle canvas click
function handleCanvasClick(e) {
  // Check if we clicked on an element
  const rect = domElements.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Go through elements in reverse order (top to bottom)
  const sortedElements = [...state.canvasElements].sort((a, b) => b.order - a.order);
  
  let found = false;
  for (const element of sortedElements) {
    if (isPointInElement(x, y, element)) {
      selectElement(element.id);
      found = true;
      break;
    }
  }
  
  if (!found) {
    // Clicked on empty canvas area
    deselectElement();
  }
}

// Check if a point is inside an element
function isPointInElement(x, y, element) {
  // Get element bounds
  const left = element.x;
  const right = element.x + element.width;
  const top = element.y;
  const bottom = element.y + element.height;
  
  // Simple bounding box check for now (doesn't handle rotation)
  return x >= left && x <= right && y >= top && y <= bottom;
}

// Select an element
function selectElement(elementId) {
  const element = state.canvasElements.find(e => e.id === elementId);
  if (!element) return;
  
  state.selectedElement = element;
  
  // Update UI to show element is selected
  document.querySelectorAll('.canvas-element').forEach(el => {
    el.classList.remove('selected');
  });
  
  const elementNode = document.querySelector(`.canvas-element[data-id="${elementId}"]`);
  if (elementNode) {
    elementNode.classList.add('selected');
    
    // Add resize handles if they don't exist
    if (!elementNode.querySelector('.resize-handle')) {
      addResizeHandles(elementNode);
    }
  }
  
  // Show element properties
  showElementProperties(element);
}

// Add resize handles to selected element
function addResizeHandles(elementNode) {
  // Create the resize handles
  const handles = ['nw', 'ne', 'sw', 'se'];
  
  for (const position of handles) {
    const handle = document.createElement('div');
    handle.className = `resize-handle ${position}`;
    handle.setAttribute('data-position', position);
    
    // Add resize functionality
    handle.addEventListener('mousedown', handleResizeStart);
    
    elementNode.appendChild(handle);
  }
  
  // Add rotate handle
  const rotateLine = document.createElement('div');
  rotateLine.className = 'rotate-line';
  elementNode.appendChild(rotateLine);
  
  const rotateHandle = document.createElement('div');
  rotateHandle.className = 'rotate-handle';
  rotateHandle.addEventListener('mousedown', handleRotateStart);
  elementNode.appendChild(rotateHandle);
}

// Handle start of resize operation
function handleResizeStart(e) {
  e.stopPropagation();
  e.preventDefault();
  
  if (!state.selectedElement) return;
  
  const position = e.target.dataset.position;
  const startX = e.clientX;
  const startY = e.clientY;
  const element = state.selectedElement;
  const originalWidth = element.width;
  const originalHeight = element.height;
  const originalX = element.x;
  const originalY = element.y;
  const aspectRatio = originalWidth / originalHeight;
  
  // Create a function to handle the resize
  function handleResize(e) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    // Calculate new dimensions based on the handle position
    // If proportional scaling is enabled, maintain aspect ratio
    if (state.transformOptions.proportionalScaling) {
      switch(position) {
        case 'se':
          element.width = Math.max(20, originalWidth + dx);
          element.height = Math.max(20, element.width / aspectRatio);
          break;
        case 'sw':
          element.width = Math.max(20, originalWidth - dx);
          element.x = originalX + originalWidth - element.width;
          element.height = Math.max(20, element.width / aspectRatio);
          break;
        case 'ne':
          element.width = Math.max(20, originalWidth + dx);
          element.height = Math.max(20, element.width / aspectRatio);
          element.y = originalY + originalHeight - element.height;
          break;
        case 'nw':
          element.width = Math.max(20, originalWidth - dx);
          element.x = originalX + originalWidth - element.width;
          element.height = Math.max(20, element.width / aspectRatio);
          element.y = originalY + originalHeight - element.height;
          break;
      }
    } else {
      // Original non-proportional scaling
      switch(position) {
        case 'se':
          element.width = Math.max(20, originalWidth + dx);
          element.height = Math.max(20, originalHeight + dy);
          break;
        case 'sw':
          element.width = Math.max(20, originalWidth - dx);
          element.x = originalX + originalWidth - element.width;
          element.height = Math.max(20, originalHeight + dy);
          break;
        case 'ne':
          element.width = Math.max(20, originalWidth + dx);
          element.height = Math.max(20, originalHeight - dy);
          element.y = originalY + originalHeight - element.height;
          break;
        case 'nw':
          element.width = Math.max(20, originalWidth - dx);
          element.x = originalX + originalWidth - element.width;
          element.height = Math.max(20, originalHeight - dy);
          element.y = originalY + originalHeight - element.height;
          break;
      }
    }
    
    // Update the element on the canvas
    renderCanvasElements();
    updateElementProperties();
  }
  
  // Create a function to handle the end of resize
  function handleResizeEnd() {
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', handleResizeEnd);
    
    // Add to undo stack if changed
    if (originalWidth !== element.width || originalHeight !== element.height ||
        originalX !== element.x || originalY !== element.y) {
      addToUndoStack();
    }
  }
  
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', handleResizeEnd);
}

// Handle start of rotate operation
function handleRotateStart(e) {
  e.stopPropagation();
  e.preventDefault();
  
  if (!state.selectedElement) return;
  
  const element = state.selectedElement;
  const originalRotation = element.rotation || 0;
  
  // Calculate center of the element
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;
  
  // Calculate angle from center to mouse
  const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
  
  // Create a function to handle the rotation
  function handleRotate(e) {
    // Calculate the new angle
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const deltaAngle = currentAngle - startAngle;
    
    // Set the new rotation (keep it between 0-360)
    element.rotation = (originalRotation + deltaAngle + 360) % 360;
    
    // Update the element on the canvas
    renderCanvasElements();
    updateElementProperties();
  }
  
  // Create a function to handle the end of rotation
  function handleRotateEnd() {
    document.removeEventListener('mousemove', handleRotate);
    document.removeEventListener('mouseup', handleRotateEnd);
    
    // Add to undo stack if changed
    if (originalRotation !== element.rotation) {
      addToUndoStack();
    }
  }
  
  document.addEventListener('mousemove', handleRotate);
  document.addEventListener('mouseup', handleRotateEnd);
}

// Deselect all elements
function deselectElement() {
  state.selectedElement = null;
  
  // Update UI
  document.querySelectorAll('.canvas-element').forEach(el => {
    el.classList.remove('selected');
  });
  
  // Hide properties panel
  hideElementProperties();
}

// Show element properties in the properties panel
function showElementProperties(element) {
  // Hide the no selection message
  if (domElements.noSelectionInfo) {
    domElements.noSelectionInfo.style.display = 'none';
  }
  
  // Show the properties container
  if (domElements.elementProperties) {
    domElements.elementProperties.style.display = 'block';
  }
  
  // Clear the properties panel
  if (domElements.elementProperties) {
    domElements.elementProperties.innerHTML = '';
  }
  
  // Create a properties group for basic properties
  const basicPropsGroup = document.createElement('div');
  basicPropsGroup.className = 'property-group';
  
  const basicPropsHeader = document.createElement('h4');
  basicPropsHeader.textContent = 'Basic Properties';
  basicPropsGroup.appendChild(basicPropsHeader);
  
  // Create common properties (position, size, rotation)
  
  // Position
  const positionRow = createPropertyRow('Position', createPositionInputs(element));
  basicPropsGroup.appendChild(positionRow);
  
  // Size
  const sizeRow = createPropertyRow('Size', createSizeInputs(element));
  basicPropsGroup.appendChild(sizeRow);
  
  // Rotation
  const rotationRow = createPropertyRow('Rotation', createRotationInput(element));
  basicPropsGroup.appendChild(rotationRow);
  
  // Opacity
  if ('opacity' in element) {
    const opacityRow = createPropertyRow('Opacity', createOpacityInput(element));
    basicPropsGroup.appendChild(opacityRow);
  }
  
  // Visibility
  if ('visible' in element) {
    const visibilityRow = createPropertyRow('Visible', createVisibilityInput(element));
    basicPropsGroup.appendChild(visibilityRow);
  }
  
  // Add the basic properties group
  if (domElements.elementProperties) {
    domElements.elementProperties.appendChild(basicPropsGroup);
  }
  
  // Create specific properties for each element type
  switch(element.type) {
    case 'text':
      addTextProperties(element);
      break;
    case 'button':
      addButtonProperties(element);
      break;
    case 'container':
      addContainerProperties(element);
      break;
    case 'image':
      addImageProperties(element);
      break;
    case 'sprite':
      addSpriteProperties(element);
      break;
    case 'audio':
      addAudioProperties(element);
      break;
  }
}

// Create position inputs
function createPositionInputs(element) {
  const container = document.createElement('div');
  container.className = 'input-group';
  
  // X position
  const xContainer = document.createElement('div');
  const xLabel = document.createElement('label');
  xLabel.textContent = 'X';
  const xInput = document.createElement('input');
  xInput.type = 'number';
  xInput.value = element.x;
  xInput.addEventListener('change', (e) => {
    element.x = parseInt(e.target.value);
    renderCanvasElements();
    addToUndoStack();
  });
  xContainer.appendChild(xLabel);
  xContainer.appendChild(xInput);
  
  // Y position
  const yContainer = document.createElement('div');
  const yLabel = document.createElement('label');
  yLabel.textContent = 'Y';
  const yInput = document.createElement('input');
  yInput.type = 'number';
  yInput.value = element.y;
  yInput.addEventListener('change', (e) => {
    element.y = parseInt(e.target.value);
    renderCanvasElements();
    addToUndoStack();
  });
  yContainer.appendChild(yLabel);
  yContainer.appendChild(yInput);
  
  container.appendChild(xContainer);
  container.appendChild(yContainer);
  
  return container;
}

// Create size inputs
function createSizeInputs(element) {
  const container = document.createElement('div');
  container.className = 'input-group';
  
  // Width
  const widthContainer = document.createElement('div');
  const widthLabel = document.createElement('label');
  widthLabel.textContent = 'W';
  const widthInput = document.createElement('input');
  widthInput.type = 'number';
  widthInput.value = element.width;
  widthInput.addEventListener('change', (e) => {
    element.width = parseInt(e.target.value);
    renderCanvasElements();
    addToUndoStack();
  });
  widthContainer.appendChild(widthLabel);
  widthContainer.appendChild(widthInput);
  
  // Height
  const heightContainer = document.createElement('div');
  const heightLabel = document.createElement('label');
  heightLabel.textContent = 'H';
  const heightInput = document.createElement('input');
  heightInput.type = 'number';
  heightInput.value = element.height;
  heightInput.addEventListener('change', (e) => {
    element.height = parseInt(e.target.value);
    renderCanvasElements();
    addToUndoStack();
  });
  heightContainer.appendChild(heightLabel);
  heightContainer.appendChild(heightInput);
  
  container.appendChild(widthContainer);
  container.appendChild(heightContainer);
  
  return container;
}

// Create rotation input
function createRotationInput(element) {
  const input = document.createElement('input');
  input.type = 'number';
  input.value = element.rotation || 0;
  input.min = 0;
  input.max = 359;
  
  input.addEventListener('change', (e) => {
    element.rotation = parseInt(e.target.value);
    renderCanvasElements();
    addToUndoStack();
  });
  
  return input;
}

// Create opacity input
function createOpacityInput(element) {
  const input = document.createElement('input');
  input.type = 'range';
  input.min = 0;
  input.max = 1;
  input.step = 0.1;
  input.value = element.opacity;
  
  input.addEventListener('change', (e) => {
    element.opacity = parseFloat(e.target.value);
    renderCanvasElements();
    addToUndoStack();
  });
  
  return input;
}

// Create visibility input
function createVisibilityInput(element) {
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = element.visible;
  
  input.addEventListener('change', (e) => {
    element.visible = e.target.checked;
    renderCanvasElements();
    addToUndoStack();
  });
  
  return input;
}

// Add text-specific properties
function addTextProperties(element) {
  const textPropsGroup = document.createElement('div');
  textPropsGroup.className = 'property-group';
  
  const textPropsHeader = document.createElement('h4');
  textPropsHeader.textContent = 'Text Properties';
  textPropsGroup.appendChild(textPropsHeader);
  
  // Text content
  const textRow = createPropertyRow('Text', createTextInput(element));
  textPropsGroup.appendChild(textRow);
  
  // Font size
  const fontSizeRow = createPropertyRow('Font Size', createFontSizeInput(element));
  textPropsGroup.appendChild(fontSizeRow);
  
  // Font family
  const fontFamilyRow = createPropertyRow('Font', createFontFamilyInput(element));
  textPropsGroup.appendChild(fontFamilyRow);
  
  // Text color
  const colorRow = createPropertyRow('Color', createColorInput(element));
  textPropsGroup.appendChild(colorRow);
  
  // Text alignment
  const alignRow = createPropertyRow('Align', createTextAlignInput(element));
  textPropsGroup.appendChild(alignRow);
  
  if (domElements.elementProperties) {
    domElements.elementProperties.appendChild(textPropsGroup);
  }
}

// Create text input
function createTextInput(element) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = element.text;
  
  input.addEventListener('change', (e) => {
    element.text = e.target.value;
    renderCanvasElements();
    addToUndoStack();
  });
  
  return input;
}

// Create font size input
function createFontSizeInput(element) {
  const input = document.createElement('input');
  input.type = 'number';
  input.value = element.fontSize;
  input.min = 8;
  
  input.addEventListener('change', (e) => {
    element.fontSize = parseInt(e.target.value);
    renderCanvasElements();
    addToUndoStack();
  });
  
  return input;
}

// Create font family input
function createFontFamilyInput(element) {
  const select = document.createElement('select');
  
  const fonts = [
    'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 
    'Courier New', 'Georgia', 'Trebuchet MS'
  ];
  
  for (const font of fonts) {
    const option = document.createElement('option');
    option.value = font;
    option.textContent = font;
    select.appendChild(option);
  }
  
  select.value = element.fontFamily;
  
  select.addEventListener('change', (e) => {
    element.fontFamily = e.target.value;
    renderCanvasElements();
    addToUndoStack();
  });
  
  return select;
}

// Create color input
function createColorInput(element) {
  const input = document.createElement('input');
  input.type = 'color';
  input.value = element.color || '#000000';
  
  input.addEventListener('change', (e) => {
    element.color = e.target.value;
    renderCanvasElements();
    addToUndoStack();
  });
  
  return input;
}

// Create text alignment input
function createTextAlignInput(element) {
  const select = document.createElement('select');
  
  const alignments = ['left', 'center', 'right'];
  
  for (const align of alignments) {
    const option = document.createElement('option');
    option.value = align;
    option.textContent = align.charAt(0).toUpperCase() + align.slice(1);
    select.appendChild(option);
  }
  
  select.value = element.textAlign;
  
  select.addEventListener('change', (e) => {
    element.textAlign = e.target.value;
    renderCanvasElements();
    addToUndoStack();
  });
  
  return select;
}

// Add button-specific properties
function addButtonProperties(element) {
  const buttonPropsGroup = document.createElement('div');
  buttonPropsGroup.className = 'property-group';
  
  const buttonPropsHeader = document.createElement('h4');
  buttonPropsHeader.textContent = 'Button Properties';
  buttonPropsGroup.appendChild(buttonPropsHeader);
  
  // Text content
  const textRow = createPropertyRow('Text', createTextInput(element));
  buttonPropsGroup.appendChild(textRow);
  
  // Font size
  const fontSizeRow = createPropertyRow('Font Size', createFontSizeInput(element));
  buttonPropsGroup.appendChild(fontSizeRow);
  
  // Font family
  const fontFamilyRow = createPropertyRow('Font', createFontFamilyInput(element));
  buttonPropsGroup.appendChild(fontFamilyRow);
  
  // Text color
  const colorRow = createPropertyRow('Text Color', createColorInput(element));
  buttonPropsGroup.appendChild(colorRow);
  
  // Background color
  const bgColorRow = createPropertyRow('BG Color', createBackgroundColorInput(element));
  buttonPropsGroup.appendChild(bgColorRow);
  
  // Border radius
  const borderRadiusRow = createPropertyRow('Radius', createBorderRadiusInput(element));
  buttonPropsGroup.appendChild(borderRadiusRow);
  
  if (domElements.elementProperties) {
    domElements.elementProperties.appendChild(buttonPropsGroup);
  }
}

// Create background color input
function createBackgroundColorInput(element) {
  const input = document.createElement('input');
  input.type = 'color';
  input.value = element.backgroundColor || '#FFFFFF';
  
  input.addEventListener('change', (e) => {
    element.backgroundColor = e.target.value;
    renderCanvasElements();
    addToUndoStack();
  });
  
  return input;
}

// Create border radius input
function createBorderRadiusInput(element) {
  const input = document.createElement('input');
  input.type = 'number';
  input.value = element.borderRadius || 0;
  input.min = 0;
  
  input.addEventListener('change', (e) => {
    element.borderRadius = parseInt(e.target.value);
    renderCanvasElements();
    addToUndoStack();
  });
  
  return input;
}

// Add container-specific properties
function addContainerProperties(element) {
  const containerPropsGroup = document.createElement('div');
  containerPropsGroup.className = 'property-group';
  
  const containerPropsHeader = document.createElement('h4');
  containerPropsHeader.textContent = 'Container Properties';
  containerPropsGroup.appendChild(containerPropsHeader);
  
  // Background color
  const bgColorRow = createPropertyRow('BG Color', createBackgroundColorInput(element));
  containerPropsGroup.appendChild(bgColorRow);
  
  // Border width
  const borderWidthRow = createPropertyRow('Border W', createBorderWidthInput(element));
  containerPropsGroup.appendChild(borderWidthRow);
  
  // Border color
  const borderColorRow = createPropertyRow('Border C', createBorderColorInput(element));
  containerPropsGroup.appendChild(borderColorRow);
  
  // Border style
  const borderStyleRow = createPropertyRow('Border S', createBorderStyleInput(element));
  containerPropsGroup.appendChild(borderStyleRow);
  
  // Border radius
  const borderRadiusRow = createPropertyRow('Radius', createBorderRadiusInput(element));
  containerPropsGroup.appendChild(borderRadiusRow);
  
  if (domElements.elementProperties) {
    domElements.elementProperties.appendChild(containerPropsGroup);
  }
}

// Create border width input
function createBorderWidthInput(element) {
  const input = document.createElement('input');
  input.type = 'number';
  input.value = element.borderWidth || 0;
  input.min = 0;
  
  input.addEventListener('change', (e) => {
    element.borderWidth = parseInt(e.target.value);
    renderCanvasElements();
    addToUndoStack();
  });
  
  return input;
}

// Create border color input
function createBorderColorInput(element) {
  const input = document.createElement('input');
  input.type = 'color';
  input.value = element.borderColor || '#000000';
  
  input.addEventListener('change', (e) => {
    element.borderColor = e.target.value;
    renderCanvasElements();
    addToUndoStack();
  });
  
  return input;
}

// Create border style input
function createBorderStyleInput(element) {
  const select = document.createElement('select');
  
  const styles = ['none', 'solid', 'dashed', 'dotted'];
  
  for (const style of styles) {
    const option = document.createElement('option');
    option.value = style;
    option.textContent = style.charAt(0).toUpperCase() + style.slice(1);
    select.appendChild(option);
  }
  
  select.value = element.borderStyle || 'solid';
  
  select.addEventListener('change', (e) => {
    element.borderStyle = e.target.value;
    renderCanvasElements();
    addToUndoStack();
  });
  
  return select;
}

// Add image-specific properties
function addImageProperties(element) {
  const imagePropsGroup = document.createElement('div');
  imagePropsGroup.className = 'property-group';
  
  const imagePropsHeader = document.createElement('h4');
  imagePropsHeader.textContent = 'Image Properties';
  imagePropsGroup.appendChild(imagePropsHeader);
  
  // Image source (read-only)
  const asset = state.assets.find(a => a.id === element.assetId);
  if (asset) {
    const sourceRow = createPropertyRow('Source', createReadOnlyText(asset.name));
    imagePropsGroup.appendChild(sourceRow);
  }
  
  if (domElements.elementProperties) {
    domElements.elementProperties.appendChild(imagePropsGroup);
  }
}

// Create read-only text display
function createReadOnlyText(text) {
  const span = document.createElement('span');
  span.textContent = text;
  span.style.color = '#666';
  return span;
}

// Add sprite-specific properties
function addSpriteProperties(element) {
  const spritePropsGroup = document.createElement('div');
  spritePropsGroup.className = 'property-group';
  
  const spritePropsHeader = document.createElement('h4');
  spritePropsHeader.textContent = 'Sprite Properties';
  spritePropsGroup.appendChild(spritePropsHeader);
  
  // Animation name (read-only)
  const animation = state.animations.find(a => a.id === element.animationId);
  if (animation) {
    const nameRow = createPropertyRow('Animation', createReadOnlyText(animation.name));
    spritePropsGroup.appendChild(nameRow);
    
    // Spritesheet name (read-only)
    const sourceRow = createPropertyRow('Spritesheet', createReadOnlyText(animation.fileName));
    spritePropsGroup.appendChild(sourceRow);
  }
  
  // Animation speed
  const speedRow = createPropertyRow('Speed', createSpeedInput(element));
  spritePropsGroup.appendChild(speedRow);
  
  // Loop animation
  const loopRow = createPropertyRow('Loop', createLoopInput(element));
  spritePropsGroup.appendChild(loopRow);
  
  // Add 9-slice scaling option
  const nineSliceRow = createPropertyRow('9-Slice', createNineSliceToggle(element));
  spritePropsGroup.appendChild(nineSliceRow);
  
  // Play/Stop controls
  const controlsRow = createPropertyRow('Controls', createAnimationControls(element));
  spritePropsGroup.appendChild(controlsRow);
  
  if (domElements.elementProperties) {
    domElements.elementProperties.appendChild(spritePropsGroup);
  }
}

// Create 9-slice toggle
function createNineSliceToggle(element) {
  const container = document.createElement('div');
  container.className = 'nine-slice-toggle';
  
  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.checked = element.nineSlice || false;
  
  toggle.addEventListener('change', (e) => {
    element.nineSlice = e.target.checked;
    
    // Show/hide 9-slice settings based on toggle
    const nineSliceSettings = document.querySelector('.nine-slice-settings');
    if (nineSliceSettings) {
      nineSliceSettings.style.display = element.nineSlice ? 'block' : 'none';
    } else if (element.nineSlice) {
      // Create 9-slice settings if they don't exist yet
      createNineSliceSettings(element);
    }
    
    renderCanvasElements();
    addToUndoStack();
  });
  
  container.appendChild(toggle);
  
  // Add settings if 9-slice is enabled
  if (element.nineSlice) {
    createNineSliceSettings(element);
  }
  
  return container;
}

// Create 9-slice settings
function createNineSliceSettings(element) {
  const settingsContainer = document.createElement('div');
  settingsContainer.className = 'nine-slice-settings';
  settingsContainer.style.marginTop = '8px';
  
  // Initialize 9-slice values if not set
  if (!element.nineSliceValues) {
    element.nineSliceValues = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    };
  }
  
  // Create inputs for all four sides
  const topInput = createNumberInput('Top', element.nineSliceValues.top, (value) => {
    element.nineSliceValues.top = value;
    renderCanvasElements();
    addToUndoStack();
  });
  
  const rightInput = createNumberInput('Right', element.nineSliceValues.right, (value) => {
    element.nineSliceValues.right = value;
    renderCanvasElements();
    addToUndoStack();
  });
  
  const bottomInput = createNumberInput('Bottom', element.nineSliceValues.bottom, (value) => {
    element.nineSliceValues.bottom = value;
    renderCanvasElements();
    addToUndoStack();
  });
  
  const leftInput = createNumberInput('Left', element.nineSliceValues.left, (value) => {
    element.nineSliceValues.left = value;
    renderCanvasElements();
    addToUndoStack();
  });
  
  settingsContainer.appendChild(topInput);
  settingsContainer.appendChild(rightInput);
  settingsContainer.appendChild(bottomInput);
  settingsContainer.appendChild(leftInput);
  
  const sliceGroup = document.querySelector('.nine-slice-toggle');
  if (sliceGroup) {
    sliceGroup.appendChild(settingsContainer);
  }
}

// Create a number input with label
function createNumberInput(label, value, onChange) {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.marginBottom = '5px';
  
  const labelEl = document.createElement('label');
  labelEl.textContent = label;
  labelEl.style.width = '50px';
  labelEl.style.fontSize = '12px';
  
  const input = document.createElement('input');
  input.type = 'number';
  input.value = value;
  input.min = 0;
  
  input.addEventListener('change', (e) => {
    onChange(parseInt(e.target.value));
  });
  
  container.appendChild(labelEl);
  container.appendChild(input);
  
  return container;
}

// Create speed input
function createSpeedInput(element) {
  const input = document.createElement('input');
  input.type = 'range';
  input.min = 0.1;
  input.max = 3;
  input.step = 0.1;
  input.value = element.speed || 1;
  
  input.addEventListener('change', (e) => {
    element.speed = parseFloat(e.target.value);
    renderCanvasElements();
    addToUndoStack();
  });
  
  return input;
}

// Create loop input
function createLoopInput(element) {
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = element.loop === undefined ? true : element.loop;
  
  input.addEventListener('change', (e) => {
    element.loop = e.target.checked;
    renderCanvasElements();
    addToUndoStack();
  });
  
  return input;
}

// Create animation controls
function createAnimationControls(element) {
  const container = document.createElement('div');
  container.className = 'animation-controls';
  
  // Play button
  const playBtn = document.createElement('button');
  playBtn.textContent = 'Play';
  playBtn.addEventListener('click', () => {
    playSpriteAnimation(element.id);
  });
  
  // Stop button
  const stopBtn = document.createElement('button');
  stopBtn.textContent = 'Stop';
  stopBtn.addEventListener('click', () => {
    stopSpriteAnimation(element.id);
  });
  
  container.appendChild(playBtn);
  container.appendChild(stopBtn);
  
  return container;
}

// Add audio-specific properties
function addAudioProperties(element) {
  const audioPropsGroup = document.createElement('div');
  audioPropsGroup.className = 'property-group';
  
  const audioPropsHeader = document.createElement('h4');
  audioPropsHeader.textContent = 'Audio Properties';
  audioPropsGroup.appendChild(audioPropsHeader);
  
  // Audio name (read-only)
  const asset = state.assets.find(a => a.id === element.assetId);
  if (asset) {
    const nameRow = createPropertyRow('Audio', createReadOnlyText(asset.name));
    audioPropsGroup.appendChild(nameRow);
  }
  
  // Volume
  const volumeRow = createPropertyRow('Volume', createVolumeInput(element));
  audioPropsGroup.appendChild(volumeRow);
  
  // Loop audio
  const loopRow = createPropertyRow('Loop', createLoopInput(element));
  audioPropsGroup.appendChild(loopRow);
  
  // Autoplay
  const autoplayRow = createPropertyRow('Autoplay', createAutoplayInput(element));
  audioPropsGroup.appendChild(autoplayRow);
  
  // Play/Stop controls
  const controlsRow = createPropertyRow('Controls', createAudioControls(element));
  audioPropsGroup.appendChild(controlsRow);
  
  if (domElements.elementProperties) {
    domElements.elementProperties.appendChild(audioPropsGroup);
  }
}

// Create volume input
function createVolumeInput(element) {
  const input = document.createElement('input');
  input.type = 'range';
  input.min = 0;
  input.max = 1;
  input.step = 0.1;
  input.value = element.volume || 1;
  
  input.addEventListener('change', (e) => {
    element.volume = parseFloat(e.target.value);
    renderCanvasElements();
    addToUndoStack();
  });
  
  return input;
}

// Create autoplay input
function createAutoplayInput(element) {
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = element.autoplay || false;
  
  input.addEventListener('change', (e) => {
    element.autoplay = e.target.checked;
    renderCanvasElements();
    addToUndoStack();
  });
  
  return input;
}

// Create audio controls
function createAudioControls(element) {
  const container = document.createElement('div');
  container.className = 'audio-controls';
  
  // Set as background music button
  const bgMusicBtn = document.createElement('button');
  bgMusicBtn.textContent = 'Set as BG Music';
  bgMusicBtn.addEventListener('click', () => {
    setBackgroundMusic(element.assetId);
  });
  
  // Play button
  const playBtn = document.createElement('button');
  playBtn.textContent = 'Play';
  playBtn.addEventListener('click', () => {
    playAudio(element.assetId);
  });
  
  // Stop button
  const stopBtn = document.createElement('button');
  stopBtn.textContent = 'Stop';
  stopBtn.addEventListener('click', () => {
    stopAudio();
  });
  
  container.appendChild(bgMusicBtn);
  container.appendChild(playBtn);
  container.appendChild(stopBtn);
  
  return container;
}

// Create a property row with label and value
function createPropertyRow(label, valueElement) {
  const row = document.createElement('div');
  row.className = 'property-row';
  
  const labelElement = document.createElement('div');
  labelElement.className = 'property-label';
  labelElement.textContent = label;
  
  const valueContainer = document.createElement('div');
  valueContainer.className = 'property-value';
  valueContainer.appendChild(valueElement);
  
  row.appendChild(labelElement);
  row.appendChild(valueContainer);
  
  return row;
}

// Hide element properties panel
function hideElementProperties() {
  if (domElements.noSelectionInfo) {
    domElements.noSelectionInfo.style.display = 'block';
  }
  if (domElements.elementProperties) {
    domElements.elementProperties.style.display = 'none';
  }
}

// Update element properties panel with current values
function updateElementProperties() {
  if (state.selectedElement) {
    showElementProperties(state.selectedElement);
  }
}

// Render all canvas elements
function renderCanvasElements() {
  // Clear the canvas
  if (domElements.canvas) {
    domElements.canvas.innerHTML = '';
  }
  
  // Sort elements by their order (z-index)
  const sortedElements = [...state.canvasElements].sort((a, b) => a.order - b.order);
  
  // Render each element
  for (const element of sortedElements) {
    if (!element.visible) continue;
    
    renderCanvasElement(element);
  }
}

// Render a single canvas element
function renderCanvasElement(element) {
  const elementNode = document.createElement('div');
  elementNode.className = 'canvas-element';
  elementNode.setAttribute('data-id', element.id);
  elementNode.setAttribute('data-type', element.type);
  
  // Set position and size
  elementNode.style.left = `${element.x}px`;
  elementNode.style.top = `${element.y}px`;
  elementNode.style.width = `${element.width}px`;
  elementNode.style.height = `${element.height}px`;
  
  // Set rotation if specified
  if (element.rotation) {
    elementNode.style.transform = `rotate(${element.rotation}deg)`;
  }
  
  // Set opacity if specified
  if (element.opacity !== undefined) {
    elementNode.style.opacity = element.opacity;
  }
  
  // Add specific styles and content based on element type
  switch(element.type) {
    case 'text':
      elementNode.classList.add('canvas-text');
      elementNode.style.fontSize = `${element.fontSize}px`;
      elementNode.style.fontFamily = element.fontFamily;
      elementNode.style.color = element.color;
      elementNode.style.textAlign = element.textAlign;
      elementNode.textContent = element.text;
      break;
      
    case 'button':
      elementNode.classList.add('canvas-button');
      elementNode.style.fontSize = `${element.fontSize}px`;
      elementNode.style.fontFamily = element.fontFamily;
      elementNode.style.color = element.color;
      elementNode.style.backgroundColor = element.backgroundColor;
      elementNode.style.borderRadius = `${element.borderRadius}px`;
      elementNode.style.display = 'flex';
      elementNode.style.alignItems = 'center';
      elementNode.style.justifyContent = 'center';
      elementNode.style.cursor = 'pointer';
      elementNode.textContent = element.text;
      
      // Add hover effect
      elementNode.addEventListener('mouseenter', () => {
        elementNode.style.filter = 'brightness(1.1)';
      });
      elementNode.addEventListener('mouseleave', () => {
        elementNode.style.filter = 'none';
      });
      break;
      
    case 'container':
      elementNode.classList.add('canvas-container');
      elementNode.style.backgroundColor = element.backgroundColor;
      elementNode.style.borderWidth = `${element.borderWidth}px`;
      elementNode.style.borderColor = element.borderColor;
      elementNode.style.borderStyle = element.borderStyle;
      elementNode.style.borderRadius = `${element.borderRadius}px`;
      break;
      
    case 'image':
      const asset = state.assets.find(a => a.id === element.assetId);
      if (asset) {
        const img = document.createElement('img');
        img.src = asset.url;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        elementNode.appendChild(img);
      }
      break;
      
    case 'sprite':
      const animation = state.animations.find(a => a.id === element.animationId);
      if (animation) {
        const img = document.createElement('img');
        img.src = animation.spriteSheetUrl;
        
        // Display the first frame
        if (animation.frames && animation.frames.length > 0) {
          const frame = animation.frames[0];
          img.style.objectFit = 'none';
          img.style.objectPosition = `-${frame.x}px -${frame.y}px`;
          img.style.width = `${frame.width}px`;
          img.style.height = `${frame.height}px`;
          
          // Scale to fit element dimensions
          const scaleX = element.width / frame.width;
          const scaleY = element.height / frame.height;
          img.style.transform = `scale(${scaleX}, ${scaleY})`;
          img.style.transformOrigin = 'top left';
        }
        
        elementNode.appendChild(img);
        
        // If the animation should be playing, set it up
        if (element.playing) {
          setupAnimationPlayback(elementNode, element, animation);
        }
      }
      break;
      
    case 'audio':
      elementNode.classList.add('canvas-audio');
      const audioAsset = state.assets.find(a => a.id === element.assetId);
      if (audioAsset) {
        // Create audio icon
        const audioIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        audioIcon.setAttribute('width', '24');
        audioIcon.setAttribute('height', '24');
        audioIcon.setAttribute('viewBox', '0 0 24 24');
        audioIcon.setAttribute('fill', 'none');
        audioIcon.innerHTML = `
          <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="#FF8C42" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" stroke="#FF8C42" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19.07 5.93C20.9447 7.80527 21.9979 10.3447 21.9979 13C21.9979 15.6553 20.9447 18.1947 19.07 20.07" stroke="#FF8C42" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        `;
        
        // Create audio name
        const audioName = document.createElement('div');
        audioName.textContent = audioAsset.name;
        audioName.style.fontSize = '12px';
        audioName.style.textAlign = 'center';
        audioName.style.marginTop = '5px';
        
        elementNode.appendChild(audioIcon);
        elementNode.appendChild(audioName);
      }
      break;
  }
  
  // Add element to canvas
  if (domElements.canvas) {
    domElements.canvas.appendChild(elementNode);
  }
  
  // If this is the selected element, mark it as selected and add resize handles
  if (state.selectedElement && state.selectedElement.id === element.id) {
    elementNode.classList.add('selected');
    addResizeHandles(elementNode);
  }
  
  // Make element draggable
  makeElementDraggable(elementNode);
}

// Make an element draggable
function makeElementDraggable(elementNode) {
  let isDragging = false;
  let startX, startY;
  let originalX, originalY;
  
  elementNode.addEventListener('mousedown', startDrag);
  
  function startDrag(e) {
    // Only handle left mouse button
    if (e.button !== 0) return;
    
    // Don't start drag if clicking on a handle
    if (e.target.classList.contains('resize-handle') || 
        e.target.classList.contains('rotate-handle')) {
      return;
    }
    
    e.preventDefault();
    
    // Get element data
    const elementId = elementNode.getAttribute('data-id');
    const element = state.canvasElements.find(el => el.id === elementId);
    
    if (!element) return;
    
    // Select this element
    selectElement(elementId);
    
    // Only start dragging if in move tool mode
    if (state.currentTool !== 'move') return;
    
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    originalX = element.x;
    originalY = element.y;
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
  }
  
  function handleDrag(e) {
    if (!isDragging) return;
    
    const elementId = elementNode.getAttribute('data-id');
    const element = state.canvasElements.find(el => el.id === elementId);
    
    if (!element) return;
    
    // Calculate the new position
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    element.x = originalX + dx;
    element.y = originalY + dy;
    
    // Update the element position
    elementNode.style.left = `${element.x}px`;
    elementNode.style.top = `${element.y}px`;
    
    // Update properties panel
    updateElementProperties();
  }
  
  function stopDrag() {
    if (isDragging) {
      isDragging = false;
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', stopDrag);
      
      // Add to undo stack
      addToUndoStack();
    }
  }
}

// Set up animation playback for a sprite element
function setupAnimationPlayback(elementNode, element, animation) {
  if (!animation.frames || animation.frames.length <= 1) return;
  
  const img = elementNode.querySelector('img');
  if (!img) return;
  
  let currentFrame = 0;
  const totalFrames = animation.frames.length;
  
  // Calculate frame duration based on speed
  const frameDuration = animation.frameDuration / (element.speed || 1);
  
  function updateFrame() {
    const frame = animation.frames[currentFrame];
    img.style.objectPosition = `-${frame.x}px -${frame.y}px`;
    
    // Fix for proper sprite scaling - preserve the frame dimensions
    img.style.width = `${frame.width}px`;
    img.style.height = `${frame.height}px`;
    
    // Scale to fit element dimensions properly
    const scaleX = element.width / frame.width;
    const scaleY = element.height / frame.height;
    img.style.transform = `scale(${scaleX}, ${scaleY})`;
    
    currentFrame = (currentFrame + 1) % totalFrames;
    
    // If we've reached the end and loop is false, stop the animation
    if (currentFrame === 0 && !element.loop) {
      element.playing = false;
      return;
    }
    
    // If the element is still playing, continue animation
    if (element.playing) {
      setTimeout(updateFrame, frameDuration);
    }
  }
  
  // Start the animation
  setTimeout(updateFrame, frameDuration);
}

// Play a specific sprite animation
function playSpriteAnimation(elementId) {
  const element = state.canvasElements.find(el => el.id === elementId);
  if (!element || element.type !== 'sprite') return;
  
  element.playing = true;
  renderCanvasElements();
}

// Stop a specific sprite animation
function stopSpriteAnimation(elementId) {
  const element = state.canvasElements.find(el => el.id === elementId);
  if (!element || element.type !== 'sprite') return;
  
  element.playing = false;
  renderCanvasElements();
}

// Play all animations
function playAnimations() {
  state.animationsPlaying = true;
  
  // Play all sprite animations
  state.canvasElements.forEach(element => {
    if (element.type === 'sprite') {
      element.playing = true;
    }
  });
  
  renderCanvasElements();
}

// Stop all animations
function stopAnimations() {
  state.animationsPlaying = false;
  
  // Stop all sprite animations
  state.canvasElements.forEach(element => {
    if (element.type === 'sprite') {
      element.playing = false;
    }
  });
  
  renderCanvasElements();
}

// Set background music
function setBackgroundMusic(assetId) {
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset || asset.type !== 'audio') return;
  
  state.audio.backgroundMusic = assetId;
  showMessage(`"${asset.name}" set as background music.`);
}

// Play background music
function playBackgroundMusic() {
  if (!state.audio.backgroundMusic) {
    showMessage('No background music set. Add an audio asset and set it as background music.');
    return;
  }
  
  playAudio(state.audio.backgroundMusic);
  state.audio.playing = true;
}

// Pause background music
function pauseBackgroundMusic() {
  stopAudio();
  state.audio.playing = false;
}

// Update audio volume
function updateAudioVolume() {
  const audioElement = document.getElementById('audioPlayer');
  if (audioElement) {
    audioElement.volume = state.audio.volume;
  }
}

// Play an audio asset
function playAudio(assetId) {
  stopAudio(); // Stop any currently playing audio
  
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset || asset.type !== 'audio') return;
  
  // Check if an audio player already exists
  let audioElement = document.getElementById('audioPlayer');
  
  if (!audioElement) {
    audioElement = document.createElement('audio');
    audioElement.id = 'audioPlayer';
    document.body.appendChild(audioElement);
  }
  
  audioElement.src = asset.url;
  audioElement.volume = state.audio.volume;
  audioElement.play();
}

// Stop audio playback
function stopAudio() {
  const audioElement = document.getElementById('audioPlayer');
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
}

// Add to undo stack
function addToUndoStack() {
  // Create a deep copy of the current state
  const stateCopy = {
    assets: JSON.parse(JSON.stringify(state.assets)),
    animations: JSON.parse(JSON.stringify(state.animations)),
    canvasElements: JSON.parse(JSON.stringify(state.canvasElements)),
    selectedElementId: state.selectedElement ? state.selectedElement.id : null
  };
  
  state.undoStack.push(stateCopy);
  
  // Limit undo stack size
  if (state.undoStack.length > 50) {
    state.undoStack.shift();
  }
  
  // Clear redo stack when a new action is performed
  state.redoStack = [];
  
  // Mark project as modified
  state.project.modified = true;
  
  // Update UI
  updateUndoRedoButtons();
}

// Undo the last action
function undo() {
  if (state.undoStack.length === 0) return;
  
  // Save current state to redo stack
  const currentState = {
    assets: JSON.parse(JSON.stringify(state.assets)),
    animations: JSON.parse(JSON.stringify(state.animations)),
    canvasElements: JSON.parse(JSON.stringify(state.canvasElements)),
    selectedElementId: state.selectedElement ? state.selectedElement.id : null
  };
  
  state.redoStack.push(currentState);
  
  // Pop the last state from undo stack
  const prevState = state.undoStack.pop();
  
  // Restore previous state
  state.assets = prevState.assets;
  state.animations = prevState.animations;
  state.canvasElements = prevState.canvasElements;
  
  // Update UI
  updateAssetLibrary();
  updateAnimationsList();
  renderCanvasElements();
  
  // Restore selection if there was one
  if (prevState.selectedElementId) {
    selectElement(prevState.selectedElementId);
  } else {
    deselectElement();
  }
  
  // Update undo/redo buttons
  updateUndoRedoButtons();
}

// Redo the last undone action
function redo() {
  if (state.redoStack.length === 0) return;
  
  // Save current state to undo stack
  const currentState = {
    assets: JSON.parse(JSON.stringify(state.assets)),
    animations: JSON.parse(JSON.stringify(state.animations)),
    canvasElements: JSON.parse(JSON.stringify(state.canvasElements)),
    selectedElementId: state.selectedElement ? state.selectedElement.id : null
  };
  
  state.undoStack.push(currentState);
  
  // Pop the last state from redo stack
  const nextState = state.redoStack.pop();
  
  // Restore next state
  state.assets = nextState.assets;
  state.animations = nextState.animations;
  state.canvasElements = nextState.canvasElements;
  
  // Update UI
  updateAssetLibrary();
  updateAnimationsList();
  renderCanvasElements();
  
  // Restore selection if there was one
  if (nextState.selectedElementId) {
    selectElement(nextState.selectedElementId);
  } else {
    deselectElement();
  }
  
  // Update undo/redo buttons
  updateUndoRedoButtons();
}

// Update undo/redo buttons state
function updateUndoRedoButtons() {
  if (domElements.undoBtn) {
    domElements.undoBtn.disabled = state.undoStack.length === 0;
  }
  if (domElements.redoBtn) {
    domElements.redoBtn.disabled = state.redoStack.length === 0;
  }
}

// Create a new project
function newProject() {
  if (state.project.modified) {
    const confirm = window.confirm('You have unsaved changes. Create a new project anyway?');
    if (!confirm) return;
  }
  
  // Reset state
  state.assets = [];
  state.animations = [];
  state.canvasElements = [];
  state.selectedElement = null;
  state.undoStack = [];
  state.redoStack = [];
  state.audio.backgroundMusic = null;
  
  // Reset project info
  state.project.name = 'Untitled Project';
  state.project.modified = false;
  
  // Update UI
  updateAssetLibrary();
  updateAnimationsList();
  renderCanvasElements();
  deselectElement();
  updateUndoRedoButtons();
  
  showMessage('New project created.');
}

// Open a project
function openProject(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const projectData = JSON.parse(e.target.result);
      
      // Validate project data
      if (!projectData.assets || !projectData.animations || !projectData.canvasElements) {
        throw new Error('Invalid project file.');
      }
      
      // Reset state
      state.assets = projectData.assets;
      state.animations = projectData.animations;
      state.canvasElements = projectData.canvasElements;
      state.selectedElement = null;
      state.undoStack = [];
      state.redoStack = [];
      
      // Set project info
      state.project.name = projectData.name || 'Untitled Project';
      state.project.modified = false;
      
      // Update UI
      updateAssetLibrary();
      updateAnimationsList();
      renderCanvasElements();
      deselectElement();
      updateUndoRedoButtons();
      
      showMessage(`Project "${state.project.name}" loaded.`);
      
    } catch (error) {
      console.error('Error loading project:', error);
      showMessage('Error loading project. Please check the file format.', 'error');
    }
  };
  
  reader.readAsText(file);
  
  // Reset the file input
  e.target.value = '';
}

// Save the current project
function saveProject() {
  // Create project data
  const projectData = {
    name: state.project.name,
    assets: state.assets,
    animations: state.animations,
    canvasElements: state.canvasElements,
    backgroundMusic: state.audio.backgroundMusic
  };
  
  // Convert to JSON
  const jsonData = JSON.stringify(projectData);
  
  // Create blob and download
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.project.name.replace(/\s+/g, '_')}.orangy`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Mark as saved
  state.project.modified = false;
  
  showMessage('Project saved.');
}

// Show the export modal
function showExportModal() {
  if (domElements.exportModal) {
    domElements.exportModal.classList.add('show');
  }
  updateExportCode();
}

// Update export code
function updateExportCode() {
  const { currentTab } = state.exportOptions;
  
  let code = '';
  
  switch(currentTab) {
    case 'html':
      code = generateExportHTML();
      break;
    case 'css':
      code = generateExportCSS();
      break;
    case 'js':
      code = generateExportJS();
      break;
  }
  
  if (domElements.exportCode) {
    domElements.exportCode.textContent = code;
  }
}

// Generate HTML for export
function generateExportHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${state.project.name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="container">
    ${generateExportHTMLContent()}
  </div>
  <script src="script.js"></script>
</body>
</html>`;
}

// Generate HTML content for export
function generateExportHTMLContent() {
  let content = '';
  
  // Sort elements by their order (z-index)
  const sortedElements = [...state.canvasElements].sort((a, b) => a.order - b.order);
  
  for (const element of sortedElements) {
    if (!element.visible) continue;
    
    switch (element.type) {
      case 'text':
        content += `    <div class="element text-element" id="element-${element.id}" style="left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; transform: rotate(${element.rotation || 0}deg);">${element.text}</div>\n`;
        break;
        
      case 'button':
        content += `    <button class="element button-element" id="element-${element.id}" style="left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; transform: rotate(${element.rotation || 0}deg);">${element.text}</button>\n`;
        break;
        
      case 'container':
        content += `    <div class="element container-element" id="element-${element.id}" style="left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; transform: rotate(${element.rotation || 0}deg);"></div>\n`;
        break;
        
      case 'image':
        const asset = state.assets.find(a => a.id === element.assetId);
        if (asset) {
          content += `    <div class="element image-element" id="element-${element.id}" style="left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; transform: rotate(${element.rotation || 0}deg);">
      <img src="assets/${asset.name}" alt="${asset.name}">
    </div>\n`;
        }
        break;
        
      case 'sprite':
        const animation = state.animations.find(a => a.id === element.animationId);
        if (animation) {
          content += `    <div class="element sprite-element" id="element-${element.id}" data-animation="${animation.name}" style="left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; transform: rotate(${element.rotation || 0}deg);">
      <img src="assets/${animation.fileName}" alt="${animation.name}">
    </div>\n`;
        }
        break;
        
      case 'audio':
        const audioAsset = state.assets.find(a => a.id === element.assetId);
        if (audioAsset) {
          const autoplay = element.autoplay ? ' autoplay' : '';
          const loop = element.loop ? ' loop' : '';
          content += `    <audio id="element-${element.id}" src="assets/${audioAsset.name}"${autoplay}${loop}></audio>\n`;
        }
        break;
    }
  }
  
  return content;
}

// Generate CSS for export
function generateExportCSS() {
  return `body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}

#container {
  position: relative;
  width: ${state.canvasSize.width}px;
  height: ${state.canvasSize.height}px;
  margin: 0 auto;
  background-color: white;
  overflow: hidden;
}

.element {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

${generateElementSpecificCSS()}`;
}

// Generate element-specific CSS
function generateElementSpecificCSS() {
  let css = '';
  
  // Process all elements to generate specific styles
  for (const element of state.canvasElements) {
    if (!element.visible) continue;
    
    switch (element.type) {
      case 'text':
        css += `
#element-${element.id} {
  font-size: ${element.fontSize}px;
  font-family: ${element.fontFamily};
  color: ${element.color};
  text-align: ${element.textAlign};
  opacity: ${element.opacity};
}
`;
        break;
        
      case 'button':
        css += `
#element-${element.id} {
  font-size: ${element.fontSize}px;
  font-family: ${element.fontFamily};
  color: ${element.color};
  background-color: ${element.backgroundColor};
  border: none;
  border-radius: ${element.borderRadius}px;
  cursor: pointer;
  opacity: ${element.opacity};
}

#element-${element.id}:hover {
  filter: brightness(1.1);
}
`;
        break;
        
      case 'container':
        css += `
#element-${element.id} {
  background-color: ${element.backgroundColor};
  border: ${element.borderWidth}px ${element.borderStyle} ${element.borderColor};
  border-radius: ${element.borderRadius}px;
  opacity: ${element.opacity};
}
`;
        break;
        
      case 'image':
        css += `
#element-${element.id} {
  opacity: ${element.opacity};
}

#element-${element.id} img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
`;
        break;
        
      case 'sprite':
        const animation = state.animations.find(a => a.id === element.animationId);
        if (animation && animation.frames && animation.frames.length > 0) {
          const firstFrame = animation.frames[0];
          css += `
#element-${element.id} {
  opacity: ${element.opacity};
  overflow: hidden;
}

#element-${element.id} img {
  object-fit: none;
  object-position: -${firstFrame.x}px -${firstFrame.y}px;
  width: ${firstFrame.width}px;
  height: ${firstFrame.height}px;
  transform: scale(${element.width / firstFrame.width}, ${element.height / firstFrame.height});
  transform-origin: top left;
}
`;
        }
        break;
    }
  }
  
  return css;
}

// Generate JavaScript for export
function generateExportJS() {
  return `// Generated by Orangy - Interactive UI Editor
document.addEventListener('DOMContentLoaded', function() {
  // Initialize animations
  initializeAnimations();
  
  // Set up audio
  setupAudio();
  
  // Add event listeners
  setupEventListeners();
});

// Animation data
const animations = ${JSON.stringify(state.animations.map(a => ({
    name: a.name,
    frames: a.frames,
    frameDuration: a.frameDuration
  })), null, 2)};

// Active animations
const activeAnimations = {};

// Initialize animations
function initializeAnimations() {
  // Find all sprite elements
  const spriteElements = document.querySelectorAll('.sprite-element');
  
  spriteElements.forEach(element => {
    const animationName = element.dataset.animation;
    const animation = animations.find(a => a.name === animationName);
    
    if (animation && animation.frames.length > 1) {
      const img = element.querySelector('img');
      if (img) {
        ${generateAnimationPlaybackCode()}
      }
    }
  });
}

// Setup audio
function setupAudio() {
  ${generateAudioSetupCode()}
}

// Setup event listeners
function setupEventListeners() {
  // Add click event listeners for buttons
  document.querySelectorAll('.button-element').forEach(button => {
    button.addEventListener('click', function() {
      console.log('Button clicked:', this.id);
      // Add your button click logic here
    });
  });
}
`;
}

// Generate animation playback code
function generateAnimationPlaybackCode() {
  return `
        let currentFrame = 0;
        const totalFrames = animation.frames.length;
        
        // Create animation object
        const animObj = {
          element: element,
          img: img,
          animation: animation,
          currentFrame: 0,
          playing: ${state.animationsPlaying},
          speed: ${state.canvasElements.find(e => e.type === 'sprite')?.speed || 1},
          loop: true,
          lastTime: 0
        };
        
        // Store animation reference
        activeAnimations[element.id] = animObj;
        
        // Start animation if needed
        if (animObj.playing) {
          requestAnimationFrame(timestamp => updateAnimation(timestamp, element.id));
        }`;
}

// Generate audio setup code
function generateAudioSetupCode() {
  let code = '';
  
  // Check if we have a background music
  if (state.audio.backgroundMusic) {
    const bgMusic = state.assets.find(a => a.id === state.audio.backgroundMusic);
    if (bgMusic) {
      code += `
  // Set up background music
  const bgMusic = document.querySelector('audio[src="assets/${bgMusic.name}"]');
  if (bgMusic) {
    bgMusic.volume = ${state.audio.volume};
    bgMusic.loop = true;
    
    // Start playing background music (requires user interaction)
    document.addEventListener('click', function bgMusicStart() {
      bgMusic.play();
      document.removeEventListener('click', bgMusicStart);
    }, { once: true });
  }`;
    }
  }
  
  // Set up other audio elements
  const audioElements = state.canvasElements.filter(e => e.type === 'audio');
  if (audioElements.length > 0) {
    code += `
  // Set up other audio elements
  document.querySelectorAll('audio').forEach(audio => {
    audio.volume = ${state.audio.volume};
  });`;
  }
  
  return code;
}

// Export as ZIP
function exportAsZip() {
  // Create a new JSZip instance
  const zip = new JSZip();
  
  // Add HTML file
  zip.file('index.html', generateExportHTML());
  
  // Add CSS file
  zip.file('styles.css', generateExportCSS());
  
  // Add JS file
  zip.file('script.js', generateExportJS());
  
  // Create assets folder
  const assets = zip.folder('assets');
  
  // Add all assets
  const promises = [];
  
  for (const asset of state.assets) {
    if (asset.url.startsWith('data:')) {
      // Extract file data from data URL
      const promise = fetch(asset.url)
        .then(res => res.blob())
        .then(blob => {
          assets.file(asset.name, blob);
        });
      
      promises.push(promise);
    }
  }
  
  // Generate the ZIP file when all assets are added
  Promise.all(promises).then(() => {
    zip.generateAsync({ type: 'blob' })
      .then(function(content) {
        // Create download link
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.project.name.replace(/\s+/g, '_')}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('Project exported as ZIP.');
      });
  });
}

// Export as JSON
function exportAsJson() {
  // Create project data
  const projectData = {
    name: state.project.name,
    assets: state.assets,
    animations: state.animations,
    canvasElements: state.canvasElements,
    backgroundMusic: state.audio.backgroundMusic
  };
  
  // Convert to JSON
  const jsonData = JSON.stringify(projectData);
  
  // Create blob and download
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.project.name.replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showMessage('Project exported as JSON.');
}

// Copy export code to clipboard
function copyExportCode() {
  const codeText = domElements.exportCode.textContent;
  
  navigator.clipboard.writeText(codeText)
    .then(() => {
      showMessage('Code copied to clipboard!');
    })
    .catch(err => {
      console.error('Error copying code:', err);
      showMessage('Failed to copy code.', 'error');
    });
}

// Show preview modal
function showPreviewModal() {
  if (domElements.previewModal) {
    domElements.previewModal.classList.add('show');
  }
  
  // Generate preview content
  const previewContainer = domElements.previewContainer;
  if (!previewContainer) return;
  
  previewContainer.innerHTML = '';
  
  // Create a container for the preview content
  const container = document.createElement('div');
  container.id = 'preview-content';
  container.style.width = `${state.canvasSize.width}px`;
  container.style.height = `${state.canvasSize.height}px`;
  container.style.position = 'relative';
  container.style.backgroundColor = 'white';
  container.style.overflow = 'hidden';
  
  // Add all canvas elements to the preview
  const sortedElements = [...state.canvasElements].sort((a, b) => a.order - b.order);
  
  for (const element of sortedElements) {
    if (!element.visible) continue;
    
    // Create preview element
    const previewElement = createPreviewElement(element);
    if (previewElement) {
      container.appendChild(previewElement);
    }
  }
  
  previewContainer.appendChild(container);
  
  // Set preview device size
  setPreviewDevice(state.exportOptions.previewDevice);
  
  // Play background music if set
  if (state.audio.backgroundMusic) {
    playBackgroundMusic();
  }
}

// Create a preview element
function createPreviewElement(element) {
  const previewElement = document.createElement('div');
  previewElement.className = 'preview-element';
  previewElement.style.position = 'absolute';
  previewElement.style.left = `${element.x}px`;
  previewElement.style.top = `${element.y}px`;
  previewElement.style.width = `${element.width}px`;
  previewElement.style.height = `${element.height}px`;
  
  // Set rotation if specified
  if (element.rotation) {
    previewElement.style.transform = `rotate(${element.rotation}deg)`;
  }
  
  // Set opacity if specified
  if (element.opacity !== undefined) {
    previewElement.style.opacity = element.opacity;
  }
  
  // Add specific styles and content based on element type
  switch(element.type) {
    case 'text':
      previewElement.style.fontSize = `${element.fontSize}px`;
      previewElement.style.fontFamily = element.fontFamily;
      previewElement.style.color = element.color;
      previewElement.style.textAlign = element.textAlign;
      previewElement.textContent = element.text;
      break;
      
    case 'button':
      previewElement.className += ' preview-button';
      previewElement.style.fontSize = `${element.fontSize}px`;
      previewElement.style.fontFamily = element.fontFamily;
      previewElement.style.color = element.color;
      previewElement.style.backgroundColor = element.backgroundColor;
      previewElement.style.border = 'none';
      previewElement.style.borderRadius = `${element.borderRadius}px`;
      previewElement.style.display = 'flex';
      previewElement.style.alignItems = 'center';
      previewElement.style.justifyContent = 'center';
      previewElement.style.cursor = 'pointer';
      previewElement.textContent = element.text;
      
      // Add hover effect
      previewElement.addEventListener('mouseenter', () => {
        previewElement.style.filter = 'brightness(1.1)';
      });
      previewElement.addEventListener('mouseleave', () => {
        previewElement.style.filter = 'none';
      });
      break;
      
    case 'container':
      previewElement.style.backgroundColor = element.backgroundColor;
      previewElement.style.border = `${element.borderWidth}px ${element.borderStyle} ${element.borderColor}`;
      previewElement.style.borderRadius = `${element.borderRadius}px`;
      break;
      
    case 'image':
      const asset = state.assets.find(a => a.id === element.assetId);
      if (asset) {
        const img = document.createElement('img');
        img.src = asset.url;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        previewElement.appendChild(img);
      }
      break;
      
    case 'sprite':
      const animation = state.animations.find(a => a.id === element.animationId);
      if (animation) {
        const img = document.createElement('img');
        img.src = animation.spriteSheetUrl;
        
        // Display the first frame
        if (animation.frames && animation.frames.length > 0) {
          const frame = animation.frames[0];
          img.style.objectFit = 'none';
          img.style.objectPosition = `-${frame.x}px -${frame.y}px`;
          img.style.width = `${frame.width}px`;
          img.style.height = `${frame.height}px`;
          
          // Scale to fit element dimensions
          const scaleX = element.width / frame.width;
          const scaleY = element.height / frame.height;
          img.style.transform = `scale(${scaleX}, ${scaleY})`;
          img.style.transformOrigin = 'top left';
        }
        
        previewElement.style.overflow = 'hidden';
        previewElement.appendChild(img);
        
        // Start animation if playing is true or animations are playing globally
        if (element.playing || state.animationsPlaying) {
          setupPreviewAnimation(previewElement, img, animation, element);
        }
      }
      break;
      
    case 'audio':
      // Audio elements don't need visual representation in preview
      return null;
  }
  
  return previewElement;
}

// Set up animation for preview
function setupPreviewAnimation(element, img, animation, elementData) {
  if (!animation.frames || animation.frames.length <= 1) return;
  
  let currentFrame = 0;
  const totalFrames = animation.frames.length;
  
  // Calculate frame duration based on speed
  const frameDuration = animation.frameDuration / (elementData.speed || 1);
  
  function updateFrame() {
    const frame = animation.frames[currentFrame];
    img.style.objectPosition = `-${frame.x}px -${frame.y}px`;
    
    currentFrame = (currentFrame + 1) % totalFrames;
    
    // If we've reached the end and loop is false, stop the animation
    if (currentFrame === 0 && !elementData.loop) {
      return;
    }
    
    // Continue animation
    setTimeout(updateFrame, frameDuration);
  }
  
  // Start the animation
  setTimeout(updateFrame, frameDuration);
}

// Set preview device size
function setPreviewDevice(device) {
  const previewContent = document.getElementById('preview-content');
  if (!previewContent) return;
  
  state.exportOptions.previewDevice = device;
  
  // Update device buttons
  if (domElements.previewMobileBtn) {
    domElements.previewMobileBtn.classList.toggle('active', device === 'mobile');
  }
  if (domElements.previewTabletBtn) {
    domElements.previewTabletBtn.classList.toggle('active', device === 'tablet');
  }
  if (domElements.previewDesktopBtn) {
    domElements.previewDesktopBtn.classList.toggle('active', device === 'desktop');
  }
  
  // Set scale based on device
  switch(device) {
    case 'mobile':
      previewContent.style.transform = 'scale(0.4)';
      break;
    case 'tablet':
      previewContent.style.transform = 'scale(0.6)';
      break;
    case 'desktop':
    default:
      previewContent.style.transform = 'scale(0.8)';
      break;
  }
  
  previewContent.style.transformOrigin = 'center';
}

// Align selected element
function alignSelectedElement(alignment) {
  if (!state.selectedElement) return;
  
  const element = state.selectedElement;
  const canvas = domElements.canvas;
  
  switch(alignment) {
    case 'left':
      element.x = 0;
      break;
    case 'center':
      element.x = (state.canvasSize.width - element.width) / 2;
      break;
    case 'right':
      element.x = state.canvasSize.width - element.width;
      break;
  }
  
  renderCanvasElements();
  updateElementProperties();
  addToUndoStack();
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
  // Check if no input element is focused
  if (document.activeElement === document.body) {
    // Undo: Ctrl+Z
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undo();
    }
    
    // Redo: Ctrl+Y or Ctrl+Shift+Z
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      redo();
    }
    
    // Delete: Delete key
    if (e.key === 'Delete' && state.selectedElement) {
      e.preventDefault();
      deleteSelectedElement();
    }
    
    // Copy: Ctrl+C
    if (e.ctrlKey && e.key === 'c' && state.selectedElement) {
      e.preventDefault();
      copySelectedElement();
    }
    
    // Paste: Ctrl+V
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault();
      pasteElement();
    }
    
    // Save: Ctrl+S
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveProject();
    }
    
    // Tool shortcuts
    switch (e.key) {
      case 'v':
        setActiveTool('move');
        break;
      case 's':
        setActiveTool('select');
        break;
      case 'r':
        setActiveTool('rotate');
        break;
    }
  }
}

// Delete an asset
function deleteAsset(assetId) {
  const confirm = window.confirm('Are you sure you want to delete this asset?');
  if (!confirm) return;
  
  // Find the asset
  const assetIndex = state.assets.findIndex(a => a.id === assetId);
  if (assetIndex === -1) return;
  
  // Get asset to check its type
  const asset = state.assets[assetIndex];
  
  // Remove the asset
  state.assets.splice(assetIndex, 1);
  
  // If it's a spritesheet, also remove its animations
  if (asset.type === 'spritesheet' && asset.animations) {
    state.animations = state.animations.filter(a => !asset.animations.includes(a.id));
  }
  
  // Remove any canvas elements using this asset
  state.canvasElements = state.canvasElements.filter(e => {
    if (e.type === 'image' || e.type === 'audio') {
      return e.assetId !== assetId;
    }
    return true;
  });
  
  // If it's the background music, clear that too
  if (state.audio.backgroundMusic === assetId) {
    state.audio.backgroundMusic = null;
  }
  
  // Update UI
  updateAssetLibrary();
  updateAnimationsList();
  renderCanvasElements();
  
  // Add to undo stack
  addToUndoStack();
}

// Delete selected element
function deleteSelectedElement() {
  if (!state.selectedElement) return;
  
  const elementIndex = state.canvasElements.findIndex(e => e.id === state.selectedElement.id);
  if (elementIndex === -1) return;
  
  // Remove the element
  state.canvasElements.splice(elementIndex, 1);
  
  // Clear selection
  deselectElement();
  
  // Update UI
  renderCanvasElements();
  
  // Add to undo stack
  addToUndoStack();
}

// Copy selected element
function copySelectedElement() {
  if (!state.selectedElement) return;
  
  // Store copy in localStorage (simple way to implement clipboard)
  localStorage.setItem('orangy-clipboard', JSON.stringify(state.selectedElement));
  
  showMessage('Element copied to clipboard.');
}

// Paste element
function pasteElement() {
  const clipboardData = localStorage.getItem('orangy-clipboard');
  if (!clipboardData) return;
  
  try {
    const elementData = JSON.parse(clipboardData);
    
    // Create a new element with the same properties but a new ID
    const newElement = {
      ...elementData,
      id: generateId(),
      x: elementData.x + 20, // Offset to make it visible
      y: elementData.y + 20,
      order: state.canvasElements.length
    };
    
    // Add to state
    state.canvasElements.push(newElement);
    
    // Update UI
    renderCanvasElements();
    selectElement(newElement.id);
    
    // Add to undo stack
    addToUndoStack();
    
  } catch (error) {
    console.error('Error pasting element:', error);
  }
}

// Preview an animation
function previewAnimation(animationId) {
  const animation = state.animations.find(a => a.id === animationId);
  if (!animation) return;
  
  // Create a modal to show the animation
  const modal = document.createElement('div');
  modal.className = 'modal show';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.width = '400px';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  
  const title = document.createElement('h2');
  title.textContent = `Animation: ${animation.name}`;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modalHeader.appendChild(title);
  modalHeader.appendChild(closeBtn);
  
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  modalBody.style.textAlign = 'center';
  
  const previewContainer = document.createElement('div');
  previewContainer.style.width = '300px';
  previewContainer.style.height = '200px';
  previewContainer.style.margin = '0 auto';
  previewContainer.style.position = 'relative';
  previewContainer.style.display = 'flex';
  previewContainer.style.alignItems = 'center';
  previewContainer.style.justifyContent = 'center';
  
  // Create image for animation preview
  const img = document.createElement('img');
  img.src = animation.spriteSheetUrl;
  
  // Display the first frame
  if (animation.frames && animation.frames.length > 0) {
    const frame = animation.frames[0];
    img.style.objectFit = 'none';
    img.style.objectPosition = `-${frame.x}px -${frame.y}px`;
    img.style.width = `${frame.width}px`;
    img.style.height = `${frame.height}px`;
  }
  
  previewContainer.appendChild(img);
  modalBody.appendChild(previewContainer);
  
  // Add controls
  const controls = document.createElement('div');
  controls.style.marginTop = '15px';
  
  const playBtn = document.createElement('button');
  playBtn.textContent = 'Play';
  playBtn.addEventListener('click', () => {
    if (animation.frames && animation.frames.length > 1) {
      let currentFrame = 0;
      const totalFrames = animation.frames.length;
      
      function updateFrame() {
        const frame = animation.frames[currentFrame];
        img.style.objectPosition = `-${frame.x}px -${frame.y}px`;
        
        currentFrame = (currentFrame + 1) % totalFrames;
        
        if (currentFrame !== 0) {
          setTimeout(updateFrame, animation.frameDuration);
        }
      }
      
      updateFrame();
    }
  });
  
  controls.appendChild(playBtn);
  modalBody.appendChild(controls);
  
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

// Show a message
function showMessage(message, type = 'info') {
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;
  
  // Add styles
  messageElement.style.position = 'fixed';
  messageElement.style.bottom = '20px';
  messageElement.style.right = '20px';
  messageElement.style.padding = '10px 15px';
  messageElement.style.borderRadius = '4px';
  messageElement.style.zIndex = '9999';
  messageElement.style.opacity = '0';
  messageElement.style.transition = 'opacity 0.3s';
  
  // Set type-specific styles
  switch(type) {
    case 'error':
      messageElement.style.backgroundColor = '#e74c3c';
      messageElement.style.color = 'white';
      break;
    case 'success':
      messageElement.style.backgroundColor = '#2ecc71';
      messageElement.style.color = 'white';
      break;
    case 'warning':
      messageElement.style.backgroundColor = '#f39c12';
      messageElement.style.color = 'white';
      break;
    default:
      messageElement.style.backgroundColor = '#347fc4';
      messageElement.style.color = 'white';
      break;
  }
  
  // Add to document
  document.body.appendChild(messageElement);
  
  // Fade in
  setTimeout(() => {
    messageElement.style.opacity = '1';
  }, 10);
  
  // Remove after delay
  setTimeout(() => {
    messageElement.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 300);
  }, 3000);
}

// Generate a unique ID
function generateId() {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Set up transform options
function setupTransformOptions() {
  const transformToolbar = document.createElement('div');
  transformToolbar.className = 'transform-options';
  transformToolbar.innerHTML = `
    <label class="transform-option">
      <input type="checkbox" id="proportionalScalingToggle" ${state.transformOptions.proportionalScaling ? 'checked' : ''}>
      <span>Proportional Scaling</span>
    </label>
  `;
  const toolbar = document.querySelector('.toolbar');
  if (toolbar) {
    toolbar.appendChild(transformToolbar);
  } else {
    console.warn('Toolbar element not found. Transform options not added.');
  }
}

// Toggle proportional scaling
function toggleProportionalScaling(e) {
  state.transformOptions.proportionalScaling = e.target.checked;
}

// Show new project modal with size options
function showNewProjectModal() {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>New Project</h2>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      <div class="size-presets">
        <h3>Select Size</h3>
        <div class="preset-grid">
          <div class="preset-item" data-width="800" data-height="600">
            <div class="preset-preview" style="width: 80px; height: 60px;"></div>
            <span>800 × 600</span>
          </div>
          <div class="preset-item" data-width="1280" data-height="720">
            <div class="preset-preview" style="width: 85px; height: 48px;"></div>
            <span>1280 × 720</span>
          </div>
          <div class="preset-item" data-width="1920" data-height="1080">
            <div class="preset-preview" style="width: 85px; height: 48px;"></div>
            <span>1920 × 1080</span>
          </div>
          <div class="preset-item" data-width="360" data-height="640">
            <div class="preset-preview" style="width: 40px; height: 71px;"></div>
            <span>360 × 640</span>
          </div>
        </div>
      </div>
      <div class="custom-size">
        <h3>Custom Size</h3>
        <div class="custom-size-inputs">
          <div class="input-group">
            <label>Width</label>
            <input type="number" id="customWidth" value="800" min="100" max="3840">
          </div>
          <div class="input-group">
            <label>Height</label>
            <input type="number" id="customHeight" value="600" min="100" max="2160">
          </div>
        </div>
      </div>
      <div class="template-selection">
        <h3>Templates</h3>
        <div class="template-grid">
          ${state.templates.list.map(template => `
            <div class="template-item" data-id="${template.id}">
              <div class="template-preview"></div>
              <span>${template.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="modal-actions">
        <button id="createProjectBtn" class="primary">Create Project</button>
        <button class="modal-cancel">Cancel</button>
      </div>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Setup event listeners for the modal
  modal.querySelector('.modal-close').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.querySelector('.modal-cancel').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Size preset selection
  modal.querySelectorAll('.preset-item').forEach(item => {
    item.addEventListener('click', () => {
      const width = parseInt(item.dataset.width);
      const height = parseInt(item.dataset.height);
      document.getElementById('customWidth').value = width;
      document.getElementById('customHeight').value = height;
      
      // Mark as selected
      modal.querySelectorAll('.preset-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
  });
  
  // Template selection
  modal.querySelectorAll('.template-item').forEach(item => {
    item.addEventListener('click', () => {
      modal.querySelectorAll('.template-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      state.templates.selected = item.dataset.id;
    });
  });
  
  // Create project button
  modal.querySelector('#createProjectBtn').addEventListener('click', () => {
    const width = parseInt(document.getElementById('customWidth').value);
    const height = parseInt(document.getElementById('customHeight').value);
    
    // Validate size
    if (width < 100 || height < 100 || width > 3840 || height > 2160) {
      showMessage('Invalid canvas size. Please use values between 100x100 and 3840x2160.', 'error');
      return;
    }
    
    createNewProject(width, height);
    document.body.removeChild(modal);
  });
}

// Create a new project with specified dimensions
function createNewProject(width, height) {
  if (state.project.modified) {
    const confirm = window.confirm('You have unsaved changes. Create a new project anyway?');
    if (!confirm) return;
  }
  
  // Reset state
  state.assets = [];
  state.animations = [];
  state.canvasElements = [];
  state.selectedElement = null;
  state.undoStack = [];
  state.redoStack = [];
  state.audio.backgroundMusic = null;
  
  // Set canvas size
  state.canvasSize.width = width || 800;
  state.canvasSize.height = height || 600;
  
  // Update canvas size
  if (domElements.canvas) {
    domElements.canvas.style.width = `${state.canvasSize.width}px`;
    domElements.canvas.style.height = `${state.canvasSize.height}px`;
  }
  
  // Apply template if selected
  if (state.templates.selected && state.templates.selected !== 'default') {
    applyTemplate(state.templates.selected);
  }
  
  // Reset project info
  state.project.name = 'Untitled Project';
  state.project.modified = false;
  
  // Update UI
  updateAssetLibrary();
  updateAnimationsList();
  renderCanvasElements();
  deselectElement();
  updateUndoRedoButtons();
  
  showMessage(`New project created (${width}x${height}).`);
}

// Apply a template to the current project
function applyTemplate(templateId) {
  const template = state.templates.list.find(t => t.id === templateId);
  if (!template) return;
  
  // Add template elements to canvas
  if (template.elements && template.elements.length > 0) {
    state.canvasElements = [...template.elements];
  }
}

// Select a template
function selectTemplate(templateId) {
  state.templates.selected = templateId;
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);