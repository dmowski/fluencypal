'use client';

import { Checkbox, Link, Stack, Typography } from '@mui/material';
import { MarkdownToJSX, default as MarkdownTool } from 'markdown-to-jsx';
import React from 'react';
import { AttachmentImage } from '@/features/Chat/Message/AttachmentImage';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import { splitIntoSentenceParts } from './splitIntoSentenceParts';

type MdVariantVariant = 'small' | 'normal' | 'conversation' | 'blog' | 'chat' | 'rule';
export interface MarkdownProps {
  children: string;
  variant?: MdVariantVariant;
  onWordClick?: (word: string, element: HTMLElement) => void;
  onSentenceClick?: (sentence: string, element: HTMLElement) => void;
  sentenceIcon?: IconName;
}

interface WrapOptions {
  onSentenceClick?: MarkdownProps['onSentenceClick'];
  sentenceIcon?: IconName;
}

const MarkdownWrapOptionsContext = React.createContext<WrapOptions>({});

const processSentenceWords = (sentencePart: string, keyPrefix: string) => {
  const tokens = sentencePart.match(/\S+|\s+/g) || [sentencePart];

  return tokens.map((token, tokenIndex) => {
    const isWhitespace = /^\s+$/.test(token);
    if (isWhitespace) {
      return <React.Fragment key={`${keyPrefix}-space-${tokenIndex}`}>{token}</React.Fragment>;
    }

    return (
      <span key={`${keyPrefix}-word-${tokenIndex}`}>
        <span className="conversation-word">{token}</span>
      </span>
    );
  });
};

const processStringChild = (child: string, index: number, options: WrapOptions) => {
  const { onSentenceClick, sentenceIcon = 'play' } = options;

  // Keep trailing spaces attached to each sentence so icon placement feels natural.
  const sentenceParts = splitIntoSentenceParts(child);

  return sentenceParts.map((sentencePart, sentenceIndex) => {
    const coreSentence = sentencePart.replace(/\s+$/, '');
    const trailingWhitespace = sentencePart.slice(coreSentence.length);
    const sentenceText = coreSentence.trim();

    if (!sentenceText) {
      return (
        <React.Fragment key={`${index}-${sentenceIndex}-empty`}>{sentencePart}</React.Fragment>
      );
    }

    return (
      <React.Fragment key={`${index}-${sentenceIndex}`}>
        {onSentenceClick ? (
          <Stack
            component={'span'}
            className="conversation-sentence-icon-trigger"
            data-sentence={sentenceText}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              marginLeft: '0px',
              marginRight: '0px',
              verticalAlign: 'middle',
              position: 'relative',
              top: '-3px',
              padding: '7px',
              borderRadius: '14px',
              ':hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <DynamicIcon
              className="conversation-sentence-icon"
              name={sentenceIcon}
              size={15}
              strokeWidth={2.2}
            />
          </Stack>
        ) : null}
        {processSentenceWords(coreSentence, `${index}-${sentenceIndex}`)}
        {trailingWhitespace}
      </React.Fragment>
    );
  });
};

const wrapChildrenWithTranslateWrapper = (children: React.ReactNode, options: WrapOptions = {}) => {
  const isChildrenIsArray = Array.isArray(children);
  if (!isChildrenIsArray) {
    const isString = typeof children === 'string';
    if (isString) {
      return processStringChild(children, 0, options);
    }

    return children;
  }

  const processedChildren = children.map((child, index) => {
    if (typeof child === 'string') {
      return processStringChild(child, index, options);
    }
    return child;
  });

  return processedChildren;
};

