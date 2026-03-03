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
  quotePlugin,
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
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '3px',
        backgroundColor: 'rgba(255, 255, 255, 0.01)',
      }}
    >
      <MDXEditor
        markdown={value}
        onChange={(nextValue) => onChange(nextValue || '')}
        plugins={[
          headingsPlugin({
            allowedHeadingLevels: [1, 2, 3, 4],
          }),
          quotePlugin(),
          listsPlugin(),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <BoldItalicUnderlineToggles />
                <BlockTypeSelect />
                <ListsToggle options={['bullet', 'number']} />
              </>
            ),
          }),
        ]}
      />
    </Stack>
  );
}
