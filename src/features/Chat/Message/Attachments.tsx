import { Stack } from '@mui/material';
import { AttachmentImage } from './AttachmentImage';
import { AttachmentVideo } from './AttachmentVideo';
import { ThreadsMessageAttachment } from '../type';

export const Attachments = ({
  canDelete = false,
  attachments,
  onDeleteAttachment,
  maxWidth = '200px',
}: {
  attachments: ThreadsMessageAttachment[];
  onDeleteAttachment?: (index: number) => void;
  canDelete?: boolean;
  maxWidth?: string;
}) => {
  return (
    <Stack
      sx={{
        flexDirection: 'row',
        gap: '10px',
        flexWrap: 'wrap',
        marginTop: '10px',
      }}
    >
      {attachments.map((attachment, index) => {
        if (attachment.type === 'image') {
          return (
            <AttachmentImage
              size={maxWidth}
              key={index}
              url={attachment.url}
              canDelete={canDelete}
              onDelete={() => onDeleteAttachment?.(index)}
            />
          );
        }
        if (attachment.type === 'video') {
          return (
            <AttachmentVideo
              size={maxWidth}
              key={index}
              url={attachment.url}
              canDelete={canDelete}
              onDelete={() => onDeleteAttachment?.(index)}
            />
          );
        }
        return null;
      })}
    </Stack>
  );
};
