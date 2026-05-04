'use client';

import { Checkbox, Link, Stack, Typography } from '@mui/material';
import { MarkdownToJSX, default as MarkdownTool } from 'markdown-to-jsx';
import React from 'react';

export interface ReaderMarkdownWordProps {
  word: string;
  wordIndex: number;
}

export interface MarkdownProps {
  children: string;
  words?: string[];
  imageDataUrlByHref?: Record<string, string>;
  imageAspectRatioByHref?: Record<string, number>;
  maxImageHeight?: number;
  getInternalChapterTargetPage?: (href: string) => number | null;
  onInternalChapterLinkSelect?: (targetPage: number) => void;
  onWordClick?: (
    word: string,
    element: HTMLElement,
    wordIndex: number,
    event: React.MouseEvent<HTMLElement>,
  ) => void;
  onWordMouseEnter?: (
    word: string,
    element: HTMLElement,
    wordIndex: number,
    event: React.MouseEvent<HTMLElement>,
  ) => void;
  onWordMouseMove?: (
    word: string,
    element: HTMLElement,
    wordIndex: number,
    event: React.MouseEvent<HTMLElement>,
  ) => void;
  renderWord?: (props: ReaderMarkdownWordProps) => React.ReactNode;
  renderSpace?: (wordIndex: number) => React.ReactNode;
}

