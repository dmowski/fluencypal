import type { ReactNode } from 'react';
import type { IconName } from 'lucide-react/dynamic';

export interface CardItemIcon {
  imageUrl?: string;
  iconName?: IconName;
  iconBgColor?: string;
}

export interface CardItem extends CardItemIcon {
  title: string;
  subTitle: string;
  rowBgColor?: string;
  actionButtonTitle: string;
  onClick: () => void;
  testId?: string;
}

export interface StoreCardProps {
  badge?: string;
  textColor: string;
  backgroundColor: string;
  borderSize?: string;
  previewImageUrl: string;
  previewVideoUrl?: string;

  label?: string;
  title: string;
  subTitle?: string;

  items: CardItem[];
  itemsBackgroundColor: string;
  onClick?: () => void;
  itemsViewMode: 'list' | 'flow';
  emptyItemsStateText?: string;
  children?: ReactNode;
}
