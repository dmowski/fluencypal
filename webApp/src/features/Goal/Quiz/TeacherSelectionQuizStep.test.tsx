/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { TeacherSelectionQuizStep } from './TeacherSelectionQuizStep';

const mockSelectVoice = jest.fn(async () => undefined);
const mockUseQuizTeacherVoice = jest.fn(() => ({
  selectedVoice: null as string | null,
  selectVoice: mockSelectVoice,
}));

jest.mock('../../Survey/InfoStep', () => ({
  InfoStep: ({
    title,
    subComponent,
    onClick,
    disabled,
    actionButtonTitle,
  }: {
    title?: string;
    subComponent?: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    actionButtonTitle?: string;
  }) => (
    <div>
      <h4>{title}</h4>
      {subComponent}
      <button type="button" disabled={disabled} onClick={onClick}>
        {actionButtonTitle}
      </button>
    </div>
  ),
}));

jest.mock('./useQuizTeacherVoice', () => ({
  useQuizTeacherVoice: () => mockUseQuizTeacherVoice(),
}));

jest.mock('@/features/Settings/useSettings', () => ({
  useSettings: () => ({
    aiVoiceSpeed: 'normal',
  }),
}));

jest.mock('@/features/Settings/VoiceSpeedSelector', () => ({
  VoiceSpeedSelector: () => null,
}));

jest.mock('@/features/Conversation/CallMode/SelectTeacher', () => ({
  SelectTeacher: ({
    onSelectVoice,
  }: {
    onSelectVoice: (voice: string) => void;
  }) => (
    <button type="button" onClick={() => onSelectVoice('ash')}>
      Pick Ash
    </button>
  ),
}));

jest.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    userInfo: null,
    uid: null,
  }),
}));

describe('TeacherSelectionQuizStep', () => {
  beforeEach(() => {
    mockSelectVoice.mockClear();
    mockUseQuizTeacherVoice.mockReturnValue({
      selectedVoice: null,
      selectVoice: mockSelectVoice,
    });
  });

  it('shows the teacher picker instead of the sign-in wall', () => {
    render(
      <I18nWrapper>
        <TeacherSelectionQuizStep onContinue={() => undefined} isStepLoading={false} />
      </I18nWrapper>,
    );

    expect(screen.getByText('Choose your interlocutor')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-teacher-selection')).toBeInTheDocument();
    expect(screen.queryByText("Let's create an account")).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('enables Continue after a voice is chosen', () => {
    const onContinue = jest.fn();
    mockUseQuizTeacherVoice.mockReturnValue({
      selectedVoice: 'ash',
      selectVoice: mockSelectVoice,
    });

    render(
      <I18nWrapper>
        <TeacherSelectionQuizStep onContinue={onContinue} isStepLoading={false} />
      </I18nWrapper>,
    );

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeEnabled();
    fireEvent.click(continueButton);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
