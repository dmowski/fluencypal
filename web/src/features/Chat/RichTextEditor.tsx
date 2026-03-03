'use client';

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
  );
}
