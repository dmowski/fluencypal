'use client';

import { db } from '@/features/Firebase/firebaseDb';
import { BlogDocMeta } from './types';
import { BlogEditorModal } from './BlogEditorModal';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, deleteDoc, doc, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Button, Chip, Stack, Typography } from '@mui/material';
import { CirclePlus, BookOpen, Trash2 } from 'lucide-react';
import { useUrlState } from '@/features/Url/useUrlState';

export const BlogAdmin = () => {
  const blogsCollection = db.collections.blogs();
  const [blogsData] = useCollectionData(blogsCollection);
  const [selectedBlogId, setSelectedBlogId] = useUrlState('selectedBlog', '', false);
  const [isCreating, setIsCreating] = useState(false);
  // Optimistic blog: opened immediately on creation so the modal doesn't wait
  // for the Firestore real-time listener to deliver the new document.
  const [optimisticBlog, setOptimisticBlog] = useState<BlogDocMeta | null>(null);

  const createNewBlog = async () => {
    setIsCreating(true);
    try {
      const newId = Date.now().toString();
      const blogMeta: BlogDocMeta = {
        id: newId,
        publishedVersion: null,
        updatedAtIso: new Date().toISOString(),
        createdAtIso: new Date().toISOString(),
        publishedAtIso: null,
      };
      // Open the modal immediately — don't wait for the real-time listener.
      setOptimisticBlog(blogMeta);
      setSelectedBlogId(newId);
      const docRef = doc(blogsCollection, newId);
      await setDoc(docRef, blogMeta);
    } finally {
      setIsCreating(false);
    }
  };

  const updateBlogMeta = async (blogId: string, patch: Partial<BlogDocMeta>) => {
    const docRef = doc(blogsCollection, blogId);
    await setDoc(docRef, patch, { merge: true });
  };

  const deleteBlog = async (blogId: string) => {
    if (selectedBlogId === blogId) {
      setSelectedBlogId('');
      setOptimisticBlog(null);
    }
    const docRef = doc(blogsCollection, blogId);
    await deleteDoc(docRef);
  };

  const renameBlog = async (oldId: string, newId: string) => {
    const trimmed = newId.trim();
    if (!trimmed || trimmed === oldId) return;

    const oldDocRef = doc(blogsCollection, oldId);
    const oldSnap = await getDoc(oldDocRef);
    if (!oldSnap.exists()) return;

    const newDocRef = doc(blogsCollection, trimmed);
    await setDoc(newDocRef, { ...(oldSnap.data() as BlogDocMeta), id: trimmed });

    const oldVersionsRef = collection(oldDocRef, 'versions');
    const versionsSnap = await getDocs(oldVersionsRef);
    const newVersionsRef = collection(newDocRef, 'versions');
    for (const vSnap of versionsSnap.docs) {
      await setDoc(doc(newVersionsRef, vSnap.id), vSnap.data());
    }
    for (const vSnap of versionsSnap.docs) {
      await deleteDoc(doc(oldVersionsRef, vSnap.id));
    }
    await deleteDoc(oldDocRef);

    setSelectedBlogId(trimmed);
    setOptimisticBlog(null);
  };

  const selectedBlog = blogsData?.find((b) => b.id === selectedBlogId) ?? optimisticBlog ?? null;

  return (
    <Stack gap="20px" padding="20px">
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h5">Blog Posts</Typography>
        <Button
          variant="contained"
          startIcon={<CirclePlus size="16px" />}
          onClick={createNewBlog}
          disabled={isCreating}
        >
          {isCreating ? 'Creating...' : 'New Blog Post'}
        </Button>
      </Stack>

      <Stack gap="12px">
        {(blogsData ?? []).length === 0 && (
          <Typography sx={{ opacity: 0.6 }}>No blog posts yet.</Typography>
        )}
        {(blogsData ?? [])
          .slice()
          .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))
          .map((blog) => (
            <Stack
              key={blog.id}
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <Stack
                sx={{ flexDirection: 'row', alignItems: 'center', gap: '10px', flexShrink: 1 }}
              >
                <BookOpen size="18px" />
                <Stack>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {blog.titleEn || 'Untitled'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.6 }}>
                    Created {new Date(blog.createdAtIso).toLocaleDateString()}
                    {blog.publishedAtIso &&
                      ' · Published ' + new Date(blog.publishedAtIso).toLocaleDateString()}
                  </Typography>
                </Stack>
                {blog.publishedVersion ? (
                  <Chip label="Published" color="success" size="small" />
                ) : (
                  <Chip label="Draft" size="small" />
                )}
              </Stack>

              <Stack sx={{ flexDirection: 'row', gap: '8px' }}>
                <Button variant="outlined" size="small" onClick={() => setSelectedBlogId(blog.id)}>
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => deleteBlog(blog.id)}
                  aria-label="Delete blog post"
                >
                  <Trash2 size="14px" />
                </Button>
              </Stack>
            </Stack>
          ))}
      </Stack>

      {selectedBlog && (
        <BlogEditorModal
          blog={selectedBlog}
          onClose={() => {
            setSelectedBlogId('');
            setOptimisticBlog(null);
          }}
          onUpdate={(patch) => updateBlogMeta(selectedBlog.id, patch)}
          onRenameId={(newId) => renameBlog(selectedBlog.id, newId)}
        />
      )}
    </Stack>
  );
};
