import React from 'react';
import { Badge, Button, Stack } from '@mui/material';
import { ArrowRight } from 'lucide-react';

export const InterviewQuizButton: React.FC<{
  onClick?: () => void;
  color: 'primary' | 'error' | 'success';
  disabled?: boolean;
  title: string;
  endIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';

  secondButtonTitle?: string;
  onSecondButtonClick?: () => void;
  secondButtonEndIcon?: React.ReactNode;
  secondButtonStartIcon?: React.ReactNode;
  secondButtonDisabled?: boolean;
  actionButtonBadgeText?: string;
  secondButtonBadgeText?: string;
  actionButtonAnalyticsId?: string;
  secondButtonAnalyticsId?: string;
  quiet?: boolean;
}> = ({
  onClick,
  color,
  disabled,
  title,
  endIcon,
  startIcon,
  type,
  secondButtonTitle,
  onSecondButtonClick,
  secondButtonEndIcon,
  secondButtonStartIcon,
  secondButtonDisabled,
  actionButtonBadgeText,
  secondButtonBadgeText,
  actionButtonAnalyticsId,
  secondButtonAnalyticsId,
  quiet = false,
}) => {
  return (
    <Stack
      sx={{
        paddingTop: quiet ? '8px' : '20px',
        paddingBottom: quiet ? '8px' : '40px',
        flexDirection: 'row',
        gap: '10px',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
      }}
    >
      <Badge
        badgeContent={
          !quiet && actionButtonBadgeText ? (
            <span data-testid="auth-wall-last-method-badge">{actionButtonBadgeText}</span>
          ) : undefined
        }
        color="secondary"
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{
          display: 'inline-flex',
          width: 'max-content',
          '& .MuiBadge-badge': {
            left: 16,
            top: 0,
            transform: 'translateY(-45%)',
            zIndex: 1,
            pointerEvents: 'none',
          },
        }}
      >
        <Button
          onClick={onClick}
          variant={quiet ? 'text' : 'contained'}
          color={color}
          disabled={disabled}
          type={type}
          size={quiet ? 'medium' : 'large'}
          {...(actionButtonAnalyticsId ? { 'data-analytics': actionButtonAnalyticsId } : {})}
          sx={{
            width: `max-content`,
            minWidth: quiet ? 'auto' : '200px',
            paddingTop: quiet ? '6px' : '12px',
            paddingBottom: quiet ? '6px' : '12px',
            borderRadius: '128px',
            textAlign: 'left',
            textTransform: quiet ? 'none' : undefined,
            opacity: quiet ? 0.8 : 1,
          }}
          fullWidth
          endIcon={quiet ? undefined : endIcon || <ArrowRight />}
          startIcon={startIcon}
        >
          {title}
        </Button>
      </Badge>
      {secondButtonTitle && onSecondButtonClick && (
        <Badge
          badgeContent={
            !quiet && secondButtonBadgeText ? (
              <span data-testid="auth-wall-last-method-badge">{secondButtonBadgeText}</span>
            ) : undefined
          }
          color="secondary"
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          sx={{
            display: 'inline-flex',
            width: 'max-content',
            '& .MuiBadge-badge': {
              left: 16,
              top: 0,
              transform: 'translateY(-45%)',
              zIndex: 1,
              pointerEvents: 'none',
            },
          }}
        >
          <Button
            onClick={onSecondButtonClick}
            variant={quiet ? 'text' : 'outlined'}
            color={color}
            type={type}
            size={quiet ? 'medium' : 'large'}
            disabled={secondButtonDisabled}
            {...(secondButtonAnalyticsId ? { 'data-analytics': secondButtonAnalyticsId } : {})}
            sx={{
              width: `max-content`,
              paddingTop: quiet ? '6px' : '12px',
              paddingLeft: quiet ? '10px' : '24px',
              paddingRight: quiet ? '10px' : '24px',
              paddingBottom: quiet ? '6px' : '12px',
              borderRadius: '128px',
              textAlign: 'left',
              textTransform: quiet ? 'none' : undefined,
              opacity: quiet ? 0.8 : 1,
            }}
            fullWidth
            endIcon={quiet ? undefined : secondButtonEndIcon}
            startIcon={secondButtonStartIcon}
          >
            {secondButtonTitle}
          </Button>
        </Badge>
      )}
    </Stack>
  );
};
