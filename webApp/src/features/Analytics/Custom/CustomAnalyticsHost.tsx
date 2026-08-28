'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { ANALYTICS_TRACKER_PATH } from './constants';
import {
  attachAnalyticsIframe,
  markAnalyticsIframeReady,
  sendAnalyticsEvent,
  setAnalyticsSourceApp,
  isCustomAnalyticsReadyMessage,
} from './sendAnalyticsEvent';
import { buildHelloMessage, getTrackerOrigin, getTrackerUrl } from './protocol';
import { AnalyticsSourceApp } from './types';
import { isAllowedAnalyticsOrigin } from './allowedOrigins';
import { isBotBrowser } from './isBotUserAgent';
import { currentScrollPercent, nextScrollBucket } from './pageEngagement';

const iframeStyle: React.CSSProperties = {
  position: 'absolute',
  width: 0,
  height: 0,
  border: 0,
  opacity: 0,
  pointerEvents: 'none',
};

const clickTargetSelector = 'a, button, [data-analytics], [role="button"]';

const shouldSkipPath = (pathname: string): boolean => {
  return pathname === ANALYTICS_TRACKER_PATH || pathname.startsWith('/staats');
};

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

export function CustomAnalyticsHost({ sourceApp }: { sourceApp: AnalyticsSourceApp }) {
  const pathname = usePathname() || '';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastPathRef = useRef('');
  const skip = shouldSkipPath(pathname) || isBotBrowser();
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const maxScrollRef = useRef(0);
  const pageStartedAtRef = useRef(Date.now());
  const leaveSentAtRef = useRef(0);

  useEffect(() => {
    setMountNode(document.body);
  }, []);

  useEffect(() => {
    setAnalyticsSourceApp(sourceApp);
  }, [sourceApp]);

  useEffect(() => {
    if (skip) return;
    attachAnalyticsIframe(iframeRef.current?.contentWindow || null);
  }, [skip]);

  useEffect(() => {
    if (skip) return;
    const onMessage = (event: MessageEvent) => {
      if (!isAllowedAnalyticsOrigin(event.origin)) return;
      if (!isCustomAnalyticsReadyMessage(event.data)) return;
      attachAnalyticsIframe(iframeRef.current?.contentWindow || null);
      markAnalyticsIframeReady();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [skip]);

  useEffect(() => {
    if (skip) return;
    const path =
      typeof window === 'undefined'
        ? pathname
        : `${window.location.pathname}${window.location.search}`;
    if (!path || path === lastPathRef.current) return;
    if (lastPathRef.current) {
      sendAnalyticsEvent({
        name: 'page_leave',
        sourceApp,
        path: lastPathRef.current,
        durationMs: Date.now() - pageStartedAtRef.current,
        maxScrollPct: maxScrollRef.current,
      });
    }
    lastPathRef.current = path;
    maxScrollRef.current = currentScrollPercent();
    pageStartedAtRef.current = Date.now();
    sendAnalyticsEvent({
      name: 'page_view',
      sourceApp,
      path,
    });
  }, [pathname, sourceApp, skip]);

  useEffect(() => {
    if (skip) return;
    const onClick = (event: MouseEvent) => {
      const meta = readClickMeta(event.target);
      if (!meta) return;
      sendAnalyticsEvent({
        name: 'click',
        sourceApp,
        ...meta,
      });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [sourceApp, skip]);

  useEffect(() => {
    if (skip) return;
    const emitLeave = () => {
      const now = Date.now();
      if (now - leaveSentAtRef.current < 2000) return;
      leaveSentAtRef.current = now;
      sendAnalyticsEvent({
        name: 'page_leave',
        sourceApp,
        durationMs: now - pageStartedAtRef.current,
        maxScrollPct: maxScrollRef.current,
      });
    };
    const onScroll = () => {
      const current = currentScrollPercent();
      let bucket = nextScrollBucket(maxScrollRef.current, current);
      while (bucket) {
        maxScrollRef.current = bucket;
        sendAnalyticsEvent({
          name: 'scroll_depth',
          sourceApp,
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
  }, [sourceApp, skip]);

  if (skip || !mountNode) return null;

  const onLoad = () => {
    attachAnalyticsIframe(iframeRef.current?.contentWindow || null);
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
