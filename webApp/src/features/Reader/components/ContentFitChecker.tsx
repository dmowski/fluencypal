import { Typography } from '@mui/material';
import { ReaderSettings } from '../model/types';
import { RefObject, useEffect, useState } from 'react';
import { useIsLocalhost } from '../hooks/useIsLocalhost';

export const ContentFitChecker = ({
  contentRef,
  readerSettings,
  activePage,
}: {
  contentRef: RefObject<HTMLDivElement | null> | null;
  readerSettings: ReaderSettings;
  activePage: number;
}) => {
  const isLocalhost = useIsLocalhost();
  const [isContentFit, setIsContentFit] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      if (contentRef?.current?.scrollHeight != null) {
        setIsContentFit(contentRef.current?.scrollHeight <= readerSettings.contentHeight);
        setIsLoading(false);
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [contentRef, readerSettings.contentHeight, activePage]);

  if (!isLocalhost) return null;
  return (
    <Typography
      variant="body2"
      color={isContentFit ? 'green' : 'red'}
      data-testid="content-fit-checker"
      data-loading={isLoading}
      data-is-content-fit={isContentFit}
      sx={{
        width: '100%',
        position: 'fixed',
        textAlign: 'left',
        bottom: 0,
        left: '20px',
      }}
    >
      Is Content fit the page:{' '}
      <span data-testid="content-fit">{isContentFit ? 'true' : 'false'}</span>,
      contentRef.current.scrollHeight: {contentRef?.current?.scrollHeight},
      readerSettings.contentHeight: {readerSettings.contentHeight}
    </Typography>
  );
};