const normalizeImageHref = (href: string): string => {
  const [pathOnly] = href.split(/[?#]/, 1);
  const trimmed = decodeURI(pathOnly.trim());
  return trimmed.replace(/^([./]+)+/, '').replace(/\\/g, '/');
};

const EXTERNAL_LINK_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

const isExternalHref = (href: string): boolean => {
  const trimmedHref = href.trim();
  return EXTERNAL_LINK_SCHEME.test(trimmedHref) || trimmedHref.startsWith('//');
};

const processStringChild = (
  child: string,
  index: number,
  startWordIndex: number,
  renderWord?: MarkdownProps['renderWord'],
  renderSpace?: MarkdownProps['renderSpace'],
) => {
  // markdown-to-jsx children can include leading/trailing/multiple spaces;
  // keep indexing stable by only creating tokens for non-whitespace words.
  const words = child.match(/\S+/g) ?? [];
  const hasLeadingSpace = /^\s/.test(child);
  const hasTrailingSpace = /\s$/.test(child);

  const rendered: React.ReactNode[] = [];
  let nextWordIndex = startWordIndex;

  // Preserve a leading space (e.g. " criticizing" after an inline element ends)
  if (hasLeadingSpace && words.length > 0) {
    const spaceIndex = nextWordIndex > 0 ? nextWordIndex - 1 : 0;
    rendered.push(
      <React.Fragment key={`${index}-leading`}>
        {renderSpace ? renderSpace(spaceIndex) : ' '}
      </React.Fragment>,
    );
  }

  words.forEach((word, localWordIndex) => {
    const wordIndex = nextWordIndex;
    nextWordIndex += 1;
    const isLast = localWordIndex === words.length - 1;

    rendered.push(
      <span key={`${index}-${localWordIndex}`} style={{ cursor: 'pointer' }}>
        {renderWord ? (
          renderWord({ word, wordIndex })
        ) : (
          <span className="conversation-word" data-word-index={wordIndex}>
            {word}
          </span>
        )}
        {/* Space between words within this chunk, or trailing space when the original string ended with whitespace */}
        {!isLast || hasTrailingSpace ? (renderSpace ? renderSpace(wordIndex) : ' ') : null}
      </span>,
    );
  });

  return {
    node: rendered,
    nextWordIndex,
  };
};

const wrapChildrenWithTranslateWrapper = (
  children: React.ReactNode,
  startWordIndex: number,
  renderWord?: MarkdownProps['renderWord'],
  renderSpace?: MarkdownProps['renderSpace'],
): { node: React.ReactNode; nextWordIndex: number } => {
  if (typeof children === 'string') {
    return processStringChild(children, 0, startWordIndex, renderWord, renderSpace);
  }

  if (Array.isArray(children)) {
    let nextWordIndex = startWordIndex;

    const mappedChildren = children.map((child, index) => {
      if (typeof child === 'string') {
        const result = processStringChild(child, index, nextWordIndex, renderWord, renderSpace);
        nextWordIndex = result.nextWordIndex;
        return result.node;
      }

      if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
        const wrappedResult = wrapChildrenWithTranslateWrapper(
          child.props.children,
          nextWordIndex,
          renderWord,
          renderSpace,
        );
        nextWordIndex = wrappedResult.nextWordIndex;

        return React.cloneElement(child, undefined, wrappedResult.node);
      }

      return child;
    });

    return {
      node: mappedChildren,
      nextWordIndex,
    };
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    const wrappedResult = wrapChildrenWithTranslateWrapper(
      children.props.children,
      startWordIndex,
      renderWord,
      renderSpace,
    );

    return {
      node: React.cloneElement(children, undefined, wrappedResult.node),
      nextWordIndex: wrappedResult.nextWordIndex,
    };
  }

  return {
    node: children,
    nextWordIndex: startWordIndex,
  };
};

const createMarkdownComponents = (
  imageDataUrlByHref?: Record<string, string>,
  imageAspectRatioByHref?: Record<string, number>,
  maxImageHeight?: number,
  getInternalChapterTargetPage?: (href: string) => number | null,
  onInternalChapterLinkSelect?: (targetPage: number) => void,
): MarkdownToJSX.Overrides => ({
  h1: ({ children }) => (
    <Typography component="h1" sx={{ fontSize: 'inherit', fontWeight: 800, m: 0, p: 0 }}>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography component="h2" sx={{ fontSize: 'inherit', fontWeight: 700, m: 0, p: 0 }}>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography component="h3" sx={{ fontSize: 'inherit', fontWeight: 700, m: 0, p: 0 }}>
      {children}
    </Typography>
  ),
  h4: ({ children }) => (
    <Typography component="h4" sx={{ fontSize: 'inherit', fontWeight: 600, m: 0, p: 0 }}>
      {children}
    </Typography>
  ),
  h5: ({ children }) => (
    <Typography component="h5" sx={{ fontSize: 'inherit', fontWeight: 600, m: 0, p: 0 }}>
      {children}
    </Typography>
  ),
  h6: ({ children }) => (
    <Typography component="h6" sx={{ fontSize: 'inherit', fontWeight: 500, m: 0, p: 0 }}>
      {children}
    </Typography>
  ),

  p: ({ children }) => <span>{children}</span>,
  span: ({ children }) => <span>{children}</span>,

  a: ({ href, children }) => {
    if (!href) {
      return <span>{children}</span>;
    }

    if (isExternalHref(href)) {
      return (
        <Link href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </Link>
      );
    }

    const targetPage = getInternalChapterTargetPage?.(href) ?? null;
    if (targetPage == null || !onInternalChapterLinkSelect) {
      return <span>{children}</span>;
    }

    return (
      <Link
        href={href}
        onClick={(event) => {
          event.preventDefault();
          onInternalChapterLinkSelect(targetPage);
        }}
      >
        {children}
      </Link>
    );
  },
  ul: ({ children }) => (
    <ul
      style={{
        padding: '0 0 0 20px',
        margin: '5px 0',
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      style={{
        padding: '0 0 0 20px',
        margin: '5px 0',
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => <Typography component={'li'}>{children}</Typography>,
  input: ({ checked }) => (
    <Checkbox
      checked={checked}
      disabled
      sx={{
        padding: '0',
      }}
    />
  ),
  small: ({ children }) => <Typography>{children}</Typography>,
  em: ({ children }) => <em>{children}</em>,
  strong: ({ children }) => <strong>{children}</strong>,
  blockquote: ({ children }) => (
    <Stack
      component={'blockquote'}
      sx={{
        margin: '0px 0px 0px 0',
        padding: '0px 0px 0px 0px',
      }}
    >
      {children}
    </Stack>
  ),
  pre: ({ children }) => <pre>{children}</pre>,
  code: ({ children }) => <code>{children}</code>,
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th>{children}</th>,
  td: ({ children }) => <td>{children}</td>,
  table: ({ children }) => <table>{children}</table>,
  img: (props) => {
    const rawSrc = typeof props.src === 'string' ? props.src : '';
    const normalizedSrc = normalizeImageHref(rawSrc);
    const resolvedSrc =
      imageDataUrlByHref?.[normalizedSrc] || imageDataUrlByHref?.[rawSrc] || props.src;
    const resolvedAspectRatio =
      imageAspectRatioByHref?.[normalizedSrc] || imageAspectRatioByHref?.[rawSrc];
    const safeAspectRatio =
      typeof resolvedAspectRatio === 'number' && Number.isFinite(resolvedAspectRatio)
        ? resolvedAspectRatio
        : undefined;
    const safeMaxImageHeight =
      typeof maxImageHeight === 'number' && Number.isFinite(maxImageHeight) && maxImageHeight > 0
        ? maxImageHeight
        : undefined;

    return (
      <img
        {...props}
        src={resolvedSrc}
        style={{
          maxWidth: '90%',
          width: 'auto',
          maxHeight: safeMaxImageHeight ? `${safeMaxImageHeight}px` : undefined,
          height: 'auto',
          display: 'block',
          ...(safeAspectRatio ? { aspectRatio: `${safeAspectRatio}` } : {}),
        }}
      />
    );
  },
});

export const ReaderMarkdown: React.FC<MarkdownProps> = ({
  children,
  words,
  imageDataUrlByHref,
  imageAspectRatioByHref,
  maxImageHeight,
  getInternalChapterTargetPage,
  onInternalChapterLinkSelect,
  onWordClick,
  onWordMouseEnter,
  onWordMouseMove,
  renderWord,
  renderSpace,
}) => {
  const styleComponents = createMarkdownComponents(
    imageDataUrlByHref,
    imageAspectRatioByHref,
    maxImageHeight,
    getInternalChapterTargetPage,
    onInternalChapterLinkSelect,
  );

  const renderWordsDirectly = words && words.length > 0;
  const wrapNodeChildren = (nodeChildren: React.ReactNode) =>
    wrapChildrenWithTranslateWrapper(nodeChildren, 0, renderWord, renderSpace).node;

  return (
    <Stack
      component="div"
      sx={{
        display: 'inline',
        '.conversation-word':
          onWordClick || onWordMouseEnter
            ? {
                ':hover': {
                  //
                },
              }
            : {},
      }}
      onMouseDown={
        onWordClick
          ? (e) => {
              const target = e.target as HTMLElement;
              if (target.classList.contains('conversation-word')) {
                const word = target.textContent || '';
                const element = target;
                const wordIndex = Number(element.dataset.wordIndex);
                onWordClick(word.trim(), element, Number.isNaN(wordIndex) ? 0 : wordIndex, e);
              }
            }
          : undefined
      }
      onMouseOver={
        onWordMouseEnter
          ? (e) => {
              const target = e.target as HTMLElement;
              const element = target.closest('.conversation-word') as HTMLElement | null;
              if (!element) return;

              const relatedTarget = e.relatedTarget as Node | null;
              if (relatedTarget && element.contains(relatedTarget)) {
                return;
              }

              const word = element.textContent || '';
              const wordIndex = Number(element.dataset.wordIndex);
              onWordMouseEnter(word.trim(), element, Number.isNaN(wordIndex) ? 0 : wordIndex, e);
            }
          : undefined
      }
      onMouseMove={
        onWordMouseMove
          ? (e) => {
              const target = e.target as HTMLElement;
              const element = target.closest('.conversation-word') as HTMLElement | null;
              if (!element) return;

              const word = element.textContent || '';
              const wordIndex = Number(element.dataset.wordIndex);
              onWordMouseMove(word.trim(), element, Number.isNaN(wordIndex) ? 0 : wordIndex, e);
            }
          : undefined
      }
    >
      {renderWordsDirectly ? (
        words.map((word, wordIndex) => (
          <span key={wordIndex} style={{ cursor: 'pointer' }}>
            {renderWord ? (
              renderWord({ word, wordIndex })
            ) : (
              <span className="conversation-word" data-word-index={wordIndex}>
                {word}
              </span>
            )}
            {wordIndex < words.length - 1 ? (renderSpace ? renderSpace(wordIndex) : ' ') : null}
          </span>
        ))
      ) : (
        <MarkdownTool
          options={{
            forceBlock: true,
            overrides: {
              ...styleComponents,
              p: ({ children: nodeChildren }) => <span>{wrapNodeChildren(nodeChildren)}</span>,
            },
          }}
        >
          {children}
        </MarkdownTool>
      )}
    </Stack>
  );
};

export const Markdown = ReaderMarkdown;
