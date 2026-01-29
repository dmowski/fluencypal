import { AiVoice } from '@/common/ai';
import { ConversationMessage, MessagesOrderMap } from '@/common/conversation';
import { useWindowSizes } from '../../Layout/useWindowSizes';
import { useLingui } from '@lingui/react';
import { useWebCam } from '../../webCam/useWebCam';
import { useAuth } from '../../Auth/useAuth';
import { Stack } from '@mui/material';
import { Messages } from '../Messages';
import { WebCamFooter } from './WebCamFooter';
import { UserPreviewStatic } from './UserPreviewStatic';
import { AiAvatar } from './types';
import { AiAvatarVideo } from './AiAvatarVideo';
import { CallButtons } from './CallButtons';
import { WebCamView } from '@/features/webCam/WebCamView';
import { useEffect, useState } from 'react';
import { ScanLine } from 'lucide-react';
import { sleep } from '@/libs/sleep';
import { LessonPlanAnalysis } from '@/features/LessonPlan/type';
import { getAiVoiceByVoice } from './voiceAvatar';
import { RecordingUserMessageMode } from '../types';

export const CameraCanvas = ({
  conversation,
  stopCallMode,
  isMuted,
  setIsMuted,
  voice,
  isAiSpeaking,
  messageOrder,
  onWebCamDescription,

  isVolumeOn,
  setIsVolumeOn,
  isLimitedVoice,
  onLimitedClick,

  onSubmitTranscription,

  isCompletedLesson,
  onShowAnalyzeConversationModal,
  lessonPlanAnalysis,

  addTranscriptDelta,
  completeUserMessageDelta,
  recordingVoiceMode,
  isSendMessagesBlocked,
}: {
  conversation: ConversationMessage[];
  stopCallMode: () => void;
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  voice: AiVoice;
  isAiSpeaking: boolean;
  messageOrder: MessagesOrderMap;
  onWebCamDescription: (description: string) => void;

  isVolumeOn: boolean;
  setIsVolumeOn: (value: boolean) => void;
  isLimitedVoice: boolean;
  onLimitedClick: () => void;

  onSubmitTranscription: (userMessage: string) => void;

  isCompletedLesson: boolean;
  onShowAnalyzeConversationModal: () => void;

  lessonPlanAnalysis: LessonPlanAnalysis | null;

  addTranscriptDelta: (transcripts: string) => void;
  completeUserMessageDelta: ({ removeMessage }: { removeMessage?: boolean }) => void;

  recordingVoiceMode: RecordingUserMessageMode;
  isSendMessagesBlocked: boolean;
}) => {
  const sizes = useWindowSizes();
  const { i18n } = useLingui();
  const webCam = useWebCam();
  const [isWebCamEnabled, setIsWebCamEnabled] = useState<boolean>(true);
  const [isSubtitlesEnabled, setIsSubtitlesEnabled] = useState<boolean>(true);

  useEffect(() => {
    setIsSubtitlesEnabled(true);
  }, [isLimitedVoice]);

  const auth = useAuth();
  const userPhoto = auth.userInfo?.photoURL || '';
  const myUserName = auth.userInfo?.displayName || auth.userInfo?.email || 'You';
  const aiVideo: AiAvatar | null = getAiVoiceByVoice(voice);
  const footerHeight = `calc(80px + ${sizes.bottomOffset})`;

  const topHeight = isSubtitlesEnabled ? `50dvh` : `calc(97dvh - ${footerHeight})`;
  const topHeightMobile = isSubtitlesEnabled ? `22dvh` : `calc(95dvh - ${footerHeight})`;

  const isTimeToScreenshots =
    isWebCamEnabled &&
    webCam.isWebCamEnabled &&
    !webCam.loading &&
    !webCam.isError &&
    conversation.length > 1;

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [screenshotTimer, setScreenshotTimer] = useState<number>(0);

  const analyzeWebcam = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const imageDescription = await webCam.getImageDescription();
      if (imageDescription) {
        //console.log("WEBCAM DESCRIPTION", imageDescription);
        onWebCamDescription(imageDescription);
      }
    } catch (err) {
      console.log('Error getting webcam description:', err);
    } finally {
      setIsAnalyzing(false);
    }

    await sleep(20_000);
    setScreenshotTimer((prev) => prev + 1);
  };

  useEffect(() => {
    if (!isTimeToScreenshots) return;
    // analyzeWebcam();
  }, [isTimeToScreenshots, screenshotTimer]);

  useEffect(() => {
    if (isCompletedLesson) setIsMuted(true);
  }, [isCompletedLesson]);

  return (
    <>
      <Stack
        sx={{
          gap: '0px',
          width: '100%',
          height: '100dvh',
          overflow: 'hidden',
        }}
      >
        <Stack
          sx={{
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            padding: '10px 10px 0px 10px',
            boxShadow: '0 14px 20px 5px rgba(10, 18, 30, 1)',
            backgroundColor: 'rgba(10, 18, 30, 0.91)',
            borderRadius: '0px',
            gap: '10px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            position: 'fixed',
            top: 0,

            pointerEvents: 'none',
            zIndex: 1,
            height: topHeight,
            '@media (max-width: 800px)': {
              height: topHeightMobile,
              gridTemplateColumns: isSubtitlesEnabled ? '1fr 1fr' : '1fr',
            },
          }}
        >
          <Stack
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '20px',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}
          >
            {aiVideo ? (
              <AiAvatarVideo aiVideo={aiVideo} isSpeaking={isAiSpeaking} />
            ) : (
              <UserPreviewStatic
                bgUrl={'/blur/2.jpg'}
                isSpeaking={isAiSpeaking}
                avatarUrl={'/blog/whippet-prediction.png'}
              />
            )}

            <WebCamFooter name={i18n._('Teacher')} />
          </Stack>

          <Stack
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Stack
              sx={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 2,
                opacity: isAnalyzing ? 1 : 0,
              }}
            >
              <ScanLine size={'13px'} color="#fff" strokeWidth={'3px'} />
            </Stack>
            {isWebCamEnabled && <WebCamView />}
            {!isWebCamEnabled && (
              <UserPreviewStatic bgUrl={'/blur/5.jpg'} avatarUrl={userPhoto} isSpeaking={false} />
            )}

            <WebCamFooter name={myUserName || i18n._('You')} />
          </Stack>
        </Stack>

        <Stack
          id="messages-call-mode"
          sx={{
            width: '100%',
            alignItems: 'center',
            overflow: 'auto',
            height: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            display: isSubtitlesEnabled ? 'flex' : 'none',
            paddingTop: topHeight,
            paddingBottom: footerHeight,
            '@media (max-width: 800px)': {
              paddingTop: topHeightMobile,
            },
          }}
        >
          <Stack
            sx={{
              maxWidth: '1000px',
              height: 'max-content',
              width: '100%',
              paddingBottom: '30px',
            }}
          >
            <Messages
              conversation={conversation}
              messageOrder={messageOrder}
              isAiSpeaking={isAiSpeaking}
              voice={voice}
            />
          </Stack>
        </Stack>

        <Stack
          sx={{
            position: 'fixed',
            bottom: 0,
            height: footerHeight,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CallButtons
            messages={conversation}
            isSendMessagesBlocked={isSendMessagesBlocked}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            recordingVoiceMode={recordingVoiceMode}
            isWebCamEnabled={isWebCamEnabled}
            toggleWebCam={(isToggleOn: boolean) => {
              if (isToggleOn) {
                setIsWebCamEnabled(true);
              } else {
                setIsWebCamEnabled(false);
              }
            }}
            exit={stopCallMode}
            isVolumeOn={isVolumeOn}
            setIsVolumeOn={setIsVolumeOn}
            isLimitedVoice={isLimitedVoice}
            onLimitedClick={onLimitedClick}
            onSubmitTranscription={onSubmitTranscription}
            isSubtitlesEnabled={isSubtitlesEnabled}
            toggleSubtitles={(isToggleOn) => setIsSubtitlesEnabled(isToggleOn)}
            onShowAnalyzeConversationModal={onShowAnalyzeConversationModal}
            lessonPlanAnalysis={lessonPlanAnalysis}
            addTranscriptDelta={addTranscriptDelta}
            completeUserMessageDelta={completeUserMessageDelta}
          />
        </Stack>
      </Stack>
    </>
  );
};