const WrappedChildren = ({ children }: { children: React.ReactNode }) => {
  const options = React.useContext(MarkdownWrapOptionsContext);
  return <>{wrapChildrenWithTranslateWrapper(children, options)}</>;
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
    <Typography variant="h1">
      <WrappedChildren>{children}</WrappedChildren>
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography
      variant="h2"
      sx={{
        paddingTop: '20px',
      }}
    >
      <WrappedChildren>{children}</WrappedChildren>
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
      <WrappedChildren>{children}</WrappedChildren>
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
      <WrappedChildren>{children}</WrappedChildren>
    </Typography>
  ),
  h5: ({ children }) => (
    <Typography variant="h5">
      <WrappedChildren>{children}</WrappedChildren>
    </Typography>
  ),
  h6: ({ children }) => (
    <Typography variant="h6">
      <WrappedChildren>{children}</WrappedChildren>
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
      <WrappedChildren>{children}</WrappedChildren>
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      style={{
        padding: '0 0 0 20px',
        margin: '14px 0',
      }}
    >
      <WrappedChildren>{children}</WrappedChildren>
    </ol>
  ),
  li: ({ children }) => (
    <Typography
      component={'li'}
      sx={{
        fontSize: '21px',
        paddingBottom: '8px',
      }}
    >
      <WrappedChildren>{children}</WrappedChildren>
    </Typography>
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
  small: ({ children }) => (
    <Typography>
      <WrappedChildren>{children}</WrappedChildren>
    </Typography>
  ),
  em: ({ children }) => (
    <em>
      <WrappedChildren>{children}</WrappedChildren>
    </em>
  ),
  strong: ({ children }) => (
    <strong>
      <WrappedChildren>{children}</WrappedChildren>
    </strong>
  ),
  blockquote: ({ children }) => (
    <blockquote>
      <WrappedChildren>{children}</WrappedChildren>
    </blockquote>
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
        <WrappedChildren>{children}</WrappedChildren>
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
        <WrappedChildren>{children}</WrappedChildren>
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

  img: ({ src }) => {
    if (!src || typeof src !== 'string') {
      return null;
    }

    const size = '200px';

    return (
      <Stack
        component={'span'}
        sx={{
          width: size,
          height: size,
          alignContent: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '5px',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        }}
      >
        <AttachmentImage
          url={src}
          canDelete={false}
          onDelete={() => {}}
          size={size}
          objectFit="contain"
        />
      </Stack>
    );
  },
};

const markdownComponentsRule: MarkdownToJSX.Overrides = {
  ...markdownComponents,

  h1: ({ children }) => (
    <Typography
      variant="h1"
      sx={{
        fontSize: '47px',
        paddingBottom: '15px',
        fontWeight: 900,
        '@media (max-width: 600px)': {
          fontSize: '32px',
        },
      }}
    >
      <WrappedChildren>{children}</WrappedChildren>
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography
      variant="h2"
      sx={{
        paddingTop: '55px',
        paddingBottom: '10px',
        fontSize: '32px',
        fontWeight: 700,
      }}
    >
      <WrappedChildren>{children}</WrappedChildren>
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography
      variant="h3"
      sx={{
        paddingTop: '25px',
        paddingBottom: '10px',
        fontSize: '24px',
        fontWeight: 500,
      }}
    >
      <WrappedChildren>{children}</WrappedChildren>
    </Typography>
  ),
  h4: ({ children }) => (
    <Typography
      variant="h4"
      sx={{
        paddingTop: '20px',
        paddingBottom: '5px',
        fontWeight: 700,
      }}
    >
      <WrappedChildren>{children}</WrappedChildren>
    </Typography>
  ),
  h5: ({ children }) => (
    <Typography variant="h5">
      <WrappedChildren>{children}</WrappedChildren>
    </Typography>
  ),
  h6: ({ children }) => (
    <Typography variant="h6">
      <WrappedChildren>{children}</WrappedChildren>
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
      <WrappedChildren>{children}</WrappedChildren>
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      style={{
        padding: '0 0 0 20px',
        margin: '14px 0',
      }}
    >
      <WrappedChildren>{children}</WrappedChildren>
    </ol>
  ),
  li: ({ children }) => (
    <Typography
      component={'li'}
      sx={{
        fontSize: '21px',
        paddingBottom: '8px',
      }}
    >
      <WrappedChildren>{children}</WrappedChildren>
    </Typography>
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
  small: ({ children }) => (
    <Typography>
      <WrappedChildren>{children}</WrappedChildren>
    </Typography>
  ),
  em: ({ children }) => (
    <em>
      <WrappedChildren>{children}</WrappedChildren>
    </em>
  ),
  strong: ({ children }) => (
    <strong>
      <WrappedChildren>{children}</WrappedChildren>
    </strong>
  ),
  blockquote: ({ children }) => (
    <Stack
      component={'blockquote'}
      sx={{
        borderLeft: '3px solid rgba(255, 255, 255, 0.2)',
        marginLeft: 0,
        color: 'rgba(255, 255, 255, .8)',
        padding: '10px 0 10px 19px',
      }}
    >
      <WrappedChildren>{children}</WrappedChildren>
    </Stack>
  ),
  pre: ({ children }) => <pre>{children}</pre>,
  code: ({ children }) => (
    <Typography
      component={'code'}
      sx={{
        backgroundColor: 'rgb(18, 48, 74)',
        padding: '4px 10px',
        borderRadius: '4px',
        fontSize: '20px',
        width: 'fit-content',
      }}
    >
      <WrappedChildren>{children}</WrappedChildren>
    </Typography>
  ),
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
        <WrappedChildren>{children}</WrappedChildren>
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
        <WrappedChildren>{children}</WrappedChildren>
      </Typography>
    );
  },
};

const styleVariationMap: Record<MdVariantVariant, MarkdownToJSX.Overrides> = {
  small: markdownComponentsSmall,
  normal: markdownComponents,
  conversation: markdownComponentsConversation,
  blog: markdownComponentsBlog,
  chat: markdownComponentsChat,
  rule: markdownComponentsRule,
};

export const Markdown: React.FC<MarkdownProps> = ({
  children,
  onWordClick,
  onSentenceClick,
  sentenceIcon,
  variant,
}) => {
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
        '.conversation-sentence-icon-trigger': onSentenceClick
          ? {
              cursor: 'pointer',
              opacity: 0.65,
              transition: 'opacity 0.2s ease',
              ':hover': {
                opacity: 1,
              },
            }
          : {},
      }}
      onMouseDown={
        onWordClick || onSentenceClick
          ? (e) => {
              const target = e.target as HTMLElement;

              const sentenceIconTrigger = target.closest(
                '.conversation-sentence-icon-trigger',
              ) as HTMLElement | null;
              if (sentenceIconTrigger && onSentenceClick) {
                const sentence = sentenceIconTrigger.getAttribute('data-sentence') || '';
                onSentenceClick(sentence.trim(), sentenceIconTrigger);
                return;
              }

              if (target.classList.contains('conversation-word') && onWordClick) {
                const word = target.textContent || '';
                const element = target;
                onWordClick(word.trim(), element);
              }
            }
          : undefined
      }
    >
      <MarkdownWrapOptionsContext.Provider value={{ onSentenceClick, sentenceIcon }}>
        <MarkdownTool options={{ overrides: styleComponents }}>{children}</MarkdownTool>
      </MarkdownWrapOptionsContext.Provider>
    </Stack>
  );
};
