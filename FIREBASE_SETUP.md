# Firebase Setup & Database Connection Guide

## 🔥 Overview

This guide ensures your Firebase database is properly connected and all required collections, indexes, and data structures are created for the Fitness Challenge Platform.

## 📋 Prerequisites

1. **Firebase Project** - Create a project at [Firebase Console](https://console.firebase.google.com/)
2. **Service Account** - Download your Firebase Admin SDK service account key
3. **Environment Variables** - Set up your `.env.local` file

## 🚀 Quick Setup

### 1. Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false

# Firebase Admin (server)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

### 2. Install Dependencies

```bash
npm install firebase-admin dotenv
```

### 3. Test Connection

```bash
node scripts/test-firebase-connection.js
```

### 4. Initialize Database

```bash
node scripts/init-firebase-db.js
```

## 🗄️ Database Structure

### Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `challenges` | Fitness challenges | `id`, `name`, `status`, `durationDays` |
| `users` | User profiles | `uid`, `email`, `role`, `stats` |
| `enrolments` | Challenge participation | `id`, `userId`, `challengeId`, `progress` |
| `checkins` | Daily check-ins | `id`, `userId`, `challengeId`, `date` |

### Required Indexes

The following indexes are defined in `firestore.indexes.json`:

- **Challenges**: `status + startDate`, `challengeType + status`, `status + createdAt`
- **Checkins**: `userId + challengeId + date`, `challengeId + date`
- **Enrolments**: `status + createdAt`

## 🔧 Firebase Configuration Files

### 1. Firestore Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Development mode - allow all operations for testing
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 2. Storage Rules (`storage.rules`)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // Development mode
    }
  }
}
```

### 3. Indexes (`firestore.indexes.json`)

Pre-configured indexes for optimal query performance.

## 🧪 Testing Your Setup

### 1. Connection Test

```bash
node scripts/test-firebase-connection.js
```

**Expected Output:**
```
🧪 Testing Firebase Connection...

📋 Environment Variables Check:
  ✅ FIREBASE_PROJECT_ID: your_project_id
  ✅ FIREBASE_CLIENT_EMAIL: ***SET***
  ✅ FIREBASE_PRIVATE_KEY: ***SET***
  ✅ FIREBASE_STORAGE_BUCKET: your_project.appspot.com

✅ All environment variables are set

🚀 Testing Firebase Admin initialization...
✅ Firebase Admin initialized successfully

🔥 Testing Firestore connection...
✅ Firestore connected successfully
  📊 Found 0 challenges in database

💾 Testing Storage connection...
✅ Storage connected successfully
  🪣 Bucket: your_project.appspot.com

🔧 Testing basic operations...
  👥 Users collection: 0 documents
  📋 Enrolments collection: 0 documents
  ✅ Checkins collection: 0 documents
✅ Basic operations test passed

🎉 Firebase Connection Test Complete!
```

### 2. Database Initialization

```bash
node scripts/init-firebase-db.js
```

**Expected Output:**
```
🚀 Initializing Firebase Database...

📚 Creating collections and sample data...
  Creating collection: challenges
    ✅ Created document: sample_challenge
  Creating collection: users
    ✅ Created document: sample_user
  Creating collection: enrolments
    ✅ Created document: sample_enrolment
  Creating collection: checkins
    ✅ Created document: sample_checkin
✅ Collections initialized successfully!

🔍 Verifying collections...
  📊 challenges: 1 documents
  📊 users: 1 documents
  📊 enrolments: 1 documents
  📊 checkins: 1 documents

📋 Checking Firestore indexes...
  Note: Indexes are managed via firestore.indexes.json
  Run "firebase deploy --only firestore:indexes" to deploy indexes

🎉 Firebase Database initialization complete!
```

## 🚀 Deployment

### 1. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 2. Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

### 3. Deploy Storage Rules

```bash
firebase deploy --only storage
```

### 4. Deploy Everything

```bash
firebase deploy
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Missing Firebase Admin credentials"

**Solution:** Ensure your `.env.local` file has all required Firebase Admin variables.

#### 2. "Permission denied" errors

**Solution:** Check your Firestore rules and ensure they allow the operations you're trying to perform.

#### 3. "Invalid data" errors

**Solution:** The application now includes better data validation and prevents undefined values from being sent to Firebase.

#### 4. Connection timeouts

**Solution:** Check your internet connection and Firebase project status.

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=true
LOG_LEVEL=debug
```

## 📊 Monitoring

### Firebase Console

- **Firestore Database**: Monitor collections and documents
- **Storage**: Check file uploads and usage
- **Authentication**: View user accounts and sessions
- **Functions**: Monitor serverless function execution

### Application Logs

The application now includes comprehensive logging for Firebase operations:

- Data being sent to Firebase
- Error details with specific error codes
- Connection status and performance metrics

## ✅ Verification Checklist

- [ ] Environment variables set in `.env.local`
- [ ] Firebase connection test passes
- [ ] Database initialization successful
- [ ] Firestore rules deployed
- [ ] Indexes deployed
- [ ] Storage rules deployed
- [ ] Application can read/write to Firebase
- [ ] Challenge settings save without errors

## 🎯 Next Steps

1. **Test the application** - Try creating and editing challenges
2. **Monitor performance** - Check Firebase console for any issues
3. **Scale up** - Add more complex queries and data structures as needed
4. **Security** - Implement proper authentication and authorization rules

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Firebase console logs
3. Check application console for error details
4. Verify environment variables are correct
5. Ensure Firebase project is active and billing is set up

---

**🎉 Your Firebase setup is now complete and ready for the Fitness Challenge Platform!**
