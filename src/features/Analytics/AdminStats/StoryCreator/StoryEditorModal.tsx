import { Story } from '@/features/Sentence/types';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { Button, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTextAi } from '@/features/Ai/useTextAi';

export const StoryEditorModal = ({
  story,
  update,
  deleteStory,
  onClose,
}: {
  story: Story;
  update: (story: Story) => void;
  deleteStory: (story: Story) => void;
  onClose: () => void;
}) => {
  const [internalStory, setInternalStory] = useState(story);

  const ai = useTextAi();
  const generateTitleAndDescription = async () => {
    const data = [story.title, story.subtitle, story.textEn].filter(Boolean).join('\n');
    const titleAndSubtitle = await ai.generateJson<{ title: string; subtitle: string }>({
      systemMessage:
        'Based on the following info, generate a concise title (max 5 words) and a subtitle (max 10 words) that captures the essence of the story. Return the result in JSON format with "title" and "subtitle" fields.',
      attempts: 3,
      userMessage: data,
      model: 'gpt-4o',
    });

    if (titleAndSubtitle) {
      setInternalStory({
        ...internalStory,
        title: titleAndSubtitle.title,
        subtitle: titleAndSubtitle.subtitle,
      });
    }
  };

  useEffect(() => {
    setInternalStory(story);
  }, [story]);

  const onSave = () => {
    update(internalStory);
    onClose();
  };

  const onDelete = () => {
    const isConfirmed = window.confirm('Are you sure you want to delete this story?');
    if (!isConfirmed) return;
    deleteStory(internalStory);
    onClose();
  };

  return (
    <CustomModal isOpen={true} onClose={onClose}>
      <Stack
        sx={{
          width: '100%',
          gap: '20px',
        }}
      >
        <Stack
          sx={{
            width: '600px',
            height: '600px',
            position: 'relative',
          }}
        >
          <Image
            src={internalStory.imageUrl}
            alt="Story Image"
            fill
            sizes="800px"
            style={{
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          />
        </Stack>

        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Button variant="outlined" onClick={generateTitleAndDescription}>
            Generate Title & Subtitle with AI
          </Button>
        </Stack>

        <TextField
          label="Title"
          value={internalStory.title || ''}
          onChange={(e) => setInternalStory({ ...internalStory, title: e.target.value })}
          fullWidth
        />
        <TextField
          label="Subtitle"
          value={internalStory.subtitle || ''}
          onChange={(e) => setInternalStory({ ...internalStory, subtitle: e.target.value })}
          fullWidth
        />
        <TextField
          label="Text (EN)"
          value={internalStory.textEn || ''}
          onChange={(e) => setInternalStory({ ...internalStory, textEn: e.target.value })}
          fullWidth
          multiline
          rows={20}
        />

        <Stack
          sx={{
            flexDirection: 'row',
            gap: 2,
            justifyContent: 'space-between',
            paddingTop: '30px',
          }}
        >
          <Stack
            sx={{
              flexDirection: 'row',
              gap: 2,
            }}
          >
            <Button variant="contained" onClick={onSave}>
              Save
            </Button>
            <Button
              onClick={() => {
                setInternalStory({ ...internalStory, isPublished: !internalStory.isPublished });
              }}
            >
              {story.isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          </Stack>

          <Button color="error" onClick={onDelete}>
            Delete
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
