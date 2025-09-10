#!/usr/bin/env node

/**
 * MediTeach AI - Deployment Verification Script
 * This script verifies that the built application is ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 MediTeach AI - Deployment Verification\n');

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
    console.error('❌ Error: dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
}

console.log('✅ dist/ directory found');

// Check required files
const requiredFiles = [
    'index.html',
    '_redirects',
    'assets',
    'manifest.json',
    'sw.js'
];

let allFilesPresent = true;
requiredFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} found`);
    } else {
        console.error(`❌ Missing: ${file}`);
        allFilesPresent = false;
    }
});

// Check asset files
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
    const assets = fs.readdirSync(assetsPath);
    const jsFiles = assets.filter(f => f.endsWith('.js'));
    const cssFiles = assets.filter(f => f.endsWith('.css'));
    
    console.log(`✅ Found ${jsFiles.length} JavaScript file(s)`);
    console.log(`✅ Found ${cssFiles.length} CSS file(s)`);
    
    if (jsFiles.length === 0 || cssFiles.length === 0) {
        console.error('❌ Missing essential asset files');
        allFilesPresent = false;
    }
} else {
    console.error('❌ assets/ directory missing');
    allFilesPresent = false;
}

// Check _redirects content
const redirectsPath = path.join(distPath, '_redirects');
if (fs.existsSync(redirectsPath)) {
    const redirectsContent = fs.readFileSync(redirectsPath, 'utf8').trim();
    if (redirectsContent.includes('/*    /index.html   200')) {
        console.log('✅ SPA routing configured correctly');
    } else {
        console.error('❌ Invalid _redirects configuration');
        allFilesPresent = false;
    }
}

// Check index.html content
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    if (indexContent.includes('MediTeach AI')) {
        console.log('✅ index.html contains app title');
    } else {
        console.warn('⚠️  App title not found in index.html');
    }
    
    if (indexContent.includes('script') && indexContent.includes('link')) {
        console.log('✅ Assets properly linked in HTML');
    } else {
        console.error('❌ Missing asset links in HTML');
        allFilesPresent = false;
    }
}

// File size check
console.log('\n📊 Bundle Analysis:');
try {
    const stats = fs.statSync(indexPath);
    console.log(`📄 index.html: ${(stats.size / 1024).toFixed(2)} KB`);
    
    const assetsDir = fs.readdirSync(assetsPath);
    assetsDir.forEach(file => {
        const filePath = path.join(assetsPath, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`📦 ${file}: ${sizeKB} KB`);
    });
} catch (error) {
    console.warn('⚠️  Could not analyze bundle sizes');
}

// Configuration files check
console.log('\n🔧 Configuration Files:');
const configFiles = {
    'wrangler.toml': 'Cloudflare Pages configuration',
    'package.json': 'NPM package configuration',
    '_redirects': 'SPA routing (should be in dist/)'
};

Object.entries(configFiles).forEach(([file, description]) => {
    const filePath = path.join(__dirname, file === '_redirects' ? `dist/${file}` : file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}: ${description}`);
    } else {
        console.error(`❌ Missing: ${file} (${description})`);
        if (file !== '_redirects') allFilesPresent = false;
    }
});

// Final verdict
console.log('\n' + '='.repeat(50));
if (allFilesPresent) {
    console.log('🎉 DEPLOYMENT READY!');
    console.log('✅ All required files are present and configured correctly');
    console.log('🚀 You can now deploy to Cloudflare Pages or GitHub Pages');
    console.log('\nDeployment options:');
    console.log('1. Cloudflare Pages: https://dash.cloudflare.com/pages');
    console.log('2. GitHub Pages: Repository Settings → Pages');
    console.log('3. Wrangler CLI: wrangler pages deploy dist --project-name mediteach-ai');
} else {
    console.log('❌ DEPLOYMENT NOT READY');
    console.log('Please fix the issues above before deploying.');
    process.exit(1);
}