'use client';

import { useState } from 'react';
import { Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { Loader, Pencil, Trash2 } from 'lucide-react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { BlogCategoryDocument } from './types';
import { SaveBlogCategoryInput } from './useBlogCategories';

interface BlogCategoryModalProps {
  categories: BlogCategoryDocument[];
  isLoading: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSelect: (categoryId: string) => void;
  onCreate: (input: SaveBlogCategoryInput) => Promise<void>;
  onUpdate: (input: SaveBlogCategoryInput) => Promise<void>;
  onDelete: (categoryId: string) => Promise<void>;
}

export const BlogCategoryModal = ({
  categories,
  isLoading,
  isSaving,
  onClose,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
}: BlogCategoryModalProps) => {
  const [manualCategoryId, setManualCategoryId] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editTitleEn, setEditTitleEn] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startEdit = (category: BlogCategoryDocument) => {
    setEditingCategoryId(category.id);
    setEditTitleEn(category.title.en);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingCategoryId(null);
    setEditTitleEn('');
    setError(null);
  };

  const handleSelectManual = () => {
    setError(null);
    const id = manualCategoryId.trim();
    if (!id) {
      setError('Enter a category ID');
      return;
    }
    onSelect(id);
  };

  const handleCreate = async () => {
    setError(null);
    try {
      await onCreate({
        id: newCategoryId,
        titleEn: newTitleEn,
      });
      setNewCategoryId('');
      setNewTitleEn('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const handleUpdate = async () => {
    if (!editingCategoryId) return;
    setError(null);
    try {
      await onUpdate({
        id: editingCategoryId,
        titleEn: editTitleEn,
      });
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const handleDelete = async (category: BlogCategoryDocument) => {
    const confirmed = window.confirm(
      `Delete category "${category.id}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setError(null);
    try {
      await onDelete(category.id);
      if (editingCategoryId === category.id) {
        cancelEdit();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const savingLabel = isSaving ? 'Translating & saving...' : null;

  return (
    <CustomModal isOpen onClose={onClose}>
      <Stack sx={{ width: '100%', maxWidth: '560px', gap: '20px' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Select category
        </Typography>

        {editingCategoryId && (
          <Stack
            gap="12px"
            sx={{ padding: '12px', border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Edit category
            </Typography>
            <TextField
              label="Category ID"
              value={editingCategoryId}
              fullWidth
              size="small"
              disabled
            />
            <TextField
              label="Title (English)"
              value={editTitleEn}
              onChange={(e) => setEditTitleEn(e.target.value)}
              fullWidth
              size="small"
              disabled={isSaving}
            />
            {error && (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            )}
            <Stack sx={{ flexDirection: 'row', gap: '8px' }}>
              <Button variant="outlined" onClick={cancelEdit} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdate}
                disabled={isSaving || !editTitleEn.trim()}
                startIcon={isSaving ? <Loader size="14px" /> : undefined}
              >
                {savingLabel ?? 'Save'}
              </Button>
            </Stack>
          </Stack>
        )}

        <Stack gap="8px">
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Category ID
          </Typography>
          <Stack sx={{ flexDirection: 'row', gap: '8px', alignItems: 'flex-start' }}>
            <TextField
              label="Category ID"
              value={manualCategoryId}
              onChange={(e) => setManualCategoryId(e.target.value)}
              fullWidth
              size="small"
              disabled={isSaving}
              placeholder="e.g. product-updates"
            />
            <Button
              variant="contained"
              onClick={handleSelectManual}
              disabled={isSaving || !manualCategoryId.trim()}
              sx={{ flexShrink: 0, marginTop: '2px' }}
            >
              Select
            </Button>
          </Stack>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Use an existing ID from the list below, or a new ID when creating a category.
          </Typography>
        </Stack>

        {isLoading ? (
          <Stack sx={{ alignItems: 'center', padding: '24px' }}>
            <Loader size="24px" />
          </Stack>
        ) : (
          <Stack gap="8px">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Existing categories
            </Typography>
            {categories.length === 0 ? (
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                No categories yet. Enter a category ID above or create one below.
              </Typography>
            ) : (
              categories.map((category) => (
                <Stack
                  key={category.id}
                  sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => onSelect(category.id)}
                    disabled={isSaving}
                    sx={{
                      flex: 1,
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Stack sx={{ textAlign: 'left' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {category.id}
                      </Typography>
                      {category.title.en && (
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {category.title.en}
                        </Typography>
                      )}
                    </Stack>
                  </Button>
                  <IconButton
                    aria-label={`Edit category ${category.id}`}
                    onClick={() => startEdit(category)}
                    disabled={isSaving}
                    size="small"
                  >
                    <Pencil size="16px" />
                  </IconButton>
                  <IconButton
                    aria-label={`Delete category ${category.id}`}
                    onClick={() => void handleDelete(category)}
                    disabled={isSaving}
                    size="small"
                    color="error"
                  >
                    <Trash2 size="16px" />
                  </IconButton>
                </Stack>
              ))
            )}
          </Stack>
        )}

        <Stack gap="12px" sx={{ paddingTop: '8px', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Create new category
          </Typography>
          <TextField
            label="Category ID"
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
            fullWidth
            size="small"
            disabled={isSaving}
            placeholder="e.g. product-updates"
          />
          <TextField
            label="Title (English)"
            value={newTitleEn}
            onChange={(e) => setNewTitleEn(e.target.value)}
            fullWidth
            size="small"
            disabled={isSaving}
          />
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            English title is translated to all languages before saving.
          </Typography>
          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={isSaving || !newCategoryId.trim() || !newTitleEn.trim()}
            startIcon={isSaving ? <Loader size="14px" /> : undefined}
          >
            {savingLabel ?? 'Create and select'}
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
