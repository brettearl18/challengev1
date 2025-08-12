const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!projectId || !bucketName) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_FIREBASE_PROJECT_ID:', projectId ? '✅ Set' : '❌ Missing');
  console.error('   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', bucketName ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

async function deployCorsConfig() {
  try {
    console.log('🚀 Deploying CORS configuration to Firebase Storage...');
    console.log(`   Project: ${projectId}`);
    console.log(`   Bucket: ${bucketName}`);

    // Initialize storage
    const storage = new Storage({
      projectId: projectId,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
    });

    const bucket = storage.bucket(bucketName);

    // Read CORS configuration
    const corsConfig = JSON.parse(fs.readFileSync('firebase-storage-config.json', 'utf8'));

    // Set CORS configuration
    await bucket.setCorsConfiguration(corsConfig);

    console.log('✅ CORS configuration deployed successfully!');
    console.log('   Image uploads should now work properly.');
    
    // Clean up
    fs.unlinkSync('firebase-storage-config.json');
    fs.unlinkSync('deploy-storage-cors.js');
    
  } catch (error) {
    console.error('❌ Failed to deploy CORS configuration:', error.message);
    
    if (error.code === 'ENOENT') {
      console.error('   Make sure you have the Google Cloud SDK installed and configured.');
      console.error('   Run: gcloud auth application-default login');
    }
    
    if (error.code === 'PERMISSION_DENIED') {
      console.error('   Make sure you have the necessary permissions to modify storage bucket CORS.');
      console.error('   You may need to be an owner or have Storage Admin role.');
    }
  }
}

deployCorsConfig();
