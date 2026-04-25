const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

async function convertVideo(file, targetFormat, settings) {
    return new Promise((resolve, reject) => {
        const inputPath = file.path;
        const outputFilename = `converted-${Date.now()}.${targetFormat}`;
        const outputPath = path.join(__dirname, '../temp', outputFilename);

        let command = ffmpeg(inputPath);

        if (settings && settings.startTime) {
            command = command.setStartTime(settings.startTime);
        }
        if (settings && settings.endTime) {
            const start = settings.startTime ? parseFloat(settings.startTime) : 0;
            const end = parseFloat(settings.endTime);
            if (!isNaN(end) && end > start) {
                command = command.setDuration(end - start);
            }
        }

        command
            .output(outputPath)
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(new Error(`Video conversion failed: ${err.message}`)))
            .run();
    });
}

module.exports = { convertVideo };
