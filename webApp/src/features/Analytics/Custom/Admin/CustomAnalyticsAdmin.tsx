'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useAuth } from '@/features/Auth/useAuth';
import { DEV_EMAILS } from '@/features/DevTools/dev';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { House } from 'lucide-react';
import { loadJourneyRequest } from '@/app/api/analytics/journey/journeyRequest';
import {
  AnalyticsEventDoc,
  AnalyticsVisitorDoc,
  JourneySummary,
} from '@/features/Analytics/Custom/types';
import { dropOffStepLabel } from '@/features/Analytics/Custom/classifyFunnel';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { useSettings } from '@/features/Settings/useSettings';
import { StatCard } from '@/features/Analytics/AdminStats/StatCard';

const formatTime = (iso: string): string => {
  if (!iso) return '—';
  return dayjs(iso).format('HH:mm:ss');
};

const formatScreen = (visitor: AnalyticsVisitorDoc): string => {
  if (!visitor.screenWidth || !visitor.screenHeight) return '—';
  return `${visitor.screenWidth}×${visitor.screenHeight}`;
};

export function CustomAnalyticsAdmin() {
  const auth = useAuth();
  const isAdmin = DEV_EMAILS.includes(auth?.userInfo?.email || '');
  const settings = useSettings();
  const pageLanguage = settings.pageLanguageCode || 'en';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<JourneySummary | null>(null);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [selectedVisitor, setSelectedVisitor] = useState<AnalyticsVisitorDoc | null>(null);
  const [events, setEvents] = useState<AnalyticsEventDoc[]>([]);

  const loadSummary = async () => {
    setIsLoading(true);
    setError('');
    try {
      const now = dayjs();
      const result = await loadJourneyRequest(
        {
          type: 'summary',
          dayKey: now.format('YYYY-MM-DD'),
          fromIso: now.startOf('day').toISOString(),
          toIso: now.endOf('day').toISOString(),
        },
        await auth.getToken(),
      );
      if (result.type === 'summary') {
        setSummary(result.summary);
      }
    } catch (loadError) {
      console.error(loadError);
      setError('Failed to load journey analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVisitor = async (visitorId: string) => {
    setSelectedVisitorId(visitorId);
    setIsLoading(true);
    setError('');
    try {
      const result = await loadJourneyRequest(
        { type: 'visitor', visitorId },
        await auth.getToken(),
      );
      if (result.type === 'visitor') {
        setSelectedVisitor(result.visitor);
        setEvents(result.events);
      }
    } catch (loadError) {
      console.error(loadError);
      setError('Failed to load visitor journey');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin || summary || isLoading) return;
    void loadSummary();
  }, [isAdmin]);

  if (!isAdmin) return <></>;

  return (
    <Stack sx={{ padding: '12px 16px 40px', gap: '20px' }}>
      <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <Button
          href={`${getUrlStart(pageLanguage)}practice`}
          sx={{ width: 'max-content', padding: '10px 32px', borderRadius: '210px' }}
          variant="contained"
          startIcon={<House />}
        >
          Home
        </Button>
        <Button
          href="/staats"
          sx={{ width: 'max-content', padding: '10px 32px', borderRadius: '210px' }}
          variant="outlined"
        >
          Admin stats
        </Button>
        <Button
          onClick={() => void loadSummary()}
          sx={{ width: 'max-content', padding: '10px 32px', borderRadius: '210px' }}
          variant="outlined"
        >
          Refresh today
        </Button>
      </Stack>

      <Typography variant="h5">User journey — today</Typography>
      {isLoading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {summary && (
        <>
          <Stack
            sx={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '12px',
              '.stat-card': {
                width: '160px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                alignItems: 'center',
                gap: '0px',
                padding: '17px 12px 8px 12px',
                borderRadius: '8px',
                height: '120px',
              },
            }}
          >
            <StatCard value={summary.visitorCount} label="Users today" />
            <StatCard value={summary.eventCount} label="Events today" />
            <StatCard value={summary.funnel.landing} label="Reached landing" />
            <StatCard value={summary.funnel.app} label="Opened app" />
            <StatCard value={summary.funnel.auth} label="Signed in" />
            <StatCard value={summary.funnel.quiz} label="Opened quiz" />
            <StatCard value={summary.funnel.practice} label="First conversation" />
          </Stack>

          <Stack sx={{ gap: '8px' }}>
            <Typography variant="h6">Where they stop</Typography>
            {summary.dropOff.slice(0, 12).map((row) => (
              <Typography key={row.path} variant="body2">
                {row.count} — {row.path}
              </Typography>
            ))}
            {summary.dropOff.length === 0 && (
              <Typography variant="body2">No visitors yet today.</Typography>
            )}
          </Stack>

          <Stack sx={{ gap: '8px' }}>
            <Typography variant="h6">OS</Typography>
            {summary.os.map((row) => (
              <Typography key={row.os} variant="body2">
                {row.count} — {row.os}
              </Typography>
            ))}
          </Stack>

          <Stack sx={{ gap: '10px' }}>
            <Typography variant="h6">Visitors</Typography>
            {summary.visitors.map((visitor) => (
              <Button
                key={visitor.visitorId}
                onClick={() => void loadVisitor(visitor.visitorId)}
                variant={selectedVisitorId === visitor.visitorId ? 'contained' : 'outlined'}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  padding: '12px 16px',
                  borderRadius: '12px',
                }}
              >
                <Stack sx={{ alignItems: 'flex-start', gap: '2px', width: '100%' }}>
                  <Typography variant="body2">
                    {formatTime(visitor.lastSeenAtIso)} · {dropOffStepLabel(visitor)} ·{' '}
                    {visitor.lastPath}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {visitor.os} · {visitor.browser} · {formatScreen(visitor)} ·{' '}
                    {visitor.eventCount} events
                    {visitor.authUserId ? ` · uid ${visitor.authUserId.slice(0, 8)}` : ''}
                  </Typography>
                </Stack>
              </Button>
            ))}
          </Stack>
        </>
      )}

      {selectedVisitor && (
        <Stack sx={{ gap: '10px', paddingTop: '8px' }}>
          <Typography variant="h6">Full route</Typography>
          <Typography variant="body2">
            Visitor {selectedVisitor.visitorId} · UA {selectedVisitor.userAgent}
          </Typography>
          <Typography variant="body2">
            Screen {formatScreen(selectedVisitor)} · Language {selectedVisitor.language || '—'} ·
            Auth {selectedVisitor.authUserId || 'anonymous'}
          </Typography>
          {events.map((event) => (
            <Stack
              key={`${event.visitorId}-${event.createdAtMs}-${event.name}-${event.path}`}
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '10px 12px',
                gap: '2px',
              }}
            >
              <Typography variant="body2">
                {formatTime(event.createdAtIso)} · {event.name} · {event.sourceApp} · {event.path}
              </Typography>
              {event.name === 'click' && (
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  {event.tagName} {event.buttonText || event.buttonId || event.buttonHref}
                </Typography>
              )}
            </Stack>
          ))}
          {events.length === 0 && (
            <Typography variant="body2">No events stored for this visitor.</Typography>
          )}
        </Stack>
      )}
    </Stack>
  );
}
