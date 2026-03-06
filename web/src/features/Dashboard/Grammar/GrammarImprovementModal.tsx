import { useLingui } from '@lingui/react';
import { Button, IconButton, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { ChevronLeft, ChevronRight, Languages } from 'lucide-react';
import { AudioPlayIcon } from '../../Audio/AudioPlayIcon';
import { useTranslate } from '../../Translation/useTranslate';
import { LoadingShapes } from '../../uiKit/Loading/LoadingShapes';
import { Markdown } from '../../uiKit/Markdown/Markdown';
import { CustomModal } from '../../uiKit/Modal/CustomModal';
import { GrammarImprovement } from './types';

export const GrammarImprovementModal = ({
  improvement,
  isLoading,
  isFirstOne,
  isLastOne,
  isOpen,
  onClose,
  onClickNext,
  onClickPrevious,
}: {
  improvement: GrammarImprovement | null;
  isLoading: boolean;
  isFirstOne: boolean;
  isLastOne: boolean;
  isOpen: boolean;
  onClose: () => void;
  onClickNext: () => void;
  onClickPrevious: () => void;
}) => {
  const translator = useTranslate();
  const { i18n } = useLingui();

  const rowHeight = '40px';

  if (isLoading || !improvement) return <LoadingShapes sizes={[rowHeight]} />;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <Stack sx={{ gap: '60px', padding: '20px', maxWidth: '700px', paddingBottom: '80px' }}>
        {translator.translateModal}
        <Stack
          sx={{
            gap: '10px',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: '800',
            }}
          >
            {improvement.title}
          </Typography>
          <Stack>
            <Markdown
              variant="conversation"
              onWordClick={
                translator.isTranslateAvailable
                  ? (word, element) => {
                      translator.translateWithModal(word, element);
                    }
                  : undefined
              }
            >
              {'\n' + improvement.description}
            </Markdown>
          </Stack>
        </Stack>

        {improvement.examples.length > 0 && (
          <Stack sx={{ gap: '10px' }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: '700',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Examples:
            </Typography>
            <Stack
              sx={{
                gap: '30px',
                '* strong': {
                  backgroundColor: 'rgba(11, 130, 194, 0.79)',
                  padding: '2px 2px 2px 8px',
                  marginRight: '5px',
                  borderRadius: '5px',
                  fontWeight: '700',
                  // prevent word break in the middle of the highlighted part
                  whiteSpace: 'nowrap',
                },
              }}
            >
              {improvement.examples.map((example, index) => (
                <Stack
                  key={index}
                  sx={{
                    gap: '5px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    //padding: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <Stack
                    sx={{
                      padding: '10px',
                    }}
                  >
                    <Markdown
                      onWordClick={
                        translator.isTranslateAvailable
                          ? (word, element) => {
                              translator.translateWithModal(word, element);
                            }
                          : undefined
                      }
                      variant="conversation"
                    >
                      {'\n' + example}
                    </Markdown>
                  </Stack>

                  <Stack
                    sx={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      padding: '5px',
                      gap: '10px',
                    }}
                  >
                    <AudioPlayIcon text={example} />

                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        translator.translateWithModal(example, e.currentTarget);
                      }}
                    >
                      <Languages size={'16px'} color={'rgba(255, 255, 255, 0.7)'} />
                    </IconButton>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
        )}

        <Stack
          sx={{
            alignItems: 'flex-start',
            flexDirection: 'row',
            gap: '20px',
          }}
        >
          <Button
            color="info"
            variant="outlined"
            size="large"
            sx={{
              padding: '10px 30px',
            }}
            disabled={isFirstOne}
            onClick={onClickPrevious}
            startIcon={<ChevronLeft size={'18px'} />}
          >
            {i18n._('Previous')}
          </Button>

          <Button
            variant="contained"
            color="info"
            size="large"
            sx={{
              padding: '10px 30px',
            }}
            disabled={isLastOne}
            onClick={onClickNext}
            endIcon={<ChevronRight size={'18px'} />}
          >
            {i18n._('Next')}
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
