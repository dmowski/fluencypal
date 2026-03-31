'use client';

import { useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { ProgressChart } from '@/features/ProgressStat/ProgressChart';
import {
  mockProgressChartPoints,
  mockSparseProgressChartPoints,
  mockProgressWaveChartPoints,
} from '@/features/ProgressStat/mockData';
import { useProgressEvaluation } from '@/features/ProgressStat/useProgressEvaluation';
import {
  ProgressChartPoint,
  ProgressChartStatus,
  ProgressMetric,
  ProgressSourceType,
  ProgressValueMode,
} from '@/features/ProgressStat/types';
import { SupportedLanguage, supportedLanguagesToLearn } from '@/features/Lang/lang';

type DemoMode = 'steady' | 'wave' | 'sparse' | 'empty' | 'loading' | 'processing' | 'locked';

const buildSmoothedChartPoints = (
  points: ProgressChartPoint[],
  windowSize: number,
): ProgressChartPoint[] => {
  const metrics: ProgressMetric[] = ['grammar', 'vocabulary', 'fluency', 'confidence'];

  return points.map((point, index) => {
    const startIndex = Math.max(0, index - windowSize + 1);
    const windowPoints = points.slice(startIndex, index + 1);
    const nextPoint: ProgressChartPoint = { ...point };

    metrics.forEach((metric) => {
      const total = windowPoints.reduce((sum, item) => sum + item[metric], 0);
      const average = total / windowPoints.length;

      if (metric === 'grammar') nextPoint.grammarSmoothed = average;
      if (metric === 'vocabulary') nextPoint.vocabularySmoothed = average;
      if (metric === 'fluency') nextPoint.fluencySmoothed = average;
      if (metric === 'confidence') nextPoint.confidenceSmoothed = average;
    });

    return nextPoint;
  });
};

const stateLabelMap: Record<DemoMode, string> = {
  steady: 'Steady data',
  wave: 'Volatile data',
  sparse: 'Sparse data',
  empty: 'Empty data',
  loading: 'Loading state',
  processing: 'Processing state',
  locked: 'Locked state',
};

const defaultStudentTranscript = `Teacher: Dzień dobry! Jak się dzisiaj czujesz?
Student: Dzień dobry! Ja dobrze, ale ja trochę zmęczony po praca.

Teacher: Rozumiem. O czym chcesz dzisiaj rozmawiać?
Student: Ja chcę mówić o podróż, bo ja lubię podróżować bardzo.

Teacher: Świetnie! Dokąd chcesz pojechać?
Student: Ja chcę jechać do Hiszpania albo do Włochy, ale ja nie wiem który lepszy.

Teacher: Co jest dla ciebie ważne w podróży?
Student: Ja lubię dobre jedzenie i stare budynki, i też morze.

Teacher: Czy byłeś tam wcześniej?
Student: Tak, ja byłem w Włochy kilka lata temu, było bardzo fajnie.

Teacher: Co najbardziej pamiętasz?
Student: Ja pamiętam pizza i dużo ludzi i jeden duży budynek, ja zapomniałem nazwa.

Teacher: Jak planujesz podróż?
Student: Najpierw ja szukam tanie loty, potem ja rezerwować hotel albo apartament.

Teacher: Wolisz hotel czy apartament?
Student: Ja lubię apartament, bo jest bardziej wygodny i ja mogę gotować jedzenie.

Teacher: Podróżujesz sam czy z kimś?
Student: Z dziewczyna albo z przyjaciele, ja nie lubię sam podróżować.

Teacher: Jak długo chcesz zostać?
Student: Ja chcę być tam jeden tydzień albo może dziesięć dni, zależy od pracy.

Teacher: Uczysz się języka przed wyjazdem?
Student: Trochę uczę się, ale ja nie mam dużo czasu i czasami zapominam słowa.

Teacher: To pomaga w komunikacji.
Student: Tak, ja wiem, ale czasami jest trudny dla mnie.

Teacher: Co robisz, kiedy nie rozumiesz rozmówcy?
Student: Ja mówię "proszę mówić wolno" albo ja używam telefon do tłumaczyć.

Teacher: Czy często używasz tłumacza?
Student: Tak, ja używam bardzo często, bo ja nie rozumiem wszystko.

Teacher: Co jest dla ciebie najtrudniejsze w języku polskim?
Student: Dla mnie jest trudny gramatyka i mówić szybko bez błędy.

Teacher: To normalne. Trzeba dużo ćwiczyć.
Student: Tak, ja próbuję ćwiczyć każdy dzień, ale czasami ja nie mam motywacja.

Teacher: Oglądasz filmy po polsku?
Student: Tak, ja oglądam filmy z napisy, bo bez napisy ja nie rozumiem dużo.

Teacher: To bardzo dobry sposób na naukę.
Student: Tak, ja uczę się nowe słowa, ale potem ja zapominam ich szybko.

Teacher: Rozmawiasz z kimś po polsku na co dzień?
Student: Czasami w pracy ja rozmawiam z kolega, ale ja robię dużo błędów.

Teacher: To nic, błędy są częścią nauki.
Student: Tak, ja wiem, ale czasami ja się stresuje i nie chcę mówić.

Teacher: Jakie masz cele językowe?
Student: Ja chcę mówić płynnie i bez stres i rozumieć ludzi dobrze.

Teacher: To bardzo dobry cel.
Student: Dziękuję! Ja będę próbować więcej ćwiczyć i mówić.`;

export const ProgressStatTest = () => {
  const [mode, setMode] = useState<DemoMode>('steady');
  const [metric, setMetric] = useState<ProgressMetric>('grammar');
  const [valueMode, setValueMode] = useState<ProgressValueMode>('raw');
  const [evalLanguage, setEvalLanguage] = useState<SupportedLanguage>('pl');
  const [evalSourceType, setEvalSourceType] = useState<ProgressSourceType>('conversation');
  const [evalSourceId, setEvalSourceId] = useState(`manual-${Date.now()}`);
  const [transcriptInput, setTranscriptInput] = useState(defaultStudentTranscript);
  const [evalRawOutput, setEvalRawOutput] = useState<string>('');
  const [evalParsedOutput, setEvalParsedOutput] = useState<string>('');
  const [evalError, setEvalError] = useState<string>('');

  const progressEvaluation = useProgressEvaluation();
  const chartHeight = 400;

  const baseData = useMemo(() => {
    if (mode === 'wave') return mockProgressWaveChartPoints;
    if (mode === 'sparse') return mockSparseProgressChartPoints;
    if (mode === 'empty') return [];
    if (mode === 'processing' || mode === 'locked' || mode === 'loading') {
      return mockProgressChartPoints;
    }
    return mockProgressChartPoints;
  }, [mode]);

  const data = useMemo(() => buildSmoothedChartPoints(baseData, 5), [baseData]);

  const chartStatus: ProgressChartStatus =
    mode === 'loading' || mode === 'processing' || mode === 'locked' || mode === 'empty'
      ? mode
      : 'ready';

  const renderChartBody = () => {
    return (
      <ProgressChart
        data={data}
        metric={metric}
        valueMode={valueMode}
        height={chartHeight}
        status={chartStatus}
        emptyPreviewData={buildSmoothedChartPoints(mockProgressChartPoints, 5)}
      />
    );
  };

  const runEvaluation = async () => {
    setEvalError('');
    setEvalRawOutput('');
    setEvalParsedOutput('');

    try {
      const result = await progressEvaluation.evaluateProgress({
        transcriptText: transcriptInput,
        language: evalLanguage,
        sourceType: evalSourceType,
        sourceId: evalSourceId.trim() || `manual-${Date.now()}`,
      });

      setEvalRawOutput(result.rawOutput);
      setEvalParsedOutput(JSON.stringify(result.parsed, null, 2));
    } catch (error) {
      setEvalError(error instanceof Error ? error.message : 'Unknown evaluation error');
    }
  };

  return (
    <Stack
      sx={{
        width: '100%',
        maxWidth: '920px',
        margin: '0 auto',
        padding: '20px',
        gap: '16px',
      }}
    >
      <Typography variant="h6" sx={{ color: '#f0f4ff' }}>
        ProgressStat chart test
      </Typography>

      <Stack direction="row" sx={{ gap: '8px', flexWrap: 'wrap' }}>
        {(Object.keys(stateLabelMap) as DemoMode[]).map((demoMode) => (
          <Button
            key={demoMode}
            variant={mode === demoMode ? 'contained' : 'outlined'}
            onClick={() => setMode(demoMode)}
          >
            {stateLabelMap[demoMode]}
          </Button>
        ))}
      </Stack>

      <Stack direction="row" sx={{ gap: '8px', flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant={metric === 'grammar' ? 'contained' : 'outlined'}
          onClick={() => setMetric('grammar')}
        >
          Grammar
        </Button>
        <Button
          size="small"
          variant={metric === 'vocabulary' ? 'contained' : 'outlined'}
          onClick={() => setMetric('vocabulary')}
        >
          Vocabulary
        </Button>
        <Button
          size="small"
          variant={metric === 'fluency' ? 'contained' : 'outlined'}
          onClick={() => setMetric('fluency')}
        >
          Fluency
        </Button>
        <Button
          size="small"
          variant={metric === 'confidence' ? 'contained' : 'outlined'}
          onClick={() => setMetric('confidence')}
        >
          Confidence
        </Button>
      </Stack>

      <Stack direction="row" sx={{ gap: '8px', flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant={valueMode === 'raw' ? 'contained' : 'outlined'}
          onClick={() => setValueMode('raw')}
        >
          Raw values
        </Button>
        <Button
          size="small"
          variant={valueMode === 'smoothed' ? 'contained' : 'outlined'}
          onClick={() => setValueMode('smoothed')}
        >
          Smoothed values
        </Button>
      </Stack>

      <Stack
        sx={{
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'linear-gradient(180deg, rgba(10,18,30,0.88) 0%, rgba(7,13,24,0.94) 100%)',
          padding: '50px 45px 35px 20px',
          gap: '10px',
        }}
      >
        {renderChartBody()}
      </Stack>

      <Stack
        sx={{
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'linear-gradient(180deg, rgba(12,20,34,0.9) 0%, rgba(8,14,26,0.95) 100%)',
          padding: '20px',
          gap: '12px',
        }}
      >
        <Typography variant="h6" sx={{ color: '#f0f4ff' }}>
          AI evaluator playground
        </Typography>

        <Stack direction="row" sx={{ gap: '10px', flexWrap: 'wrap' }}>
          <TextField
            select
            size="small"
            label="Language"
            value={evalLanguage}
            onChange={(event) => setEvalLanguage(event.target.value as SupportedLanguage)}
            sx={{ minWidth: '180px' }}
          >
            {supportedLanguagesToLearn.map((languageCode) => (
              <MenuItem key={languageCode} value={languageCode}>
                {languageCode}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Source type"
            value={evalSourceType}
            onChange={(event) => setEvalSourceType(event.target.value as ProgressSourceType)}
            sx={{ minWidth: '180px' }}
          >
            <MenuItem value="conversation">conversation</MenuItem>
            <MenuItem value="role-play">role-play</MenuItem>
          </TextField>

          <TextField
            size="small"
            label="Source id"
            value={evalSourceId}
            onChange={(event) => setEvalSourceId(event.target.value)}
            sx={{ minWidth: '220px' }}
          />
        </Stack>

        <TextField
          label="Transcript"
          value={transcriptInput}
          onChange={(event) => setTranscriptInput(event.target.value)}
          multiline
          minRows={6}
          fullWidth
        />

        <Stack direction="row" sx={{ gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={runEvaluation}
            disabled={progressEvaluation.isEvaluating || transcriptInput.trim().length === 0}
          >
            {progressEvaluation.isEvaluating ? 'Evaluating...' : 'Run evaluation'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setEvalRawOutput('');
              setEvalParsedOutput('');
              setEvalError('');
            }}
          >
            Clear output
          </Button>
        </Stack>

        {evalError && (
          <Typography variant="body2" sx={{ color: '#ff9a9a' }}>
            {evalError}
          </Typography>
        )}

        <TextField
          label="Raw model output"
          value={evalRawOutput}
          multiline
          minRows={5}
          fullWidth
          InputProps={{ readOnly: true }}
        />

        <TextField
          label="Parsed result"
          value={evalParsedOutput}
          multiline
          minRows={5}
          fullWidth
          InputProps={{ readOnly: true }}
        />
      </Stack>
    </Stack>
  );
};
