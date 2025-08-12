#!/bin/bash

echo "🚀 Fixing Firebase Storage CORS configuration..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "   Install it with: npm install -g firebase-tools"
    echo "   Then run: firebase login"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged into Firebase. Please run: firebase login"
    exit 1
fi

# Get project ID from environment or prompt user
PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID:-""}
if [ -z "$PROJECT_ID" ]; then
    echo "❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID not set in .env.local"
    echo "   Please set it and try again."
    exit 1
fi

echo "✅ Using Firebase project: $PROJECT_ID"

# Create temporary CORS config
cat > cors.json << EOF
[
  {
    "origin": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers"]
  }
]
EOF

echo "📝 Created CORS configuration..."

# Apply CORS configuration
echo "🔧 Applying CORS configuration to Firebase Storage..."
gsutil cors set cors.json gs://$PROJECT_ID.appspot.com

if [ $? -eq 0 ]; then
    echo "✅ CORS configuration applied successfully!"
    echo "   Image uploads should now work properly."
else
    echo "❌ Failed to apply CORS configuration."
    echo "   You may need to be an owner or have Storage Admin role."
fi

# Clean up
rm cors.json
rm fix-storage-cors.sh

echo "🧹 Cleaned up temporary files."
echo "🎉 Done! Try uploading images now."
