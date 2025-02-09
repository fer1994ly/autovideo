import { client } from "@gradio/client";
import fs from 'fs/promises';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateVideo() {
    try {
        // Create videos directory if it doesn't exist
        const videosDir = path.join(__dirname, 'videos');
        try {
            await fs.access(videosDir);
        } catch {
            await fs.mkdir(videosDir);
            console.log('Created videos directory');
        }

        const app = await client("KingNish/Instant-Video");
        console.log("Connected to Instant-Video API");
        
        const result = await app.predict("/instant_video", [
            "A Hospital scene",
            "Realistic",
            "guoyww/animatediff-motion-lora-zoom-in",
            4
        ]);
        
        console.log("Video generation completed");
        
        // Extract the video data and save it with timestamp
        const videoData = result.data[0].video;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const videoName = `generated_video_${timestamp}.mp4`;
        const outputPath = path.join(videosDir, videoName);
        
        // The video data is a blob URL, we need to fetch it first
        const response = await fetch(videoData.url);
        const arrayBuffer = await response.arrayBuffer();
        await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
        
        console.log(`Video saved to: ${outputPath}`);
        
        // Open the video with the default video player
        const command = process.platform === 'win32' 
            ? `start "${outputPath}"`
            : process.platform === 'darwin'
            ? `open "${outputPath}"`
            : `xdg-open "${outputPath}"`;
            
        exec(command, (error) => {
            if (error) {
                console.error('Error opening video:', error);
            } else {
                console.log('Video opened in default player');
            }
        });
        
        return outputPath;
    } catch (error) {
        console.error("Error generating video:", error);
    }
}

generateVideo(); 
