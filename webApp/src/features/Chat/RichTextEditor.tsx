'use client';

import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import {
  MDXEditor,
  BoldItalicUnderlineToggles,
  InsertImage,
  ListsToggle,
  headingsPlugin,
  imagePlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { sendUploadFileRequest } from '@/app/api/uploadFile/sendUploadFileRequest';
import { useAuth } from '../Auth/useAuth';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** When this changes, the editor remounts with the current `value`. */
  reloadKey?: string | number;
}

export function RichTextEditor({ value, onChange, reloadKey }: RichTextEditorProps) {
  const { i18n } = useLingui();
  const auth = useAuth();

  const onUploadImage = async (image: File): Promise<string> => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(image.type)) {
      throw new Error(i18n._('Please select a valid image file (JPEG, PNG, GIF, or WebP)'));
    }

    const maxSize = 50 * 1024 * 1024;
    if (image.size > maxSize) {
      throw new Error(i18n._('File size must be less than 50MB'));
    }

    const authToken = await auth.getToken();
    const result = await sendUploadFileRequest({ file: image, type: 'image' }, authToken);

    if (result.error || !result.uploadUrl) {
      throw new Error(i18n._('Failed to upload image. Please try again.'));
    }

    return result.uploadUrl;
  };

  return (
    <Stack
      className="dark"
      sx={{
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '13px',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        '.mdxeditor-toolbar': {
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '13px 13px 0 0',
        },
        '.mdxeditor img': {
          width: '140px',
          maxWidth: '140px',
          height: 'auto',
        },
        '.mdxeditor blockquote': {
          borderLeft: '3px solid rgba(255, 255, 255, 0.2)',
          marginLeft: 0,
          paddingLeft: '10px',
          color: 'rgba(255, 255, 255, 0.6)',
          padding: '0 0 0 13px',
        },
        '[aria-label="editable markdown"]': {
          paddingTop: 0,
        },
      }}
    >
      <MDXEditor
        key={reloadKey}
        markdown={value}
        onChange={(nextValue) => onChange(nextValue || '')}
        plugins={[
          headingsPlugin({
            allowedHeadingLevels: [1, 2, 3, 4],
          }),
          quotePlugin(),
          listsPlugin(),
          imagePlugin({
            imageUploadHandler: onUploadImage,
          }),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <BoldItalicUnderlineToggles />
                <ListsToggle options={['bullet', 'number']} />
                <InsertImage />
              </>
            ),
          }),
        ]}
      />
    </Stack>
  );
}
