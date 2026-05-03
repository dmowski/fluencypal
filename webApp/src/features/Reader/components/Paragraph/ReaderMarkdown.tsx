'use client';

import { Checkbox, Link, Stack, Typography } from '@mui/material';
import { MarkdownToJSX, default as MarkdownTool } from 'markdown-to-jsx';
import React from 'react';

type WordRenderContext = {
  nextWordIndex: number;
};

export interface ReaderMarkdownWordProps {
  word: string;
  wordIndex: number;
}

export interface MarkdownProps {
  children: string;
  words?: string[];
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

const processStringChild = (
  child: string,
  index: number,
  context: WordRenderContext,
  renderWord?: MarkdownProps['renderWord'],
  renderSpace?: MarkdownProps['renderSpace'],
) => {
  // markdown-to-jsx children can include leading/trailing/multiple spaces;
  // keep indexing stable by only creating tokens for non-whitespace words.
  const words = child.match(/\S+/g) ?? [];
  const hasLeadingSpace = /^\s/.test(child);
  const hasTrailingSpace = /\s$/.test(child);

  const rendered: React.ReactNode[] = [];

  // Preserve a leading space (e.g. " criticizing" after an inline element ends)
  if (hasLeadingSpace && words.length > 0) {
    const spaceIndex = context.nextWordIndex > 0 ? context.nextWordIndex - 1 : 0;
    rendered.push(
      <React.Fragment key={`${index}-leading`}>
        {renderSpace ? renderSpace(spaceIndex) : ' '}
      </React.Fragment>,
    );
  }

  words.forEach((word, localWordIndex) => {
    const wordIndex = context.nextWordIndex;
    context.nextWordIndex += 1;
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

  return rendered;
};

const wrapChildrenWithTranslateWrapper = (
  children: React.ReactNode,
  context: WordRenderContext,
  renderWord?: MarkdownProps['renderWord'],
  renderSpace?: MarkdownProps['renderSpace'],
): React.ReactNode => {
  if (typeof children === 'string') {
    return processStringChild(children, 0, context, renderWord, renderSpace);
  }

  if (Array.isArray(children)) {
    return children.map((child, index) => {
      if (typeof child === 'string') {
        return processStringChild(child, index, context, renderWord, renderSpace);
      }

      if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
        const wrappedChildren = wrapChildrenWithTranslateWrapper(
          child.props.children,
          context,
          renderWord,
          renderSpace,
        );

        return React.cloneElement(child, undefined, wrappedChildren);
      }

      return child;
    });
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    const wrappedChildren = wrapChildrenWithTranslateWrapper(
      children.props.children,
      context,
      renderWord,
      renderSpace,
    );

    return React.cloneElement(children, undefined, wrappedChildren);
  }

  return children;
};

const markdownComponents: MarkdownToJSX.Overrides = {
  h1: ({ children }) => <Typography variant="h1">{children}</Typography>,
  h2: ({ children }) => (
    <Typography
      variant="h2"
      sx={{
        paddingTop: '20px',
      }}
    >
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography
      variant="h4"
      component={'h3'}
      sx={{
        paddingTop: '20px',
      }}
    >
      {children}
    </Typography>
  ),
  h4: ({ children }) => (
    <Typography
      variant="h5"
      component={'h4'}
      sx={{
        paddingTop: '20px',
      }}
    >
      {children}
    </Typography>
  ),
  h5: ({ children }) => <Typography variant="h5">{children}</Typography>,
  h6: ({ children }) => <Typography variant="h6">{children}</Typography>,

  p: ({ children }) => <span>{children}</span>,
  span: ({ children }) => <span>{children}</span>,

  a: ({ href, children }) => (
    <Link href={href} target="_blank">
      {children}
    </Link>
  ),
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
        margin: '10px 10px 10px 0',
        padding: '5px 10px 5px 15px',
        borderLeft: '4px solid rgba(0, 0, 0, 0.1)',
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
  img: (props) => <img {...props} style={{ maxWidth: '90%' }} />,
};

export const ReaderMarkdown: React.FC<MarkdownProps> = ({
  children,
  words,
  onWordClick,
  onWordMouseEnter,
  onWordMouseMove,
  renderWord,
  renderSpace,
}) => {
  const wordRenderContext: WordRenderContext = {
    nextWordIndex: 0,
  };

  const styleComponents = markdownComponents;

  const renderWordsDirectly = words && words.length > 0;
  const wrapNodeChildren = (nodeChildren: React.ReactNode) =>
    wrapChildrenWithTranslateWrapper(nodeChildren, wordRenderContext, renderWord, renderSpace);

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
              span: ({ children: nodeChildren }) => <span>{wrapNodeChildren(nodeChildren)}</span>,
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
