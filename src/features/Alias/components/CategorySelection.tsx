'use client';

import { useMemo } from 'react';
import { Stack, Typography, Container, Button, Divider } from '@mui/material';
import { categories } from '../data/categories';
import { useGameState } from '../hooks/useGameState';
import { initialGameSettings } from '../types';
import { CategoryCard } from './CategoryCard';

export const CategorySelection = () => {
  const { state, updateSettings, setScreen } = useGameState();

  const selectedCategoryIds =
    state.settings?.selectedCategoryIds ?? initialGameSettings.selectedCategoryIds ?? [];

  const selection = useMemo(() => new Set(selectedCategoryIds), [selectedCategoryIds]);

  const handleToggle = (categoryId: string) => {
    const next = new Set(selection);
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }

    updateSettings({ selectedCategoryIds: Array.from(next) });
  };

  const handleSelectAll = () => {
    updateSettings({ selectedCategoryIds: categories.map((category) => category.id) });
  };

  const handleDeselectAll = () => {
    updateSettings({ selectedCategoryIds: [] });
  };

  const handleBack = () => {
    setScreen('language-level');
  };

  const handleContinue = () => {
    if (selectedCategoryIds.length === 0) return;
    setScreen('round-settings');
  };

  return (
    <Container maxWidth="md" data-testid="category-selection">
      <Stack spacing={4} sx={{ py: 4 }}>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" fontWeight="bold" textAlign="center">
            Select Categories
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Pick one or more categories to build your word list.
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button variant="outlined" onClick={handleSelectAll} data-testid="categories-select-all">
            Select all
          </Button>
          <Button variant="outlined" onClick={handleDeselectAll} data-testid="categories-deselect-all">
            Deselect all
          </Button>
        </Stack>

        <Divider />

        <Stack spacing={2}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              selected={selection.has(category.id)}
              onToggle={handleToggle}
            />
          ))}
        </Stack>

        {selectedCategoryIds.length === 0 && (
          <Typography variant="body2" color="error" textAlign="center">
            Please select at least one category.
          </Typography>
        )}

        <Divider />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
          <Button variant="outlined" onClick={handleBack} data-testid="categories-back">
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleContinue}
            disabled={selectedCategoryIds.length === 0}
            data-testid="categories-continue"
          >
            Continue
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};
