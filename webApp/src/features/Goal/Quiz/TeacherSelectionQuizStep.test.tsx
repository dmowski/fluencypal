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
  savedVoice: null as string | null,
  selectVoice: mockSelectVoice,
}));
const mockAuth = {
  uid: '',
};

jest.mock('../../Survey/InfoStep', () => ({
  InfoStep: ({
    title,
    subComponent,
    hideActions,
  }: {
    title?: string;
    subComponent?: ReactNode;
    hideActions?: boolean;
  }) => (
    <div>
      <h4>{title}</h4>
      {subComponent}
      {hideActions ? null : <button type="button">Next</button>}
    </div>
  ),
}));

jest.mock('../../Survey/FooterButton', () => ({
  FooterButton: ({
    title,
    disabled,
    onClick,
    analyticsId,
  }: {
    title: string;
    disabled?: boolean;
    onClick: () => void;
    analyticsId?: string;
  }) => (
    <button type="button" disabled={disabled} onClick={onClick} data-analytics={analyticsId}>
      {title}
    </button>
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
  useAuth: () => mockAuth,
}));

describe('TeacherSelectionQuizStep', () => {
  beforeEach(() => {
    mockSelectVoice.mockClear();
    mockAuth.uid = '';
    mockUseQuizTeacherVoice.mockReturnValue({
      selectedVoice: null,
      savedVoice: null,
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

  it('keeps Continue disabled until anonymous auth is ready', () => {
    mockUseQuizTeacherVoice.mockReturnValue({
      selectedVoice: 'ash',
      savedVoice: 'ash',
      selectVoice: mockSelectVoice,
    });

    render(
      <I18nWrapper>
        <TeacherSelectionQuizStep onContinue={() => undefined} isStepLoading={false} />
      </I18nWrapper>,
    );

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('enables Continue after auth is ready and a voice is chosen', () => {
    const onContinue = jest.fn();
    mockAuth.uid = 'anon-1';
    mockUseQuizTeacherVoice.mockReturnValue({
      selectedVoice: 'ash',
      savedVoice: 'ash',
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
