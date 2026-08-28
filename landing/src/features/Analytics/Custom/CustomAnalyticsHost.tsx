'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import {
  buildEventMessage,
  buildHelloMessage,
  classifyCta,
  currentScrollPercent,
  getTrackerOrigin,
  getTrackerUrl,
  isAllowedAnalyticsOrigin,
  isBotBrowser,
  isReadyMessage,
  LandingAnalyticsEvent,
  nextScrollBucket,
  parseTraffic,
} from './protocol';

const iframeStyle: React.CSSProperties = {
  position: 'absolute',
  width: 0,
  height: 0,
  border: 0,
  opacity: 0,
  pointerEvents: 'none',
};

const clickTargetSelector = 'a, button, [data-analytics], [role="button"]';

const readClickMeta = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return null;
  const el = target.closest(clickTargetSelector);
  if (!(el instanceof HTMLElement)) return null;
  const text = (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
  const href = el instanceof HTMLAnchorElement ? el.href : el.getAttribute('href') || '';
  return {
    tagName: el.tagName.toLowerCase(),
    buttonId: el.id || el.getAttribute('data-analytics') || '',
    buttonText: text,
    buttonHref: href,
  };
};

const pageContext = () => {
  const href = window.location.href;
  const referrer = document.referrer;
  const traffic = parseTraffic(href, referrer);
  return {
    path: `${window.location.pathname}${window.location.search}`,
    href,
    title: document.title,
    referrer,
    language: navigator.language,
    screen: { width: window.screen.width, height: window.screen.height },
    ...traffic,
  };
};

export function CustomAnalyticsHost() {
  const pathname = usePathname() || '';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const queueRef = useRef<LandingAnalyticsEvent[]>([]);
  const lastPathRef = useRef('');
  const maxScrollRef = useRef(0);
  const pageStartedAtRef = useRef(Date.now());
  const leaveSentAtRef = useRef(0);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const skip = isBotBrowser();

  useEffect(() => {
    if (skip) return;
    setMountNode(document.body);
  }, [skip]);

  const postEvent = (event: LandingAnalyticsEvent) => {
    if (skip) return;
    const frame = iframeRef.current?.contentWindow;
    if (!frame || !readyRef.current) {
      queueRef.current.push(event);
      return;
    }
    frame.postMessage(buildEventMessage(event), getTrackerOrigin());
  };

  const flush = () => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame || !readyRef.current) return;
    while (queueRef.current.length > 0) {
      const next = queueRef.current.shift();
      if (next) {
        frame.postMessage(buildEventMessage(next), getTrackerOrigin());
      }
    }
  };

  useEffect(() => {
    if (skip) return;
    const onMessage = (event: MessageEvent) => {
      if (!isAllowedAnalyticsOrigin(event.origin)) return;
      if (!isReadyMessage(event.data)) return;
      readyRef.current = true;
      flush();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [skip]);

  useEffect(() => {
    if (skip) return;
    const path = `${window.location.pathname}${window.location.search}`;
    if (!path || path === lastPathRef.current) return;
    if (lastPathRef.current) {
      postEvent({
        name: 'page_leave',
        sourceApp: 'landing',
        ...pageContext(),
        path: lastPathRef.current,
        durationMs: Date.now() - pageStartedAtRef.current,
        maxScrollPct: maxScrollRef.current,
      });
    }
    lastPathRef.current = path;
    maxScrollRef.current = currentScrollPercent();
    pageStartedAtRef.current = Date.now();
    postEvent({
      name: 'page_view',
      sourceApp: 'landing',
      ...pageContext(),
    });
  }, [pathname, skip]);

  useEffect(() => {
    if (skip) return;
    const onClick = (event: MouseEvent) => {
      const meta = readClickMeta(event.target);
      if (!meta) return;
      const cta = classifyCta({
        href: meta.buttonHref,
        buttonId: meta.buttonId,
        buttonText: meta.buttonText,
      });
      postEvent({
        name: 'click',
        sourceApp: 'landing',
        ...pageContext(),
        ...meta,
        ...cta,
      });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [skip]);

  useEffect(() => {
    if (skip) return;
    const emitLeave = () => {
      const now = Date.now();
      if (now - leaveSentAtRef.current < 2000) return;
      leaveSentAtRef.current = now;
      postEvent({
        name: 'page_leave',
        sourceApp: 'landing',
        ...pageContext(),
        durationMs: now - pageStartedAtRef.current,
        maxScrollPct: maxScrollRef.current,
      });
    };
    const onScroll = () => {
      const current = currentScrollPercent();
      let bucket = nextScrollBucket(maxScrollRef.current, current);
      while (bucket) {
        maxScrollRef.current = bucket;
        postEvent({
          name: 'scroll_depth',
          sourceApp: 'landing',
          ...pageContext(),
          scrollPct: bucket,
          maxScrollPct: maxScrollRef.current,
        });
        bucket = nextScrollBucket(maxScrollRef.current, current);
      }
      maxScrollRef.current = Math.max(maxScrollRef.current, current);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') emitLeave();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', emitLeave);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', emitLeave);
    };
  }, [skip]);

  if (skip || !mountNode) return null;

  const onLoad = () => {
    iframeRef.current?.contentWindow?.postMessage(buildHelloMessage(), getTrackerOrigin());
  };

  return createPortal(
    <iframe
      ref={iframeRef}
      src={getTrackerUrl()}
      title="Custom analytics"
      aria-hidden="true"
      tabIndex={-1}
      style={iframeStyle}
      sandbox="allow-scripts allow-same-origin"
      onLoad={onLoad}
    />,
    mountNode,
  );
}
