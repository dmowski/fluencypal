'use client';

import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { Plus, Settings, Trash } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { usePlan } from '../Plan/usePlan';
import { useSettings } from '../Settings/useSettings';
import { GoalPlan } from '../Plan/types';

export const PlanSettingsMenu = ({ onAddPlan }: { onAddPlan: () => void }) => {
  const { i18n } = useLingui();
  const plan = usePlan();
  const settings = useSettings();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const languageGoals = plan.goals
    .filter((goal) => goal.languageCode === settings.languageCode)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (languageGoals.length === 0) {
    return null;
  }

  const close = () => setAnchorEl(null);

  const selectPlan = (goal: GoalPlan) => {
    if (plan.activeGoal?.id === goal.id) {
      return;
    }
    close();
    void plan.setActiveGoal(goal.id);
  };

  const removePlan = (goal: GoalPlan) => {
    close();
    const confirmed = confirm(
      i18n._('Are you sure you want to delete "{title}"? This action cannot be undone.', {
        title: goal.title,
      }),
    );
    if (!confirmed) {
      return;
    }
    void plan.deleteGoal(goal.id);
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label={i18n._('Plan settings')}
        data-testid="plan-settings-button"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <Settings size={'20px'} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: { minWidth: 280, maxWidth: 360 } },
        }}
        data-testid="plan-settings-menu"
      >
        {languageGoals.map((goal) => {
          const isActive = plan.activeGoal?.id === goal.id;
          return (
            <MenuItem
              key={goal.id}
              selected={isActive}
              onClick={() => selectPlan(goal)}
              data-testid={`plan-settings-option-${goal.id}`}
            >
              <ListItemIcon>
                {isActive ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
              </ListItemIcon>
              <ListItemText
                primary={goal.title}
                slotProps={{
                  primary: {
                    noWrap: true,
                  },
                }}
              />
              <IconButton
                size="small"
                aria-label={i18n._('Remove plan')}
                data-testid={`plan-settings-remove-${goal.id}`}
                color="error"
                onMouseDown={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  removePlan(goal);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                }}
              >
                <Trash size={16} />
              </IconButton>
            </MenuItem>
          );
        })}

        <Divider />

        <MenuItem
          onClick={() => {
            close();
            onAddPlan();
          }}
          data-testid="plan-settings-add"
        >
          <ListItemIcon>
            <Plus size={18} />
          </ListItemIcon>
          <ListItemText>
            <Typography>{i18n._('Add new plan')}</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
