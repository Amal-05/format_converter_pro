import { createIcons, Zap, Image as ImageIcon, Video, FileText, ArrowLeft, UploadCloud, Trash2, Download, AlertTriangle, Sun, Moon } from 'lucide';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

// Initialize Lucide icons
createIcons({
  icons: { Zap, Image: ImageIcon, Video, FileText, ArrowLeft, UploadCloud, Trash2, Download, AlertTriangle, Sun, Moon }
});

const FORMATS = {
  image: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff'],
  video: ['mp4', 'mkv', 'avi', 'mov', 'webm'],
  document: ['pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'html', 'md', 'xlsx', 'xls', 'ods', 'csv', 'pptx', 'ppt', 'odp', 'epub', 'mobi']
};

let currentCategory = null;
let uploadedFiles = [];

// DOM Elements
const views = {
  home: document.getElementById('home'),
  converter: document.getElementById('converter'),
  contact: document.getElementById('contact')
};

const navBtns = document.querySelectorAll('.nav-btn');

const cards = document.querySelectorAll('.category-card');
const backBtn = document.querySelector('.back-btn');
const converterTitle = document.getElementById('converter-title');
const categoryIndicator = document.querySelector('.category-indicator');

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const fileList = document.getElementById('file-list');

const formatSelect = document.getElementById('format-select');
const settingGroups = document.querySelectorAll('.setting-group');
const convertBtn = document.getElementById('convert-btn');

const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

const resultSection = document.getElementById('result-section');
const resultList = document.getElementById('result-list');
const toastEl = document.getElementById('toast');

// --- Navigation ---
function switchView(viewName) {
  Object.values(views).forEach(v => {
    if(v) v.classList.add('hidden');
  });
  if(views[viewName]) {
    views[viewName].classList.remove('hidden');
    views[viewName].classList.add('active');
  }
  
  navBtns.forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.nav-btn[data-target="${viewName}"]`);
  if(activeBtn) activeBtn.classList.add('active');
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    switchView(btn.dataset.target);
  });
});

// --- Theme Toggle ---
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
let isLightMode = false;

themeToggle.addEventListener('click', () => {
  isLightMode = !isLightMode;
  document.body.classList.toggle('light-mode', isLightMode);
  
  if (isLightMode) {
    themeIcon.setAttribute('data-lucide', 'moon');
  } else {
    themeIcon.setAttribute('data-lucide', 'sun');
  }
  
  // Re-initialize the specific icon to update it
  createIcons({
    icons: { Sun, Moon },
    nameAttr: 'data-lucide'
  });
});

cards.forEach(card => {
  card.addEventListener('click', () => {
    currentCategory = card.dataset.category;
    setupConverterUI(currentCategory);
    switchView('converter');
  });
});

backBtn.addEventListener('click', () => {
  switchView('home');
  resetConverter();
});

// --- Converter Setup ---
function setupConverterUI(category) {
  converterTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Converter`;
  
  categoryIndicator.className = 'category-indicator ' + category;
  
  // Populate Formats
  formatSelect.innerHTML = FORMATS[category].map(f => `<option value="${f}">${f.toUpperCase()}</option>`).join('');
  
  // Show right settings
  settingGroups.forEach(g => g.classList.add('hidden'));
  document.getElementById(`${category}-settings`).classList.remove('hidden');

  // Update file input accept attribute
  const acceptExtensions = FORMATS[category].map(ext => `.${ext}`).join(',');
  fileInput.setAttribute('accept', acceptExtensions);
}

function resetConverter() {
  currentCategory = null;
  uploadedFiles = [];
  updateFileListUI();
  resultSection.classList.add('hidden');
  progressContainer.classList.add('hidden');
}

// --- Drag & Drop ---
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropzone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'), false);
});

dropzone.addEventListener('drop', (e) => {
  handleFiles(e.dataTransfer.files);
});

browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', function() {
  handleFiles(this.files);
});

function handleFiles(files) {
  const validExtensions = FORMATS[currentCategory];
  const newFiles = [];
  let invalidCount = 0;

  Array.from(files).forEach(file => {
    // Extract file extension and convert to lowercase
    const ext = file.name.split('.').pop().toLowerCase();
    
    // Check if the extension is allowed for the current category
    if (validExtensions.includes(ext)) {
      newFiles.push(file);
    } else {
      invalidCount++;
    }
  });

  if (invalidCount > 0) {
    showToast(`Rejected ${invalidCount} file(s). Only valid ${currentCategory} formats are allowed.`, 'error');
  }

  uploadedFiles = [...uploadedFiles, ...newFiles];
  updateFileListUI();
}

function removeFile(index) {
  uploadedFiles.splice(index, 1);
  updateFileListUI();
}

function updateFileListUI() {
  if (uploadedFiles.length === 0) {
    fileList.classList.add('hidden');
    convertBtn.classList.add('disabled');
    return;
  }
  
  fileList.classList.remove('hidden');
  convertBtn.classList.remove('disabled');
  
  fileList.innerHTML = uploadedFiles.map((f, i) => `
    <div class="file-item">
      <div class="file-info">
        <i data-lucide="file" class="w-5 h-5"></i>
        <span>${f.name}</span>
      </div>
      <button class="remove-file" onclick="window.removeFile(${i})">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    </div>
  `).join('');
  
  // Re-init newly added icons
  createIcons({
    icons: { Trash2, FileText: File },
    nameAttr: 'data-lucide'
  });
}

// Make removeFile globally accessible for inline onclick
window.removeFile = removeFile;

// --- Client Side Conversion Engines ---

