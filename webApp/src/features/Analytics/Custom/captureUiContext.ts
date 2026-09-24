import { UI_CONTEXT_MAX_ACTIONS, UI_CONTEXT_MAX_ALERTS } from './constants';
import { AnalyticsUiAction, AnalyticsUiContext } from './types';

const NAME_MAX = 40;

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [data-analytics], [aria-haspopup], summary';

const isVisible = (el: Element): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  if (el.closest('[aria-hidden="true"]')) return false;
  if (el.hidden || el.getAttribute('hidden') !== null) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  return true;
};

const clipName = (value: string): string => {
  return value.replace(/\s+/g, ' ').replace(/\S+@\S+/g, '').trim().slice(0, NAME_MAX);
};

const elementInView = (el: HTMLElement): boolean => {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  const height = window.innerHeight || document.documentElement.clientHeight;
  const width = window.innerWidth || document.documentElement.clientWidth;
  return rect.bottom > 0 && rect.right > 0 && rect.top < height && rect.left < width;
};

export const accessibleName = (el: Element): string => {
  if (!(el instanceof HTMLElement)) return '';
  const labelled = clipName(el.getAttribute('aria-label') || el.getAttribute('title') || '');
  if (labelled) return labelled;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') {
    return clipName(el.getAttribute('placeholder') || el.getAttribute('name') || tag);
  }
  return clipName(el.innerText || el.textContent || '');
};

export const screenIdFromPath = (path: string, dialog: string): string => {
  let pathname = path.split('?')[0] || '/';
  pathname = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
  const query = path.includes('?') ? path.slice(path.indexOf('?') + 1) : '';
  const params = new URLSearchParams(query);
  const step = params.get('currentStep');
  const justTalk = params.get('justTalk');
  const rolePlay = params.get('rolePlayId');
  let id = 'other';
  if (pathname.includes('/quiz')) id = step ? `quiz.${step}` : 'quiz.start';
  else if (pathname.includes('/practice')) {
    if (justTalk === 'open' || justTalk === 'true') id = 'practice.justTalk';
    else if (rolePlay) id = 'practice.rolePlay';
    else id = 'practice';
  } else if (pathname.includes('/scenarios')) id = 'scenario';
  else if (pathname.includes('/blog')) id = 'blog';
  else if (pathname.includes('/pricing') || pathname.includes('/price')) id = 'pricing';
  else if (pathname.includes('/features')) id = 'features';
  else if (pathname === '/') id = 'home';
  if (dialog) id = `${id}.dialog`;
  return id.slice(0, 80);
};

export const hashUiContext = (ctx: AnalyticsUiContext): string => {
  const key = [
    ctx.screenId,
    ctx.heading,
    ctx.dialog,
    ctx.primary,
    ctx.actions
      .map(
        (action) =>
          `${action.role}:${action.name}:${action.disabled ? 1 : 0}:${action.inView === true ? 1 : action.inView === false ? 0 : ''}`,
      )
      .join('|'),
  ].join('~');
  let hash = 5381;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 33) ^ key.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};

const markedScreenId = (): string => {
  const marked = document.querySelector('[data-analytics-screen]');
  if (!(marked instanceof HTMLElement)) return '';
  return clipName(marked.getAttribute('data-analytics-screen') || '').slice(0, 80);
};

const firstVisibleText = (selector: string): string => {
  const nodes = document.querySelectorAll(selector);
  for (const node of nodes) {
    if (!isVisible(node)) continue;
    const text = clipName(node.textContent || '');
    if (text) return text;
  }
  return '';
};

export const captureUiContext = (path?: string): AnalyticsUiContext | undefined => {
  if (typeof document === 'undefined') return undefined;

  const dialog = firstVisibleText('[role="dialog"] h2, [role="dialog"] h1, [aria-modal="true"] h2');
  const heading = firstVisibleText('h1, h2, h3, [role="heading"]');
  const alerts: string[] = [];
  for (const node of document.querySelectorAll('[role="alert"]')) {
    if (!isVisible(node)) continue;
    const text = clipName(node.textContent || '');
    if (text) alerts.push(text);
    if (alerts.length >= UI_CONTEXT_MAX_ALERTS) break;
  }

  const seen = new Set<Element>();
  const namedActions: AnalyticsUiAction[] = [];
  const rest: AnalyticsUiAction[] = [];
  const nodes = document.querySelectorAll(INTERACTIVE_SELECTOR);
  for (const node of nodes) {
    if (!(node instanceof HTMLElement) || seen.has(node) || !isVisible(node)) continue;
    seen.add(node);
    const analyticsId = clipName(node.getAttribute('data-analytics') || '');
    const role = (node.getAttribute('role') || node.tagName.toLowerCase()).slice(0, 24);
    const name = analyticsId || accessibleName(node) || '(unnamed)';
    const disabled =
      node.hasAttribute('disabled') ||
      node.getAttribute('aria-disabled') === 'true' ||
      (node instanceof HTMLButtonElement && node.disabled);
    const action: AnalyticsUiAction = { role, name, disabled };
    if (analyticsId) {
      action.inView = elementInView(node);
      namedActions.push(action);
    } else {
      rest.push(action);
    }
  }
  const actions = [...namedActions, ...rest].slice(0, UI_CONTEXT_MAX_ACTIONS);

  const named = actions.find((action) => action.name && action.name !== '(unnamed)' && !action.disabled);
  const primary = named?.name || '';
  const marked = markedScreenId();
  const screenId = marked || screenIdFromPath(path || `${window.location.pathname}${window.location.search}`, dialog);

  const ctx: AnalyticsUiContext = {
    screenId,
    heading,
    dialog,
    alerts,
    primary,
    actions,
  };
  return ctx;
};
