'use client';

import { Checkbox, Link, Stack, Typography } from '@mui/material';
import { MarkdownToJSX, default as MarkdownTool } from 'markdown-to-jsx';
import React from 'react';

type MdVariantVariant = 'small' | 'normal' | 'conversation' | 'blog' | 'chat';
export interface MarkdownProps {
  children: string;
  variant?: MdVariantVariant;
  onWordClick?: (word: string, element: HTMLElement) => void;
}

const processStringChild = (child: string, index: number) => {
  const words = child.split(' ');
  return words.map((word, wordIndex) => (
    <span key={`${index}-${wordIndex}`} className="conversation-word">
      {word}{' '}
    </span>
  ));
};

const wrapChildrenWithTranslateWrapper = (children: React.ReactNode) => {
  const isChildrenIsArray = Array.isArray(children);
  if (!isChildrenIsArray) {
    const isString = typeof children === 'string';
    if (isString) {
      return processStringChild(children, 0);
    }

    return children;
  }

  const processedChildren = children.map((child, index) => {
    if (typeof child === 'string') {
      return processStringChild(child, index);
    }
    return child;
  });

  return processedChildren;
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

  p: ({ children }) => (
    <Typography
      sx={{
        padding: '3px 0 5px 0',
        fontSize: '18px',
      }}
    >
      {children}
    </Typography>
  ),
  span: ({ children }) => (
    <Typography
      sx={{
        padding: '3px 0 5px 0',
        fontSize: '18px',
      }}
    >
      {children}
    </Typography>
  ),
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

const markdownComponentsSmall: MarkdownToJSX.Overrides = {
  ...markdownComponents,
  p: ({ children }) => (
    <Typography
      sx={{
        padding: '2px 0 2px 0',
      }}
    >
      {children}
    </Typography>
  ),
};

const markdownComponentsBlog: MarkdownToJSX.Overrides = {
  ...markdownComponents,
  p: ({ children }) => (
    <Typography
      sx={{
        padding: '5px 0 10px 0',
        fontSize: '1.15rem',
      }}
      variant="body1"
    >
      {children}
    </Typography>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: '10px 10px 10px 0',
        padding: '5px 10px 5px 15px',
        borderLeft: '4px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      {children}
    </blockquote>
  ),
  img: (props) => <img {...props} style={{ maxWidth: '100%' }} />,
};

const markdownComponentsConversation: MarkdownToJSX.Overrides = {
  ...markdownComponents,

  h1: ({ children }) => (
    <Typography variant="h1">{wrapChildrenWithTranslateWrapper(children)}</Typography>
  ),
  h2: ({ children }) => (
    <Typography
      variant="h2"
      sx={{
        paddingTop: '20px',
      }}
    >
      {wrapChildrenWithTranslateWrapper(children)}
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
      {wrapChildrenWithTranslateWrapper(children)}
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
      {wrapChildrenWithTranslateWrapper(children)}
    </Typography>
  ),
  h5: ({ children }) => (
    <Typography variant="h5">{wrapChildrenWithTranslateWrapper(children)}</Typography>
  ),
  h6: ({ children }) => (
    <Typography variant="h6">{wrapChildrenWithTranslateWrapper(children)}</Typography>
  ),

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
      {wrapChildrenWithTranslateWrapper(children)}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      style={{
        padding: '0 0 0 20px',
        margin: '5px 0',
      }}
    >
      {wrapChildrenWithTranslateWrapper(children)}
    </ol>
  ),
  li: ({ children }) => (
    <Typography component={'li'}>{wrapChildrenWithTranslateWrapper(children)}</Typography>
  ),
  input: ({ checked }) => (
    <Checkbox
      checked={checked}
      disabled
      sx={{
        padding: '0',
      }}
    />
  ),
  small: ({ children }) => <Typography>{wrapChildrenWithTranslateWrapper(children)}</Typography>,
  em: ({ children }) => <em>{wrapChildrenWithTranslateWrapper(children)}</em>,
  strong: ({ children }) => <strong>{wrapChildrenWithTranslateWrapper(children)}</strong>,
  blockquote: ({ children }) => (
    <blockquote>{wrapChildrenWithTranslateWrapper(children)}</blockquote>
  ),
  pre: ({ children }) => <pre>{children}</pre>,
  code: ({ children }) => <code>{children}</code>,
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th>{children}</th>,
  td: ({ children }) => <td>{children}</td>,
  table: ({ children }) => <table>{children}</table>,
  p: ({ children }) => {
    return (
      <Typography
        sx={{
          fontSize: '21px',
          fontWeight: 350,
        }}
      >
        {wrapChildrenWithTranslateWrapper(children)}
      </Typography>
    );
  },

  span: ({ children }) => {
    return (
      <Typography
        sx={{
          fontSize: '21px',
        }}
      >
        {wrapChildrenWithTranslateWrapper(children)}
      </Typography>
    );
  },
};

const markdownComponentsChat: MarkdownToJSX.Overrides = {
  ...markdownComponents,

  h1: ({ children }) => (
    <Typography
      variant="h1"
      sx={{
        fontSize: '24px',
        fontWeight: 500,
      }}
    >
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography
      variant="h2"
      sx={{
        paddingTop: '20px',
        fontSize: '22px',
        fontWeight: 500,
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
        fontSize: '20px',
        fontWeight: 500,
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
        fontSize: '18px',
        fontWeight: 500,
      }}
    >
      {children}
    </Typography>
  ),
  h5: ({ children }) => (
    <Typography
      variant="h5"
      sx={{
        fontSize: '18px',
        fontWeight: 500,
      }}
    >
      {children}
    </Typography>
  ),
  h6: ({ children }) => (
    <Typography
      variant="h6"
      sx={{
        fontSize: '18px',
        fontWeight: 500,
      }}
    >
      {children}
    </Typography>
  ),
  p: ({ children }) => (
    <Typography
      sx={{
        padding: '4px 0',
      }}
    >
      {children}
    </Typography>
  ),
  blockquote: ({ children }) => (
    <Stack
      component={'blockquote'}
      sx={{
        borderLeft: '3px solid rgba(255, 255, 255, 0.2)',
        marginLeft: 0,
        paddingLeft: '10px',
        color: 'rgba(255, 255, 255, 0.6)',
        padding: '0 0 0 13px',
      }}
    >
      {children}
    </Stack>
  ),
};

const styleVariationMap: Record<MdVariantVariant, MarkdownToJSX.Overrides> = {
  small: markdownComponentsSmall,
  normal: markdownComponents,
  conversation: markdownComponentsConversation,
  blog: markdownComponentsBlog,
  chat: markdownComponentsChat,
};

export const Markdown: React.FC<MarkdownProps> = ({ children, onWordClick, variant }) => {
  const variantToUse = variant || 'normal';
  const styleComponents = styleVariationMap[variantToUse];

  return (
    <Stack
      sx={{
        '.conversation-word': onWordClick
          ? {
              ':hover': {
                cursor: 'pointer',
                borderBottom: '1px dashed #fff',
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
                onWordClick(word.trim(), element);
              }
            }
          : undefined
      }
    >
      <MarkdownTool options={{ overrides: styleComponents }}>{children}</MarkdownTool>
    </Stack>
  );
};