async function loadFFmpeg() {
  if (!ffmpeg.loaded) {
    progressText.textContent = 'Loading FFmpeg Engine (this may take a moment)...';
    await ffmpeg.load({
      coreURL: `https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js`,
      wasmURL: `https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm`,
    });
  }
}

async function convertImageClient(file, targetFormat, settings) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (settings.width && !settings.height) {
        width = parseInt(settings.width);
        height = Math.round(img.height * (width / img.width));
      } else if (!settings.width && settings.height) {
        height = parseInt(settings.height);
        width = Math.round(img.width * (height / img.height));
      } else if (settings.width && settings.height) {
        width = parseInt(settings.width);
        height = parseInt(settings.height);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      let mimeType = `image/${targetFormat}`;
      if (targetFormat === 'jpg') mimeType = 'image/jpeg';
      
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Canvas conversion failed. Unsupported format?'));
        const convertedUrl = URL.createObjectURL(blob);
        resolve({
          originalName: file.name,
          convertedName: `converted-${Date.now()}.${targetFormat}`,
          downloadUrl: convertedUrl
        });
      }, mimeType, 0.9);
    };
    img.onerror = () => reject(new Error('Failed to load image for conversion'));
    img.src = url;
  });
}

async function convertVideoClient(file, targetFormat, settings) {
  await loadFFmpeg();
  
  ffmpeg.on('progress', ({ progress, time }) => {
    progressBar.style.width = `${Math.round(progress * 100)}%`;
    progressText.textContent = `Converting Video: ${Math.round(progress * 100)}%`;
  });

  const inputName = file.name.replace(/\s+/g, '_');
  const outputName = `converted-${Date.now()}.${targetFormat}`;
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const args = ['-i', inputName];
  if (settings.startTime) {
    args.push('-ss', settings.startTime);
  }
  if (settings.endTime) {
    const start = settings.startTime ? parseFloat(settings.startTime) : 0;
    const end = parseFloat(settings.endTime);
    if (!isNaN(end) && end > start) {
      args.push('-t', (end - start).toString());
    }
  }
  args.push(outputName);

  progressText.textContent = 'Processing Video...';
  await ffmpeg.exec(args);

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data.buffer], { type: `video/${targetFormat}` });
  const downloadUrl = URL.createObjectURL(blob);

  // cleanup
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  return {
    originalName: file.name,
    convertedName: outputName,
    downloadUrl
  };
}

// --- Conversion Logic ---
convertBtn.addEventListener('click', async () => {
  if (uploadedFiles.length === 0 || convertBtn.classList.contains('disabled')) return;
  
  const targetFormat = formatSelect.value;
  
  // Gather Settings
  let settings = {};
  if (currentCategory === 'image') {
    settings.width = document.getElementById('img-width').value;
    settings.height = document.getElementById('img-height').value;
  } else if (currentCategory === 'video') {
    settings.startTime = document.getElementById('vid-start').value;
    settings.endTime = document.getElementById('vid-end').value;
  }

  // UI state
  convertBtn.classList.add('disabled');
  progressContainer.classList.remove('hidden');
  progressBar.style.width = '10%';
  progressText.textContent = 'Starting Conversion...';
  resultSection.classList.add('hidden');

  try {
    let convertedFilesData = [];

    if (currentCategory === 'image' || currentCategory === 'video') {
      // Client-side WASM / Canvas
      for (const file of uploadedFiles) {
        let result;
        if (currentCategory === 'image') {
          progressText.textContent = `Converting ${file.name}...`;
          result = await convertImageClient(file, targetFormat, settings);
        } else {
          result = await convertVideoClient(file, targetFormat, settings);
        }
        convertedFilesData.push(result);
      }
    } else {
      // Fallback to server for documents (requires LibreOffice)
      const formData = new FormData();
      formData.append('category', currentCategory);
      formData.append('targetFormat', targetFormat);
      formData.append('settings', JSON.stringify(settings));
      uploadedFiles.forEach(f => formData.append('files', f));

      progressText.textContent = 'Uploading and Converting on Server...';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/api/convert`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server conversion failed');
      convertedFilesData = data.files;
    }

    progressBar.style.width = '100%';
    progressText.textContent = 'Complete!';
    showToast('Conversion successful!', 'success');
    
    displayResults(convertedFilesData);

  } catch (error) {
    console.error(error);
    progressBar.style.width = '0%';
    progressContainer.classList.add('hidden');
    showToast(error.message, 'error');
  } finally {
    convertBtn.classList.remove('disabled');
    setTimeout(() => {
      progressContainer.classList.add('hidden');
      progressBar.style.width = '0%';
    }, 2000);
  }
});

function displayResults(files) {
  resultSection.classList.remove('hidden');
  resultList.innerHTML = files.map(f => `
    <div class="result-item">
      <span>${f.originalName} &rarr; ${f.convertedName}</span>
      <a href="${f.downloadUrl}" class="download-link" download>
        Download
      </a>
    </div>
  `).join('');
}

// --- Toast ---
let toastTimeout;
function showToast(msg, type = 'success') {
  toastEl.textContent = msg;
  toastEl.className = `toast ${type}`;
  
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 3000);
}

// --- Contact Form ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.classList.add('disabled');

    const formData = new FormData(contactForm);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      });
      const data = await res.json();
      
      if (res.status === 200) {
        showToast('Message sent successfully! We will get back to you soon.', 'success');
        contactForm.reset();
      } else {
        showToast(data.message || 'Something went wrong!', 'error');
      }
    } catch (error) {
      showToast('Error sending message. Try again later.', 'error');
    } finally {
      btn.textContent = originalText;
      btn.classList.remove('disabled');
    }
  });
}
