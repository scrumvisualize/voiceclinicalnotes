import { useRef, useState } from 'react';

interface Props {
  onTranscriptChange: (transcript: string) => void;
}

export default function VoiceCapture({ onTranscriptChange }: Props) {
  const [active, setActive] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);

  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const liveTranscriptRef = useRef('');

  const cleanupSession = () => {
    console.log('Cleaning up Realtime session...');

    mediaStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    dataChannelRef.current?.close();

    peerConnectionRef.current?.close();

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
    }

    mediaStreamRef.current = null;
    peerConnectionRef.current = null;
    dataChannelRef.current = null;
    audioElementRef.current = null;

    setActive(false);
    setConnecting(false);
  };

  const handleVoiceSession = async () => {
    // ----------------------------------------------------------
    // END SESSION
    // ----------------------------------------------------------

    if (active) {
      console.log('Ending voice session...');
      cleanupSession();
      return;
    }

    // Prevent multiple clicks while connecting
    if (connecting) {
      return;
    }

    try {
      setConnecting(true);

      // Start a fresh transcript
      liveTranscriptRef.current = '';
      onTranscriptChange('');

      console.log('Creating Realtime session...');

      // ----------------------------------------------------------
      // 1. Get ephemeral client secret from backend
      // ----------------------------------------------------------

      const sessionResponse = await fetch(
        'http://localhost:3001/api/realtime/session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();

        throw new Error(`Unable to create Realtime session: ${errorText}`);
      }

      const sessionData = await sessionResponse.json();

      const ephemeralKey = sessionData.clientSecret;

      if (!ephemeralKey) {
        throw new Error('Realtime client secret was not returned.');
      }

      console.log('Realtime session created.');

      // ----------------------------------------------------------
      // 2. Request microphone
      // ----------------------------------------------------------

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      mediaStreamRef.current = mediaStream;

      console.log('Microphone access granted.');

      // ----------------------------------------------------------
      // 3. Create WebRTC connection
      // ----------------------------------------------------------

      const peerConnection = new RTCPeerConnection();

      peerConnectionRef.current = peerConnection;

      // ----------------------------------------------------------
      // 4. Monitor WebRTC connection
      // ----------------------------------------------------------

      peerConnection.onconnectionstatechange = () => {
        console.log('WebRTC connection state:', peerConnection.connectionState);

        if (peerConnection.connectionState === 'connected') {
          console.log('WebRTC connection established.');

          setActive(true);
          setConnecting(false);
        }

        if (
          peerConnection.connectionState === 'failed' ||
          peerConnection.connectionState === 'disconnected' ||
          peerConnection.connectionState === 'closed'
        ) {
          cleanupSession();
        }
      };

      // ----------------------------------------------------------
      // 5. Send microphone audio
      // ----------------------------------------------------------

      mediaStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, mediaStream);
      });

      // ----------------------------------------------------------
      // 6. Remote audio
      // ----------------------------------------------------------

      const audioElement = document.createElement('audio');

      audioElement.autoplay = true;

      audioElementRef.current = audioElement;

      peerConnection.ontrack = (event) => {
        console.log('Remote audio track received.');

        audioElement.srcObject = event.streams[0];
      };

      // ----------------------------------------------------------
      // 7. Create Realtime data channel
      // ----------------------------------------------------------

      const dataChannel = peerConnection.createDataChannel('oai-events');

      dataChannelRef.current = dataChannel;

      // ----------------------------------------------------------
      // 8. Configure Realtime session
      // ----------------------------------------------------------

      dataChannel.onopen = () => {
        console.log('Realtime data channel connected.');

        const sessionUpdate = {
          type: 'session.update',

          session: {
            type: 'realtime',

            instructions:
              'You are a clinical documentation transcription assistant. ' +
              'Transcribe the clinician speech accurately. ' +
              'Do not provide medical advice. ' +
              'Do not respond verbally. ' +
              'Preserve clinical terminology, symptoms, diagnoses, ' +
              'treatments, medications, anatomy and measurements.',

            audio: {
              input: {
                transcription: {
                  model: 'gpt-4o-mini-transcribe',
                  prompt:
                    'Clinical documentation. Preserve medical terminology, ' +
                    'symptoms, diagnoses, treatments, medications, anatomy, ' +
                    'measurements and clinical phrases accurately.'
                }
              }
            }
          }
        };

        console.log('Sending Realtime configuration...');

        dataChannel.send(JSON.stringify(sessionUpdate));
      };

      // ----------------------------------------------------------
      // 9. Receive Realtime events
      // ----------------------------------------------------------

      dataChannel.onmessage = (event) => {
        try {
          const realtimeEvent = JSON.parse(event.data);

          console.log('Realtime event:', realtimeEvent);

          // Session created
          if (realtimeEvent.type === 'session.created') {
            console.log('Realtime session confirmed.');
          }

          // Session updated
          if (realtimeEvent.type === 'session.updated') {
            console.log('Realtime configuration confirmed.');
          }

          // Speech started
          if (realtimeEvent.type === 'input_audio_buffer.speech_started') {
            console.log('🎙 Speech started');
          }

          // Speech stopped
          if (realtimeEvent.type === 'input_audio_buffer.speech_stopped') {
            console.log('🛑 Speech stopped');
          }

          // ----------------------------------------------------
          // LIVE TRANSCRIPT
          // ----------------------------------------------------

          if (
            realtimeEvent.type ===
            'conversation.item.input_audio_transcription.delta'
          ) {
            const delta = realtimeEvent.delta ?? '';

            if (!delta) {
              return;
            }

            liveTranscriptRef.current += delta;

            console.log('Live transcript:', liveTranscriptRef.current);

            onTranscriptChange(liveTranscriptRef.current);
          }

          // ----------------------------------------------------
          // FINAL TRANSCRIPT
          // ----------------------------------------------------

          if (
            realtimeEvent.type ===
            'conversation.item.input_audio_transcription.completed'
          ) {
            const transcript = realtimeEvent.transcript ?? '';

            console.log('Final transcript:', transcript);

            if (transcript) {
              liveTranscriptRef.current = transcript;

              onTranscriptChange(transcript);
            }
          }

          // ----------------------------------------------------
          // TRANSCRIPTION ERROR
          // ----------------------------------------------------

          if (
            realtimeEvent.type ===
            'conversation.item.input_audio_transcription.failed'
          ) {
            console.error('Transcription failed:', realtimeEvent.error);
          }

          // ----------------------------------------------------
          // GENERAL REALTIME ERROR
          // ----------------------------------------------------

          if (realtimeEvent.type === 'error') {
            console.error('Realtime API error:', realtimeEvent.error);
          }
        } catch (error) {
          console.error('Unable to process Realtime event:', error);
        }
      };

      // ----------------------------------------------------------
      // Data channel error
      // ----------------------------------------------------------

      dataChannel.onerror = (error) => {
        console.error('Realtime data channel error:', error);
      };

      dataChannel.onclose = () => {
        console.log('Realtime data channel closed.');
      };

      // ----------------------------------------------------------
      // 10. Create WebRTC offer
      // ----------------------------------------------------------

      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      if (!offer.sdp) {
        throw new Error('WebRTC offer SDP was not generated.');
      }

      console.log('Sending WebRTC offer to OpenAI...');

      // ----------------------------------------------------------
      // 11. Connect to OpenAI Realtime
      // ----------------------------------------------------------

      const realtimeResponse = await fetch(
        'https://api.openai.com/v1/realtime/calls',
        {
          method: 'POST',

          headers: {
            Authorization: `Bearer ${ephemeralKey}`,

            'Content-Type': 'application/sdp',

            Accept: 'application/sdp'
          },

          body: offer.sdp
        }
      );

      if (!realtimeResponse.ok) {
        const errorText = await realtimeResponse.text();

        throw new Error(`Realtime connection failed: ${errorText}`);
      }

      // ----------------------------------------------------------
      // 12. Set OpenAI WebRTC answer
      // ----------------------------------------------------------

      const answer = await realtimeResponse.text();

      if (!answer) {
        throw new Error('OpenAI returned an empty WebRTC answer.');
      }

      await peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: answer
      });

      console.log('OpenAI WebRTC connection established.');
    } catch (error) {
      console.error('Unable to start voice session:', error);

      cleanupSession();
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Voice Capture
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            GPT-Realtime-2.1 Mini
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Capture the clinician&apos;s spoken note.
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-lg">
          🎙
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
        <p className="text-sm text-slate-500">
          {connecting
            ? 'Connecting to voice session...'
            : active
              ? 'Voice session active — speak now'
              : 'Voice session inactive'}
        </p>

        <button
          onClick={handleVoiceSession}
          disabled={connecting}
          className={`mt-4 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition ${
            active
              ? 'bg-red-500 hover:bg-red-600'
              : connecting
                ? 'cursor-not-allowed bg-slate-400'
                : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          {connecting
            ? 'Connecting...'
            : active
              ? 'End Voice Session'
              : 'Start Voice Session'}
        </button>
      </div>
    </section>
  );
}
