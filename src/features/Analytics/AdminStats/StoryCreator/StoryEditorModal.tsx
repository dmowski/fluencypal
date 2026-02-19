import { Story } from '@/features/Sentence/types';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { Button, Checkbox, FormControlLabel, Stack, TextField } from '@mui/material';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const generateTitleAndDescription = async () => {
    const data = [story.title, story.subtitle, story.textEn].filter(Boolean).join('\n');
    setIsGenerating(true);
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
    setIsGenerating(false);
  };

  const defaultStorySystemInstruction =
    'Based on the title, subtitle, and existing story text, generate an engaging story text in English that fits the title and subtitle. Expand on the details and create a compelling narrative. Return only the story text without any additional commentary.';

  const generateStoryText = async () => {
    setIsGenerating(true);
    const data = [story.title, story.subtitle, story.textEn].filter(Boolean).join('\n');
    const systemMessage = internalStory.storySystemInstruction || defaultStorySystemInstruction;

    const generatedText = await ai.generate({
      systemMessage,
      userMessage: data,
      model: 'gpt-4o',
    });

    if (generatedText) {
      setInternalStory({
        ...internalStory,
        textEn: generatedText,
      });
    }
    setIsGenerating(false);
  };

  const generateAudioDescription = async () => {
    setIsGenerating(true);
    const data = [story.title, story.subtitle, story.textEn].filter(Boolean).join('\n');
    const systemMessage = `Based on the story data, create me description for an audio generation model. The description should be concise and capture the essence of the story, highlighting key themes, emotions, and settings. It should be designed to inspire the creation of an audio experience that complements the narrative. Return only the description without any additional commentary. No longer that 60 words.`;

    const generatedText = await ai.generate({
      systemMessage,
      userMessage: data,
      model: 'gpt-4o',
    });

    if (generatedText) {
      setInternalStory({
        ...internalStory,
        sunoPrompt: generatedText,
      });
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    setInternalStory(story);
  }, [story]);

  const onSave = () => {
    update(internalStory);
  };

  const isNeedToSave = JSON.stringify(story) !== JSON.stringify(internalStory);

  const onDelete = () => {
    const isConfirmed = window.confirm('Are you sure you want to delete this story?');
    if (!isConfirmed) return;
    deleteStory(internalStory);
    onClose();
  };

  const textWordsCount = internalStory.textEn ? internalStory.textEn.split(/\s+/).length : 0;

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
            flexDirection: 'row',
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
              gap: '30px',
            }}
          >
            <TextField
              label="Story System Instruction"
              value={internalStory.storySystemInstruction || defaultStorySystemInstruction}
              onChange={(e) =>
                setInternalStory({ ...internalStory, storySystemInstruction: e.target.value })
              }
              sx={{
                width: '700px',
              }}
              multiline
              rows={6}
            />

            <Stack
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Button
                variant="outlined"
                onClick={generateTitleAndDescription}
                disabled={isGenerating}
              >
                Generate Title & Subtitle with AI
              </Button>

              <Button variant="outlined" onClick={generateStoryText} disabled={isGenerating}>
                Generate Story Text with AI
              </Button>

              <Button variant="outlined" onClick={generateAudioDescription} disabled={isGenerating}>
                Generate Audio Description
              </Button>
            </Stack>

            <TextField
              label="Audio Description for Audio Generation Models (like Suno)"
              value={internalStory.sunoPrompt || ''}
              onChange={(e) => setInternalStory({ ...internalStory, sunoPrompt: e.target.value })}
              sx={{
                width: '700px',
              }}
              multiline
              rows={6}
            />
          </Stack>
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
          label={`Text (EN) - ${textWordsCount} words`}
          value={internalStory.textEn || ''}
          onChange={(e) => setInternalStory({ ...internalStory, textEn: e.target.value })}
          fullWidth
          multiline
          rows={20}
        />

        <FormControlLabel
          checked={internalStory.isPublished || false}
          onChange={(e) =>
            setInternalStory({ ...internalStory, isPublished: !internalStory.isPublished })
          }
          control={<Checkbox size="large" />}
          label={<Stack>Published</Stack>}
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
            <Button
              variant={isNeedToSave ? 'contained' : 'outlined'}
              onClick={onSave}
              sx={{
                padding: '30px 120px',
              }}
            >
              Save
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
