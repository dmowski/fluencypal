/**
 * Client-side direct Firestore operations for shared-book management.
 * These bypass the debounced push pipeline for actions that must be
 * immediately consistent (e.g. a user leaving a book they don't own).
 */
import { arrayRemove, deleteField, updateDoc } from 'firebase/firestore';
import { db } from '@/features/Firebase/firebaseDb';

/**
 * Remove `userId` from a shared book's `userIds`, `memberIds`, and
 * `memberEmails` fields via a direct partial Firestore update.
 *
 * The caller should NOT also go through the signature-based push pipeline for
 * this change — the direct write IS the update. The `onSnapshot` subscription
 * in `useRemoteSubscription` will fire and call `removeBookLocally` once the
 * write is confirmed, which properly cleans up local state and refs.
 */
export const leaveSharedBook = async (bookId: string, userId: string): Promise<void> => {
  const docRef = db.documents.readerBook(bookId);
  if (!docRef) throw new Error(`No doc ref for bookId: ${bookId}`);

  await updateDoc(docRef, {
    userIds: arrayRemove(userId),
    memberIds: arrayRemove(userId),
    [`memberEmails.${userId}`]: deleteField(),
  });
};
