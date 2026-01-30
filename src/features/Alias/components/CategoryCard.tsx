'use client';

import { Card, CardActionArea, CardContent, Checkbox, Stack, Typography } from '@mui/material';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  selected: boolean;
  onToggle: (categoryId: string) => void;
}

export const CategoryCard = ({ category, selected, onToggle }: CategoryCardProps) => {
  return (
    <Card variant={selected ? 'outlined' : 'elevation'} sx={{ borderWidth: selected ? 2 : 1 }}>
      <CardActionArea onClick={() => onToggle(category.id)} data-testid={`category-${category.id}`}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Checkbox checked={selected} tabIndex={-1} disableRipple />
            <Stack spacing={0.5} flex={1}>
              <Typography variant="h6" fontWeight="bold">
                {category.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {category.description}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
