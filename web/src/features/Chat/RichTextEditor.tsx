'use client';

import { Stack } from '@mui/material';
import {
  MDXEditor,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  return (
    <Stack
      className="dark"
      sx={{
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
      }}
    >
      <MDXEditor
        markdown={value}
        onChange={(nextValue) => onChange(nextValue || '')}
        plugins={[
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <BoldItalicUnderlineToggles />
                <BlockTypeSelect />
                <ListsToggle />
              </>
            ),
          }),
          headingsPlugin({
            allowedHeadingLevels: [1, 2, 3, 4],
          }),
          listsPlugin(),
          markdownShortcutPlugin(),
        ]}
      />
    </Stack>
  );
}
