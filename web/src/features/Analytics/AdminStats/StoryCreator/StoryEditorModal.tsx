import { Story } from '@/features/Sentence/types';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { Button, Checkbox, FormControlLabel, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTextAi } from '@/features/Ai/useTextAi';
import { UploadAudioFileButton } from '@/features/Audio/UploadAudioFileButton';
import { UploadVideoButton } from '@/features/Video/UploadVideoButton';
import { downloadAsJpg } from './downloadAsJpg';
import { Loader } from 'lucide-react';

export const StoryEditorModal = ({
  story,
  update,
  openNext,
  deleteStory,
  onClose,
}: {
  story: Story;
  update: (story: Story) => Promise<void>;
  openNext: () => void;
  deleteStory: (story: Story) => void;
  onClose: () => void;
}) => {
  const [internalStory, setInternalStory] = useState(story);

  const ai = useTextAi();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTitleAndDescription = async (inputStory?: Story) => {
    const storyToProcess = inputStory || internalStory;

    const data = [storyToProcess.title, storyToProcess.subtitle, storyToProcess.textEn]
      .filter(Boolean)
      .join('\n');
    setIsGenerating(true);
    const titleAndSubtitle = await ai.generateJson<{ title: string; subtitle: string }>({
      systemMessage:
        'Based on the following info, generate a concise title (max 5 words) and a subtitle (max 10 words) that captures the essence of the story. Return the result in JSON format with "title" and "subtitle" fields.',
      attempts: 3,
      userMessage: data,
      model: 'gpt-4o',
    });

    const resultedStory: Story = {
      ...storyToProcess,
    };

    if (titleAndSubtitle) {
      resultedStory.title = titleAndSubtitle.title;
      resultedStory.subtitle = titleAndSubtitle.subtitle;
      setInternalStory({
        ...resultedStory,
      });
    }
    setIsGenerating(false);
    return resultedStory;
  };

  const defaultStorySystemInstruction =
    'Based on the title, subtitle, and existing story text, generate an engaging story text in English that fits the title and subtitle. Expand on the details and create a compelling narrative. Use relatively short sentences as the story is aimed at language learners.';

  const generateStoryText = async (inputStory?: Story) => {
    setIsGenerating(true);
    const storyToProcess = inputStory || internalStory;
    const data = [storyToProcess.title, storyToProcess.subtitle, storyToProcess.textEn]
      .filter(Boolean)
      .join('\n');
    const systemMessage = storyToProcess.storySystemInstruction || defaultStorySystemInstruction;

    console.log('systemMessage', systemMessage);

    const generatedText = await ai.generate({
      systemMessage,
      userMessage: data,
      model: 'gpt-4o',
    });

    const resultedStory: Story = {
      ...storyToProcess,
    };

    if (generatedText) {
      resultedStory.textEn = generatedText;
      setInternalStory({
        ...resultedStory,
      });
    }
    setIsGenerating(false);
    return resultedStory;
  };

  const generateAudioDescription = async (inputStory?: Story) => {
    setIsGenerating(true);
    const storyToProcess = inputStory || internalStory;
    const data = [storyToProcess.title, storyToProcess.subtitle, storyToProcess.textEn]
      .filter(Boolean)
      .join('\n');
    const systemMessage = `Based on the story data, create me description for an audio generation model. The description should be concise and capture the essence of the story, highlighting key themes, emotions, and settings. No longer that 60 words. This audio will be played in the background while the user is reading the story, so it should evoke the right atmosphere and mood for the story.`;

    const generatedText = await ai.generate({
      systemMessage,
      userMessage: data,
      model: 'gpt-4o',
    });

    const resultedStory: Story = {
      ...storyToProcess,
    };

    if (generatedText) {
      resultedStory.sunoPrompt = generatedText;
      setInternalStory(resultedStory);
    }
    setIsGenerating(false);
    return resultedStory;
  };

  const generateVideoDescription = async (inputStory?: Story) => {
    setIsGenerating(true);
    const storyToProcess = inputStory || internalStory;
    const data = [storyToProcess.title, storyToProcess.subtitle, storyToProcess.textEn]
      .filter(Boolean)
      .join('\n');
    const systemMessage = `Based on the story data, create me description for a video generation model. The description should be concise and capture the essence of the story, highlighting key themes, emotions, and settings. No longer that 60 words. This video will be played in the background while the user is reading the story, so it should evoke the right atmosphere and mood for the story.`;

    const generatedText = await ai.generate({
      systemMessage,
      userMessage: data,
      model: 'gpt-4o',
    });

    const resultedStory: Story = {
      ...storyToProcess,
    };

    if (generatedText) {
      resultedStory.videoDescription = generatedText;
      setInternalStory(resultedStory);
    }
    setIsGenerating(false);

    return resultedStory;
  };

  const cleanUpText = (inputStory?: Story) => {
    const storyToProcess = inputStory || internalStory;
    let cleanedText = storyToProcess.textEn;

    cleanedText = cleanedText.split('—').join(' — ').split('  —  ').join(' — ');

    const resultedStory: Story = {
      ...storyToProcess,
      textEn: cleanedText,
    };

    setInternalStory(resultedStory);

    return resultedStory;
  };

  const generateAll = async () => {
    console.log('internalStory', JSON.stringify(internalStory));
    let story = await generateTitleAndDescription(internalStory);
    story = await generateStoryText(story);
    story = await generateAudioDescription(story);
    story = await generateVideoDescription(story);
    cleanUpText(story);
  };

  useEffect(() => {
    setInternalStory(story);
  }, [story]);

  const onSave = async () => {
    await update(internalStory);
    openNext();
  };

  const isNeedToSave = JSON.stringify(story) !== JSON.stringify(internalStory);

  const onDelete = () => {
    const isConfirmed = window.confirm('Are you sure you want to delete this story?');
    if (!isConfirmed) return;
    deleteStory(internalStory);
    onClose();
  };

  const textWordsCount = internalStory.textEn ? internalStory.textEn.split(/\s+/).length : 0;

  const onCloseHandler = () => {
    if (isNeedToSave) {
      const isConfirmed = window.confirm('You have unsaved changes. Do you want to discard them?');
      if (!isConfirmed) return;
    }
    onClose();
  };

  return (
    <CustomModal isOpen={true} onClose={onCloseHandler}>
      <Stack
        sx={{
          width: '100%',
          gap: '20px',
        }}
      >
        <Stack
          sx={{
            gap: '20px',
            display: 'grid',
            gridTemplateColumns: '600px 1fr',
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
            <Button
              sx={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
              }}
              variant="outlined"
              onClick={() => downloadAsJpg(internalStory.imageUrl)}
            >
              Download as JPG
            </Button>
          </Stack>

          <Stack
            sx={{
              gap: '30px',
              width: '100%',
            }}
          >
            <TextField
              label="Story System Instruction"
              value={internalStory.storySystemInstruction || defaultStorySystemInstruction}
              onChange={(e) =>
                setInternalStory({ ...internalStory, storySystemInstruction: e.target.value })
              }
              fullWidth
              multiline
              rows={5}
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
                onClick={() => generateTitleAndDescription()}
                disabled={isGenerating}
              >
                Title & Subtitle
              </Button>

              <Button
                variant="outlined"
                onClick={() => generateStoryText()}
                disabled={isGenerating}
              >
                Story Text
              </Button>

              <Button
                variant="outlined"
                onClick={() => generateAudioDescription()}
                disabled={isGenerating}
              >
                Audio Description
              </Button>
              <Button
                variant="outlined"
                onClick={() => generateVideoDescription()}
                disabled={isGenerating}
              >
                Video Description
              </Button>
              <Button variant="outlined" onClick={() => cleanUpText()} disabled={isGenerating}>
                Clean Up Text
              </Button>

              <Button variant="outlined" onClick={() => generateAll()} disabled={isGenerating}>
                ALL
              </Button>
            </Stack>

            <Stack
              sx={{
                flexDirection: 'row',
                gap: 2,
                width: '100%',
              }}
            >
              <TextField
                label="Audio Description"
                value={internalStory.sunoPrompt || ''}
                onChange={(e) => setInternalStory({ ...internalStory, sunoPrompt: e.target.value })}
                multiline
                fullWidth
                rows={7}
              />
              <TextField
                label="Video Description"
                value={internalStory.videoDescription || ''}
                onChange={(e) =>
                  setInternalStory({ ...internalStory, videoDescription: e.target.value })
                }
                fullWidth
                multiline
                rows={7}
              />
            </Stack>

            <Stack
              sx={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: '10px',
              }}
            >
              <UploadAudioFileButton
                type="icon"
                onNewUploadUrl={(url) => setInternalStory((prev) => ({ ...prev, audioUrl: url }))}
              />
              {internalStory.audioUrl ? (
                <audio
                  controls
                  src={internalStory.audioUrl}
                  style={{ width: '400px' }}
                  preload="none"
                />
              ) : null}
            </Stack>

            <Stack
              sx={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: '10px',
              }}
            >
              <UploadVideoButton
                type="icon"
                onNewUploadUrl={(url) => setInternalStory((prev) => ({ ...prev, videoUrl: url }))}
              />
              {internalStory.videoUrl ? (
                <video
                  controls
                  src={internalStory.videoUrl}
                  style={{ width: '400px', height: '400px' }}
                  preload="none"
                />
              ) : null}
            </Stack>
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
          rows={40}
        />

        <Stack
          sx={{
            flexDirection: 'row',
            position: 'sticky',
            bottom: '-10px',
            marginTop: '120px',
            gap: 2,
            backgroundColor: '#000',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            padding: '20px 20px 30px 20px',
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
              startIcon={isGenerating ? <Loader /> : null}
              sx={{
                height: '56px',
                width: '240px',
              }}
            >
              Save And Next
            </Button>

            <Button
              variant={isNeedToSave ? 'contained' : 'outlined'}
              onClick={onSave}
              startIcon={isGenerating ? <Loader /> : null}
              sx={{
                height: '56px',
                width: '240px',
              }}
            >
              Save
            </Button>

            <FormControlLabel
              checked={internalStory.isPublished || false}
              onChange={(e) =>
                setInternalStory({ ...internalStory, isPublished: !internalStory.isPublished })
              }
              control={<Checkbox size="large" />}
              label={<Stack>Published</Stack>}
            />
          </Stack>

          <Button color="error" onClick={onDelete}>
            Delete
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
