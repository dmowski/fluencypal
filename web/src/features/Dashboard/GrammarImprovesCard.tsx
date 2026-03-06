import { useLingui } from '@lingui/react';

import { IconButton, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { useAiUserInfo } from '../Ai/useAiUserInfo';
import { AdvancedUserRecord } from '@/common/userInfo';
import { useAuth } from '../Auth/useAuth';
import { useEffect, useRef, useState } from 'react';
import { LoadingShapes } from '../uiKit/Loading/LoadingShapes';
import { sleep } from '@/libs/sleep';
import { ChevronDown, ChevronRight, RefreshCcw } from 'lucide-react';

export const GrammarImprovesCard = () => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const userInfo = useAiUserInfo();
  const grammarPoints = userInfo.grammarRecords;

  const [isShowList, setIsShowList] = useState(false);

  const regenerate = async () => {
    setIsShowList(false);
    await sleep(50);
    setIsShowList(true);
  };

  if (!auth.isFounder) {
    return <></>;
  }
  return (
    <Stack
      sx={{
        marginBottom: '20px',
        alignItems: 'flex-start',
        gap: '30px',

        width: '100%',
        borderRadius: '16px',
        position: 'relative',
        //padding: '40px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        '@media (max-width:600px)': {
          borderRadius: '0px',
          padding: '40px 0px 0px 0px',
          backgroundColor: 'rgba(255, 255, 255, 0)',
          border: 'none',
        },
      }}
    >
      <IconButton
        onClick={regenerate}
        sx={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          opacity: 0.7,
        }}
      >
        <RefreshCcw size={'19px'} />
      </IconButton>
      <Stack
        sx={{
          gap: '30px',
          padding: '30px 30px 30px 30px',
          '@media (max-width:600px)': {
            padding: '0px 20px 0 20px',
          },
        }}
      >
        <Stack
          sx={{
            gap: '10px',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: '800',
              textWrap: 'balance',
              '@media (max-width:600px)': {
                fontSize: '2rem',
                lineHeight: '2.2rem',
              },
            }}
          >
            {i18n._('Improvement practice for you')}
          </Typography>

          <Typography
            sx={{
              opacity: 0.9,
            }}
          >
            {i18n._(
              'Based on your recent conversations, here are some tips to improve your grammar. Click on the tip to see more details!',
            )}
          </Typography>
        </Stack>

        {isShowList && (
          <Stack
            sx={{
              gap: '10px',
            }}
          >
            {grammarPoints.length === 0 ? (
              <Typography sx={{ opacity: 0.8 }}>
                {i18n._('No grammar insights yet. Start chatting to get personalized tips!')}
              </Typography>
            ) : (
              grammarPoints.map((record, index) => (
                <GrammarImprovementCard key={index} record={record} />
              ))
            )}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

interface GrammarImprovement {
  title: string;
  description: string;
  examples: string[];
}

export const GrammarImprovementCard = ({ record }: { record: AdvancedUserRecord }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [improvement, setImprovement] = useState<GrammarImprovement | null>(null);

  const generateImprovement = async (): Promise<GrammarImprovement> => {
    await sleep(1000); // Simulate loading time

    return {
      title: `Article the`,
      description: `Description for ${record.value}`,
      examples: [`Example 1 for ${record.value}`, `Example 2 for ${record.value}`],
    };
  };

  const rowHeight = '40px';

  const loadingMap = useRef<Record<string, Promise<GrammarImprovement> | null>>({});

  const fetchImprovement = async () => {
    setIsLoading(true);
    const key = record.value;

    const resultRequest = loadingMap.current[key] || generateImprovement();
    loadingMap.current[key] = resultRequest;
    const result = await resultRequest;
    setImprovement(result);
    setIsLoading(false);
    return;
  };

  useEffect(() => {
    fetchImprovement();
  }, [record]);

  if (isLoading || !improvement) {
    return <LoadingShapes sizes={[rowHeight]} />;
  }

  return (
    <Stack
      sx={{
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '0px 10px',
        alignItems: 'center',
        minHeight: rowHeight,
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        color: '#fff',
        cursor: 'pointer',
        textAlign: 'left',
        flexDirection: 'row',
      }}
      component={'button'}
    >
      <Typography>{improvement.title}</Typography>
      <ChevronRight size={'20px'} />
    </Stack>
  );
};
