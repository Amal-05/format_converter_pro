const sharp = require('sharp');
const path = require('path');

async function convertImage(file, targetFormat, settings) {
    const inputPath = file.path;
    const outputFilename = `converted-${Date.now()}.${targetFormat}`;
    const outputPath = path.join(__dirname, '../temp', outputFilename);

    let transformer = sharp(inputPath);

    // Apply settings
    if (settings && (settings.width || settings.height)) {
        transformer = transformer.resize({
            width: settings.width ? parseInt(settings.width) : null,
            height: settings.height ? parseInt(settings.height) : null,
            fit: 'inside' // Maintain aspect ratio without cropping
        });
    }

    await transformer.toFormat(targetFormat).toFile(outputPath);
    return outputPath;
}

module.exports = { convertImage };
