// Simple icon generator for PWA
// This creates basic SVG icons that can be used as placeholders

const fs = require('fs');
const path = require('path');

// Create basic SVG icon
function createMedicalIcon(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2E7D95;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4A90A4;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background Circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#grad)"/>
  
  <!-- Medical Cross -->
  <rect x="${size*0.4}" y="${size*0.2}" width="${size*0.2}" height="${size*0.6}" fill="white" rx="${size*0.02}"/>
  <rect x="${size*0.2}" y="${size*0.4}" width="${size*0.6}" height="${size*0.2}" fill="white" rx="${size*0.02}"/>
  
  <!-- Heart accent -->
  <path d="M${size*0.5} ${size*0.75} 
           Q${size*0.45} ${size*0.7} ${size*0.4} ${size*0.75}
           Q${size*0.4} ${size*0.8} ${size*0.45} ${size*0.8}
           L${size*0.5} ${size*0.85}
           L${size*0.55} ${size*0.8}
           Q${size*0.6} ${size*0.8} ${size*0.6} ${size*0.75}
           Q${size*0.55} ${size*0.7} ${size*0.5} ${size*0.75} Z" 
        fill="white" opacity="0.8"/>
</svg>`;
}

// Icon sizes for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
iconSizes.forEach(size => {
  const svgContent = createMedicalIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

// Create a basic PNG fallback by creating an HTML canvas version
const canvasScript = `
<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator</title>
</head>
<body>
    <canvas id="canvas" width="192" height="192"></canvas>
    
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 192, 192);
        gradient.addColorStop(0, '#2E7D95');
        gradient.addColorStop(1, '#4A90A4');
        
        // Draw background circle
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(96, 96, 96, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw medical cross
        ctx.fillStyle = 'white';
        ctx.fillRect(77, 38, 38, 115); // vertical bar
        ctx.fillRect(38, 77, 115, 38); // horizontal bar
        
        // Convert to blob and download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'icon-192x192.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(iconsDir, 'generate-png.html'), canvasScript);

console.log('✅ PWA icons generated successfully!');
console.log('📝 To generate PNG icons, open public/icons/generate-png.html in a browser');
console.log('🎯 SVG icons are ready to use for the PWA manifest');