# Realtime Qwen Voice Prototype

Build a small standalone web application to test cheap realtime AI voice conversations.

The goal is to evaluate **conversation quality, latency, stability, and real cost per minute** using Alibaba Qwen instead of OpenAI realtime models.

## Core Architecture

```text
Microphone
    ↓
Browser WebRTC
    ↓
qwen-audio-3.0-realtime-flash
    ↓
WebRTC
    ↓
Browser audio output
```

Use direct WebRTC communication between the browser and Alibaba Model Studio for realtime audio.

A small backend/Cloudflare Worker should only handle authentication and WebRTC signaling so the Alibaba API key is never exposed to the browser.

The backend must **not proxy the audio stream**.

## Tech Stack

Frontend:

```text
React
TypeScript
Vite
WebRTC API
Web Audio API
Tailwind CSS
```

Backend:

```text
Cloudflare Worker
```

AI:

```text
Alibaba Model Studio
qwen-audio-3.0-realtime-flash
```

Optional persistence:

```text
Supabase
```

## Main Flow

```text
User opens app
    ↓
Clicks "Start Call"
    ↓
Browser requests microphone permission
    ↓
Creates RTCPeerConnection
    ↓
Creates SDP offer
    ↓
Cloudflare Worker sends offer to Alibaba
    ↓
Alibaba returns SDP answer
    ↓
WebRTC connection established
    ↓
User speaks
    ↓
Qwen responds with realtime audio
    ↓
User hears response
```

The conversation must support natural turn detection and interruption: if the user starts speaking while Qwen is talking, AI playback should stop quickly.

## UI

Keep the interface minimal:

```text
Realtime Qwen Test

● Connected

       03:42

[ Mute ]   [ End Call ]

Current cost: $0.04
```

No avatar, character system, memory, lessons, login, or payments are required.

## Metrics Dashboard

The application must measure and display:

```text
Call duration

Number of conversation turns

First response latency

Average response latency

P95 response latency

Interruption latency

Input text tokens

Input audio tokens

Output text tokens

Output audio tokens

Estimated total cost

Estimated cost per minute
```

After ending the call show:

```text
Duration:          12:43
Turns:             34

Avg latency:       620 ms
P95 latency:       1.1 s

AI cost:           $0.XX
Cost / minute:     $0.0XX
```

## Latency Measurement

For every user turn record:

```text
userSpeechStart
userSpeechEnd
assistantResponseStart
firstAssistantAudio
assistantResponseEnd
```

Main latency metric:

```text
responseLatency =
firstAssistantAudio - userSpeechEnd
```

For interruptions:

```text
user starts speaking
while AI is speaking

↓

AI audio stops
```

Measure:

```text
interruptionLatency =
audioStopped - userSpeechStart
```

## Cost Tracking

Use usage information returned by Alibaba whenever possible.

Track separately:

```text
inputTextTokens
inputAudioTokens

outputTextTokens
outputAudioTokens
```

Pricing must live in a configuration file rather than being hardcoded into application logic.

Calculate:

```text
totalCost
costPerMinute
```

The dashboard should update the estimated current cost during the call when usage data is available.

## Important Experiment

Run conversations of different lengths:

```text
5 min
10 min
20 min
30 min
60 min
```

Compare:

```text
total cost
cost/minute
average latency
input tokens/minute
output tokens/minute
```

The main question is whether longer conversation context causes **cost per minute to increase over time**.

## Debug Panel

Add a developer panel showing realtime information:

```text
Connection state
WebRTC state
Current speaker

Input audio level
Output audio level

Last latency
Average latency

Tokens used
Current estimated cost
Cost/minute

Errors
```

## Definition of Done

The prototype is complete when:

1. User can start a call in Chrome.
2. Browser requests microphone access.
3. WebRTC connects to `qwen-audio-3.0-realtime-flash`.
4. User can have a natural voice conversation.
5. User can interrupt AI while it is speaking.
6. Calls can run for at least 20 minutes.
7. Latency is measured.
8. Token usage is recorded.
9. Cost is calculated.
10. Ending a call displays a latency/cost report.

The purpose of the project is not UI polish.

The purpose is to answer:

> How good, fast, stable, and cheap is Qwen realtime voice for long AI conversations?
