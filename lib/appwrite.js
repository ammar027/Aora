import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.am.aora",
  projectId: "6713a0ad0032dcb430c8",
  storageId: "6713c3da0030c1f7b8f1",
  databaseId: "6713c1c1002c565a6327",
  userCollectionId: "6713c1e30000f4cc1c95",
  videoCollectionId: "6713c21b0011afb445f2",
};

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register user
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(ID.unique(), email, password, username);
    
    const avatarUrl = avatars.getInitials(username);
    await signIn(email, password); // Sign in immediately after registration

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error.message || "Failed to create user");
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    return await account.createEmailSession(email, password);
  } catch (error) {
    throw new Error(error.message || "Sign in failed");
  }
}

// Get Account
export async function getAccount() {
  try {
    return await account.get();
  } catch (error) {
    throw new Error(error.message || "Failed to get account");
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    return currentUser.documents[0] || null;
  } catch (error) {
    console.error(error);
    return null; // Return null on error for a more graceful handling
  }
}

// Sign Out
export async function signOut() {
  try {
    return await account.deleteSession("current");
  } catch (error) {
    throw new Error(error.message || "Sign out failed");
  }
}

// Upload File
export async function uploadFile(file) {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = { type: mimeType, ...rest };

  try {
    const uploadedFile = await storage.createFile(appwriteConfig.storageId, ID.unique(), asset);
    return await getFilePreview(uploadedFile.$id, mimeType.startsWith("video") ? "video" : "image");
  } catch (error) {
    throw new Error(error.message || "File upload failed");
  }
}

// Get File Preview
export async function getFilePreview(fileId, type) {
  try {
    return type === "video"
      ? storage.getFileView(appwriteConfig.storageId, fileId)
      : storage.getFilePreview(appwriteConfig.storageId, fileId, 2000, 2000, "top", 100);
  } catch (error) {
    throw new Error(error.message || "Failed to get file preview");
  }
}

// Create Video Post
export async function createVideoPost(form) {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail),
      uploadFile(form.video),
    ]);

    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );
  } catch (error) {
    throw new Error(error.message || "Failed to create video post");
  }
}

// Get all video Posts
export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.videoCollectionId);
    return posts.documents;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch posts");
  }
}

// Get video posts created by user
export async function getUserPosts(userId) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.equal("creator", userId)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch user posts");
  }
}

// Get video posts that matches search query
export async function searchPosts(query) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.search("title", query)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error.message || "Search failed");
  }
}

// Get latest created video posts
export async function getLatestPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(7)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch latest posts");
  }
}

// Delete a Video Post
export async function deletePost(postId) {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      postId // Pass the document ID to delete
    );
    return true; // Return true if deletion is successful
  } catch (error) {
    throw new Error(error.message || "Failed to delete post");
  }
}
