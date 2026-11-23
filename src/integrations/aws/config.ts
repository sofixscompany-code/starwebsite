import { initializeApp, getApps, getApp } from "./app";
import { getAuth } from "./auth";
import { getFirestore } from "./firestore";
import { getStorage } from "./storage";
import { awsConfig, validateConfig } from "./runtime";

/**
 * Firebase-style config surface retained so the rest of the app doesn't change.
 * Values now point at the AWS API / S3 CloudFront endpoints.
 */
export const firebaseConfig = {
  apiKey: awsConfig.apiUrl,
  authDomain: awsConfig.apiUrl,
  projectId: "star-coaching-aws",
  storageBucket: awsConfig.mediaBase,
  userPoolId: awsConfig.userPoolId,
  appClientId: awsConfig.appClientId,
};

export { validateConfig, awsConfig };

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
