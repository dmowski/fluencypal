import { Story } from '@/features/Sentence/types';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTextAi } from '@/features/Ai/useTextAi';
import { UploadAudioFileButton } from '@/features/Audio/UploadAudioFileButton';
import { UploadVideoButton } from '@/features/Video/UploadVideoButton';
import { downloadAsJpg } from './downloadAsJpg';
import { ChevronRight, Loader } from 'lucide-react';
import { UploadImageButton } from '@/features/Game/UploadImageButton';

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
  };

  const onSaveAndNext = async () => {
    if (isNeedToSave) {
      await update(internalStory);
    }
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
            gridTemplateColumns: '300px 1fr',
          }}
        >
          <Stack gap="10px">
            <Stack
              sx={{
                width: '300px',
                height: '300px',
                position: 'relative',
              }}
            >
              <Image
                src={internalStory.imageUrl}
                alt="Story Image"
                fill
                sizes="300px"
                style={{
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              />
              <Stack
                sx={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                }}
              >
                <UploadImageButton
                  type="icon"
                  onNewUploadUrl={(url) => {
                    setInternalStory((prev) => ({ ...prev, imageUrl: url }));
                  }}
                />
              </Stack>

              <Button
                sx={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                }}
                variant="contained"
                onClick={() => downloadAsJpg(internalStory.imageUrl)}
              >
                Download as JPG
              </Button>
            </Stack>

            <Stack
              sx={{
                alignItems: 'flex-start',
                gap: '10px',
                width: '100%',
              }}
            >
              <UploadVideoButton
                type="icon"
                onNewUploadUrl={(url) =>
                  setInternalStory((prev) => ({ ...prev, originalVideoUrl: url }))
                }
                minify={false}
              />
              {internalStory.videoUrl ? (
                <Stack>
                  <Typography variant="caption">Final Video:</Typography>
                  <video
                    controls
                    loop
                    muted
                    autoPlay
                    src={internalStory.videoUrl}
                    style={{ width: '200px', height: '200px' }}
                    preload="none"
                  />
                </Stack>
              ) : null}

              {internalStory.originalVideoUrl ? (
                <Stack>
                  <Typography variant="caption">Original Video:</Typography>
                  <video
                    controls
                    loop
                    autoPlay
                    muted
                    src={internalStory.originalVideoUrl}
                    style={{ width: '200px', height: '200px' }}
                    preload="none"
                  />
                </Stack>
              ) : null}
            </Stack>
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
                setInternalStory((prev) => ({ ...prev, storySystemInstruction: e.target.value }))
              }
              fullWidth
              multiline
            />

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
                onChange={(e) =>
                  setInternalStory((prev) => ({ ...prev, sunoPrompt: e.target.value }))
                }
                multiline
                fullWidth
              />
              <TextField
                label="Video Description"
                value={internalStory.videoDescription || ''}
                onChange={(e) =>
                  setInternalStory((prev) => ({ ...prev, videoDescription: e.target.value }))
                }
                fullWidth
                multiline
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
          </Stack>
        </Stack>

        <Stack
          sx={{
            flexDirection: 'row',
            gap: '10px',
          }}
        >
          <TextField
            label="Title"
            value={internalStory.title || ''}
            onChange={(e) => setInternalStory((prev) => ({ ...prev, title: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Subtitle"
            value={internalStory.subtitle || ''}
            onChange={(e) => setInternalStory((prev) => ({ ...prev, subtitle: e.target.value }))}
            fullWidth
          />
        </Stack>
        <TextField
          label={`Text (EN) - ${textWordsCount} words`}
          value={internalStory.textEn || ''}
          onChange={(e) => setInternalStory((prev) => ({ ...prev, textEn: e.target.value }))}
          fullWidth
          multiline
        />
        <Stack
          sx={{
            paddingTop: '200px',
          }}
        />

        <Stack
          sx={{
            position: 'fixed',
            bottom: '-10px',
            marginTop: '120px',
            gap: 2,
            width: 'calc(100%)',
            left: 0,
            zIndex: 999,
            backgroundColor: '#000',
            borderTop: '1px solid rgba(255, 255, 255, 0.4)',
            padding: '20px 20px 30px 90px',
            justifyContent: 'space-between',
          }}
        >
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Image
              src={internalStory.imageUrl}
              alt="Story Image"
              width={40}
              height={40}
              style={{
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            />
            <Button
              variant="outlined"
              onClick={() => generateTitleAndDescription()}
              disabled={isGenerating}
            >
              Title & Subtitle
            </Button>

            <Button variant="outlined" onClick={() => generateStoryText()} disabled={isGenerating}>
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
            <Button
              variant="outlined"
              onClick={() => cleanUpText()}
              disabled={isGenerating}
              color="secondary"
            >
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
              backgroundColor: '#000',
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
              <FormControlLabel
                checked={internalStory.isPublished || false}
                onChange={(e) =>
                  setInternalStory((prev) => ({ ...prev, isPublished: !prev.isPublished }))
                }
                control={<Checkbox size="large" />}
                label={<Stack>Published</Stack>}
              />

              <Button
                variant={isNeedToSave && !isGenerating ? 'contained' : 'outlined'}
                onClick={onSave}
                startIcon={isGenerating ? <Loader /> : null}
                sx={{
                  height: '56px',
                }}
              >
                Just Save
              </Button>

              <Button
                variant={isNeedToSave && !isGenerating ? 'contained' : 'outlined'}
                onClick={onSaveAndNext}
                startIcon={isGenerating ? <Loader /> : null}
                sx={{
                  height: '56px',
                  width: '240px',
                }}
                endIcon={<ChevronRight />}
              >
                Save And Next
              </Button>
            </Stack>

            <Button color="error" onClick={onDelete}>
              Delete
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
