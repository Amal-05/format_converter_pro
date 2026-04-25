const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const imageService = require('../services/imageService');
const videoService = require('../services/videoService');
const documentService = require('../services/documentService');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../temp'));
    },
    filename: (req, file, cb) => {
        // Sanitize original filename to prevent issues
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const upload = multer({ storage });

router.post('/convert', upload.array('files'), async (req, res) => {
    try {
        const { category, targetFormat, settings } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const convertedFiles = [];
        const parsedSettings = settings ? JSON.parse(settings) : {};

        for (const file of files) {
            let resultPath;
            const originalExt = path.extname(file.originalname).toLowerCase();
            
            // Category Matching Rules
            if (category === 'image') {
                const validImageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.avif', '.heic'];
                if (!validImageExts.includes(originalExt)) {
                    throw new Error(`Invalid conversion: ${originalExt} is not an image format allowed in Image Converter`);
                }
                resultPath = await imageService.convertImage(file, targetFormat, parsedSettings);
            } else if (category === 'video') {
                const validVideoExts = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv'];
                if (!validVideoExts.includes(originalExt)) {
                    throw new Error(`Invalid conversion: ${originalExt} is not a video format allowed in Video Converter`);
                }
                resultPath = await videoService.convertVideo(file, targetFormat, parsedSettings);
            } else if (category === 'document') {
                const validDocExts = ['.pdf', '.docx', '.doc', '.odt', '.rtf', '.txt', '.html', '.md', '.xlsx', '.xls', '.ods', '.csv', '.pptx', '.ppt', '.odp', '.epub', '.mobi'];
                if (!validDocExts.includes(originalExt)) {
                    throw new Error(`Invalid conversion: ${originalExt} is not a document format allowed in Document Converter`);
                }
                resultPath = await documentService.convertDocument(file, targetFormat, parsedSettings);
            } else {
                throw new Error('Invalid category selected');
            }

            convertedFiles.push({
                originalName: file.originalname,
                convertedName: path.basename(resultPath),
                downloadUrl: `http://localhost:3000/api/download/${path.basename(resultPath)}`
            });
            
            // Clean up original uploaded file
            if(fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }

        res.json({ success: true, files: convertedFiles });
    } catch (error) {
        console.error('Conversion Error:', error);
        
        // Cleanup original files on error
        if (req.files) {
            req.files.forEach(f => {
                if(fs.existsSync(f.path)) fs.unlinkSync(f.path);
            });
        }
        res.status(500).json({ error: error.message || 'Conversion failed' });
    }
});

router.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../temp', req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath, (err) => {
            if (!err) {
                // Delete after download to save space
                try {
                    fs.unlinkSync(filePath);
                } catch(e) {
                    console.error("Failed to delete after download", e);
                }
            }
        });
    } else {
        res.status(404).json({ error: 'File not found or already downloaded' });
    }
});

module.exports = router;
