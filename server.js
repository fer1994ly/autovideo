import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Ensure videos directory exists in development
if (process.env.NODE_ENV !== 'production') {
    const videosDir = path.join(__dirname, 'videos');
    try {
        await fs.access(videosDir);
    } catch {
        await fs.mkdir(videosDir);
        console.log('Created videos directory');
    }
}

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/save-video', async (req, res) => {
    try {
        const { videoUrl, filename } = req.body;
        
        // In production (Vercel), we'll just return the video URL
        if (process.env.NODE_ENV === 'production') {
            res.json({ success: true, url: videoUrl });
            return;
        }

        // In development, save to local filesystem
        const response = await fetch(videoUrl);
        const arrayBuffer = await response.arrayBuffer();
        const outputPath = path.join(__dirname, 'videos', filename);
        
        await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
        console.log(`Video saved to: ${outputPath}`);
        
        res.json({ success: true, path: outputPath });
    } catch (error) {
        console.error('Error saving video:', error);
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 