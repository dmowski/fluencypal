/**
 * Client-side direct Firestore operations for shared-book management.
 * These bypass the debounced push pipeline for actions that must be
 * immediately consistent when local state is removed before push runs.
 */
import { arrayRemove, deleteField, updateDoc } from 'firebase/firestore';
import { db } from '@/features/Firebase/firebaseDb';

/**
 * Remove `userId` from a shared book's `userIds`, `memberIds`, and
 * `memberEmails` fields via a direct partial Firestore update.
 *
 * Used when a non-owner leaves a shared book: the book is removed from local
 * state immediately and the push layer must not delete the whole document.
 * The owner's `removeUserFromBook` goes through the normal push pipeline.
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
