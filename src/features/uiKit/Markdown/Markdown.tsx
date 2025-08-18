import { Checkbox, Link, Stack, Typography } from "@mui/material";
import { MarkdownToJSX, default as MarkdownTool } from "markdown-to-jsx";
import React from "react";

export interface MarkdownProps {
  children: string;
  variant?: "small" | "normal" | "conversation" | "blog";
  onWordClick?: (word: string) => void;
}

const processStringChild = (child: string, index: number) => {
  const words = child.split(" ");
  return words.map((word, wordIndex) => (
    <span key={`${index}-${wordIndex}`} className="conversation-word">
      {word}{" "}
    </span>
  ));
};

const wrapChildrenWithTranslateWrapper = (children: React.ReactNode) => {
  const isChildrenIsArray = Array.isArray(children);
  if (!isChildrenIsArray) {
    const isString = typeof children === "string";
    if (isString) {
      return processStringChild(children, 0);
    }

    return children;
  }

  const processedChildren = children.map((child, index) => {
    if (typeof child === "string") {
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
        paddingTop: "20px",
      }}
    >
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography
      variant="h4"
      component={"h3"}
      sx={{
        paddingTop: "20px",
      }}
    >
      {children}
    </Typography>
  ),
  h4: ({ children }) => (
    <Typography
      variant="h5"
      component={"h4"}
      sx={{
        paddingTop: "20px",
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
        padding: "3px 0 5px 0",
        fontSize: "18px",
      }}
    >
      {children}
    </Typography>
  ),
  span: ({ children }) => (
    <Typography
      sx={{
        padding: "3px 0 5px 0",
        fontSize: "18px",
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
        padding: "0 0 0 20px",
        margin: "5px 0",
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      style={{
        padding: "0 0 0 20px",
        margin: "5px 0",
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => <Typography component={"li"}>{children}</Typography>,
  input: ({ checked }) => (
    <Checkbox
      checked={checked}
      disabled
      sx={{
        padding: "0",
      }}
    />
  ),
  small: ({ children }) => <Typography>{children}</Typography>,
  em: ({ children }) => <em>{children}</em>,
  strong: ({ children }) => <strong>{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: "10px 10px 10px 0",
        padding: "5px 10px 5px 15px",
        borderLeft: "4px solid rgba(0, 0, 0, 0.1)",
      }}
    >
      {children}
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
  img: (props) => <img {...props} style={{ maxWidth: "90%" }} />,
};

const markdownComponentsSmall: MarkdownToJSX.Overrides = {
  ...markdownComponents,
  p: ({ children }) => (
    <Typography
      sx={{
        padding: "2px 0 2px 0",
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
        padding: "5px 0 10px 0",
        fontSize: "1.1rem",
      }}
      variant="body1"
    >
      {children}
    </Typography>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: "10px 10px 10px 0",
        padding: "5px 10px 5px 15px",
        borderLeft: "4px solid rgba(0, 0, 0, 0.1)",
      }}
    >
      {children}
    </blockquote>
  ),
  img: (props) => <img {...props} style={{ maxWidth: "100%" }} />,
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
        paddingTop: "20px",
      }}
    >
      {wrapChildrenWithTranslateWrapper(children)}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography
      variant="h4"
      component={"h3"}
      sx={{
        paddingTop: "20px",
      }}
    >
      {wrapChildrenWithTranslateWrapper(children)}
    </Typography>
  ),
  h4: ({ children }) => (
    <Typography
      variant="h5"
      component={"h4"}
      sx={{
        paddingTop: "20px",
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
        padding: "0 0 0 20px",
        margin: "5px 0",
      }}
    >
      {wrapChildrenWithTranslateWrapper(children)}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      style={{
        padding: "0 0 0 20px",
        margin: "5px 0",
      }}
    >
      {wrapChildrenWithTranslateWrapper(children)}
    </ol>
  ),
  li: ({ children }) => (
    <Typography component={"li"}>{wrapChildrenWithTranslateWrapper(children)}</Typography>
  ),
  input: ({ checked }) => (
    <Checkbox
      checked={checked}
      disabled
      sx={{
        padding: "0",
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
          fontSize: "21px",
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
          fontSize: "21px",
        }}
      >
        {wrapChildrenWithTranslateWrapper(children)}
      </Typography>
    );
  },
};

export const Markdown: React.FC<MarkdownProps> = ({ children, onWordClick, variant }) => {
  const styleComponents =
    variant === "small"
      ? markdownComponentsSmall
      : variant === "conversation"
        ? markdownComponentsConversation
        : variant === "blog"
          ? markdownComponentsBlog
          : markdownComponents;

  return (
    <Stack
      sx={{
        ".conversation-word": onWordClick
          ? {
              ":hover": {
                cursor: "pointer",
                borderBottom: "1px dashed #fff",
              },
            }
          : {},
      }}
      onMouseDown={
        onWordClick
          ? (e) => {
              const target = e.target as HTMLElement;
              if (target.classList.contains("conversation-word")) {
                const word = target.textContent || "";
                onWordClick(word.trim());
              }
            }
          : undefined
      }
    >
      <MarkdownTool options={{ overrides: styleComponents }}>{children}</MarkdownTool>
    </Stack>
  );
};
