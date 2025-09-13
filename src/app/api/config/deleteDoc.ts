import { deleteCollection } from "./deleteCollection";
import { getDB } from "./firebase";

export async function deleteDoc(collectionPath: string, docId: string): Promise<void> {
  const db = getDB();
  const docRef = db.collection(collectionPath).doc(docId);
  const collections = await docRef.listCollections();

  for await (const collection of collections) {
    await deleteCollection(`${collectionPath}/${docId}/${collection.id}`);
  }

  await docRef.delete();
}
