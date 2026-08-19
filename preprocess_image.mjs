import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';

async function processImage() {
  const inputPath = 'public/assets/god.jpeg';
  const outputPath = 'public/assets/god_processed.png';

  try {
    const imageBuffer = fs.readFileSync(inputPath);
    // Remove background, it returns a Blob
    const blob = await removeBackground(imageBuffer);
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(outputPath, buffer);
    console.log('Background removed successfully.');
  } catch (error) {
    console.error('Error removing background:', error);
  }
}

processImage();
