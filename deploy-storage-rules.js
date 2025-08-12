const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

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

async function deployStorageRules() {
  try {
    console.log('🚀 Deploying Firebase Storage rules...');
    console.log(`   Project: ${projectId}`);
    console.log(`   Bucket: ${bucketName}`);

    // Initialize storage
    const storage = new Storage({
      projectId: projectId,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
    });

    const bucket = storage.bucket(bucketName);

    // Read storage rules
    const rulesPath = path.join(__dirname, 'storage.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');

    // Set storage rules
    await bucket.setMetadata({
      metadata: {
        rules: rules
      }
    });

    console.log('✅ Storage rules deployed successfully!');
    console.log('   Image uploads should now work properly.');
    
    // Clean up
    fs.unlinkSync('deploy-storage-rules.js');
    
  } catch (error) {
    console.error('❌ Failed to deploy storage rules:', error.message);
    
    if (error.code === 'ENOENT') {
      console.error('   Make sure you have the Google Cloud SDK installed and configured.');
      console.error('   Run: gcloud auth application-default login');
    }
    
    if (error.code === 'PERMISSION_DENIED') {
      console.error('   Make sure you have the necessary permissions to modify storage rules.');
      console.error('   You may need to be an owner or have Storage Admin role.');
    }
  }
}

deployStorageRules();
