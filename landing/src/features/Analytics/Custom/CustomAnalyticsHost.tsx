'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import {
  buildEventMessage,
  buildHelloMessage,
  getTrackerOrigin,
  getTrackerUrl,
  isAllowedAnalyticsOrigin,
  isReadyMessage,
  LandingAnalyticsEvent,
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

export function CustomAnalyticsHost() {
  const pathname = usePathname() || '';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const queueRef = useRef<LandingAnalyticsEvent[]>([]);
  const lastPathRef = useRef('');
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMountNode(document.body);
  }, []);

  const postEvent = (event: LandingAnalyticsEvent) => {
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
    const onMessage = (event: MessageEvent) => {
      if (!isAllowedAnalyticsOrigin(event.origin)) return;
      if (!isReadyMessage(event.data)) return;
      readyRef.current = true;
      flush();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    const path = `${window.location.pathname}${window.location.search}`;
    if (!path || path === lastPathRef.current) return;
    lastPathRef.current = path;
    postEvent({
      name: 'page_view',
      sourceApp: 'landing',
      path,
      href: window.location.href,
      title: document.title,
      referrer: document.referrer,
      language: navigator.language,
      screen: { width: window.screen.width, height: window.screen.height },
    });
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const meta = readClickMeta(event.target);
      if (!meta) return;
      postEvent({
        name: 'click',
        sourceApp: 'landing',
        path: `${window.location.pathname}${window.location.search}`,
        href: window.location.href,
        title: document.title,
        referrer: document.referrer,
        language: navigator.language,
        screen: { width: window.screen.width, height: window.screen.height },
        ...meta,
      });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  if (!mountNode) return null;

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
