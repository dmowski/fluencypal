/**
 * @jest-environment jsdom
 */

import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { MESSAGE_VIEW_DWELL_MS, useMarkMessageViewed } from './useMarkMessageViewed';

type ObserverRecord = {
  callback: IntersectionObserverCallback;
};

const observers: ObserverRecord[] = [];

class FakeIntersectionObserver {
  constructor(private callback: IntersectionObserverCallback) {}

  observe = () => {
    observers.push({ callback: this.callback });
  };

  unobserve = () => undefined;

  disconnect = () => undefined;

  takeRecords = () => [];
}

const emit = (isIntersecting: boolean) => {
  const record = observers[observers.length - 1];
  record.callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
};

const Harness = ({
  onView,
  messageId = 'message-1',
  userId = 'user-1',
}: {
  onView: () => void;
  messageId?: string;
  userId?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useMarkMessageViewed(ref, messageId, userId, onView);
  return <div ref={ref} />;
};

describe('useMarkMessageViewed', () => {
  let visibility: DocumentVisibilityState = 'visible';

  beforeEach(() => {
    observers.length = 0;
    visibility = 'visible';
    jest.useFakeTimers();
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => visibility,
    });
    global.IntersectionObserver =
      FakeIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const show = () => {
    visibility = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));
  };

  const hide = () => {
    visibility = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
  };

  const dwell = () => {
    act(() => {
      jest.advanceTimersByTime(MESSAGE_VIEW_DWELL_MS);
    });
  };

  it('marks the message after it stays in the viewport of a visible tab', () => {
    const onView = jest.fn();
    render(<Harness onView={onView} />);

    act(() => {
      emit(true);
    });
    expect(onView).not.toHaveBeenCalled();

    dwell();

    expect(onView).toHaveBeenCalledTimes(1);
  });

  it('does not mark a message that is off screen', () => {
    const onView = jest.fn();
    render(<Harness onView={onView} />);

    dwell();

    expect(onView).not.toHaveBeenCalled();
  });

  it('does not mark a message while the tab is hidden', () => {
    const onView = jest.fn();
    visibility = 'hidden';
    render(<Harness onView={onView} />);

    act(() => {
      emit(true);
    });
    dwell();

    expect(onView).not.toHaveBeenCalled();
  });

  it('marks the message after the tab becomes visible while it is already in the viewport', () => {
    const onView = jest.fn();
    visibility = 'hidden';
    render(<Harness onView={onView} />);

    act(() => {
      emit(true);
    });
    act(() => {
      show();
    });
    dwell();

    expect(onView).toHaveBeenCalledTimes(1);
  });

  it('restarts the dwell when the message leaves and re-enters the viewport', () => {
    const onView = jest.fn();
    render(<Harness onView={onView} />);

    act(() => {
      emit(true);
    });
    act(() => {
      jest.advanceTimersByTime(MESSAGE_VIEW_DWELL_MS - 1);
      emit(false);
    });
    dwell();

    expect(onView).not.toHaveBeenCalled();

    act(() => {
      emit(true);
    });
    dwell();

    expect(onView).toHaveBeenCalledTimes(1);
  });

  it('cancels the dwell when the tab hides before a second has passed', () => {
    const onView = jest.fn();
    render(<Harness onView={onView} />);

    act(() => {
      emit(true);
    });
    act(() => {
      jest.advanceTimersByTime(MESSAGE_VIEW_DWELL_MS - 1);
      hide();
    });
    dwell();

    expect(onView).not.toHaveBeenCalled();
  });

  it('does not mark a message without a signed-in user', () => {
    const onView = jest.fn();
    render(<Harness onView={onView} userId="" />);

    dwell();

    expect(observers).toHaveLength(0);
    expect(onView).not.toHaveBeenCalled();
  });
});
