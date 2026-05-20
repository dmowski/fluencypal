'use client';

import { Check, ChevronDown } from 'lucide-react';
import { MenuItem, Select, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

export interface StyledSelectOption {
  value: string;
  label: string;
  /** Optional color dot shown before the label. */
  color?: string;
}

interface StyledSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: StyledSelectOption[];
  sx?: SxProps<Theme>;
  'data-testid'?: string;
}

export const StyledSelect = ({
  value,
  onChange,
  options,
  sx,
  'data-testid': dataTestId,
}: StyledSelectProps) => {
  const selectedOption = options.find((o) => o.value === value);

  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      displayEmpty
      size="small"
      IconComponent={(iconProps) => <ChevronDown size={18} {...iconProps} />}
      SelectDisplayProps={
        dataTestId
          ? ({ 'data-testid': dataTestId } as React.HTMLAttributes<HTMLDivElement>)
          : undefined
      }
      sx={{
        minWidth: '140px',
        color: '#f7f9ff',
        borderRadius: '10px',
        '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.24)' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(77, 163, 255, 0.3)',
        },
        ...sx,
      }}
      renderValue={() => (
        <Stack sx={{ alignItems: 'center', flexDirection: 'row', gap: '10px', paddingTop: '1px' }}>
          {selectedOption?.color && (
            <Stack
              sx={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: selectedOption.color,
                flexShrink: 0,
              }}
            />
          )}
          <Typography variant="body2" sx={{ paddingBottom: '0' }}>
            {selectedOption?.label ?? value}
          </Typography>
        </Stack>
      )}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          <Stack
            sx={{
              width: '100%',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '6px 5px',
            }}
          >
            <Stack sx={{ alignItems: 'center', flexDirection: 'row', gap: '14px' }}>
              {option.color && (
                <Stack
                  sx={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: option.color,
                    flexShrink: 0,
                  }}
                />
              )}
              <Typography variant="body1">{option.label}</Typography>
            </Stack>
            {value === option.value && <Check size={16} />}
          </Stack>
        </MenuItem>
      ))}
    </Select>
  );
};
