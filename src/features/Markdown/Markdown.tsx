import { Checkbox, Link, Typography } from "@mui/material";
import { MarkdownToJSX, default as MarkdownTool } from "markdown-to-jsx";
import React from "react";

export interface MarkdownProps {
  children: string;
  size?: "small" | "normal";
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
  h3: ({ children }) => <Typography variant="h3">{children}</Typography>,
  h4: ({ children }) => <Typography variant="h4">{children}</Typography>,
  h5: ({ children }) => <Typography variant="h5">{children}</Typography>,
  h6: ({ children }) => <Typography variant="h6">{children}</Typography>,

  p: ({ children }) => (
    <Typography
      sx={{
        padding: "3px 0 5px 0",
        fontSize: "20px",
      }}
    >
      {children}
    </Typography>
  ),
  span: ({ children }) => (
    <Typography
      sx={{
        padding: "3px 0 5px 0",
        fontSize: "20px",
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
  li: ({ children }) => (
    <Typography variant="body2" component={"li"}>
      {children}
    </Typography>
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

export const Markdown: React.FC<MarkdownProps> = ({ children, size }) => {
  const styleComponents = size === "small" ? markdownComponentsSmall : markdownComponents;
  return <MarkdownTool options={{ overrides: styleComponents }}>{children}</MarkdownTool>;
};
