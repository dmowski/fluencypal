import { Checkbox, Link, Stack, Typography } from "@mui/material";
import { MarkdownToJSX, default as MarkdownTool } from "markdown-to-jsx";
import React from "react";

export interface MarkdownProps {
  children: string;
  size?: "small" | "normal" | "conversation";
  onWordClick?: (word: string) => void;
}

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
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
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

const markdownComponentsConversation: MarkdownToJSX.Overrides = {
  ...markdownComponents,
  p: ({ children }) => {
    const isString = typeof children?.[0] === "string";
    console.log("isString:", isString);
    let content = children;
    if (isString) {
      const words = children[0].split(" ") as string[];
      content = words.map((word, index) => (
        <span key={index}>
          <span className="conversation-word">{word}</span>{" "}
        </span>
      ));
    }
    return (
      <Typography
        sx={{
          fontSize: "21px",
          fontWeight: 350,
        }}
      >
        {content}
      </Typography>
    );
  },

  span: ({ children }) => {
    console.log("children", children);
    const isString = typeof children?.[0] === "string" || typeof children === "string";
    console.log("isString:", isString);
    let content = children;
    if (isString) {
      const stringContent = typeof children === "string" ? children : children[0];
      const words = stringContent.split(" ") as string[];
      console.log("words:", words);
      content = words.map((word, index) => (
        <span key={index}>
          <span className="conversation-word">{word}</span>{" "}
        </span>
      ));
    }

    return (
      <Typography
        sx={{
          fontSize: "21px",
        }}
      >
        {content}
      </Typography>
    );
  },
};

export const Markdown: React.FC<MarkdownProps> = ({ children, onWordClick, size }) => {
  const styleComponents =
    size === "small"
      ? markdownComponentsSmall
      : size === "conversation"
        ? markdownComponentsConversation
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
              console.log("target:", target);
              if (target.classList.contains("conversation-word")) {
                onWordClick(target.textContent || "");
              }
            }
          : undefined
      }
    >
      <MarkdownTool options={{ overrides: styleComponents }}>{children}</MarkdownTool>
    </Stack>
  );
};
