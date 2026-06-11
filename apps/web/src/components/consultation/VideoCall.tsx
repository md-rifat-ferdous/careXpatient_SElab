'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  UID,
} from 'agora-rtc-sdk-ng';

interface Props {
  appId: string;
  channelName: string;
  token: string;
  uid?: string;
  onCallEnded: () => void;
  localUserName: string;
  remoteUserName: string;
}

export default function VideoCall({
  appId,
  channelName,
  token,
  uid,
  onCallEnded,
  localUserName,
  remoteUserName,
}: Props) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [isLoading, setIsLoading] = useState(true);

  const localTracksRef = useRef<{
    videoTrack: ICameraVideoTrack | null;
    audioTrack: IMicrophoneAudioTrack | null;
  }>({ videoTrack: null, audioTrack: null });

  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (!mounted) return;

          if (mediaType === 'video') {
            setRemoteJoined(true);
            if (remoteVideoRef.current) {
              const videoTrack = user.videoTrack as IRemoteVideoTrack;
              videoTrack.play(remoteVideoRef.current);
            }
          }
          if (mediaType === 'audio') {
            const audioTrack = user.audioTrack as IRemoteAudioTrack;
            audioTrack.play();
          }
        });

        client.on('user-unpublished', () => {
          setRemoteJoined(false);
        });

        client.on('user-left', () => {
          setRemoteJoined(false);
        });

        client.on('network-quality', (stats) => {
          if (!mounted) return;
          const down = stats.downlinkNetworkQuality;
          if (down <= 2) setConnectionQuality('good');
          else if (down <= 4) setConnectionQuality('fair');
          else setConnectionQuality('poor');
        });

        await client.join(appId, channelName, token, uid || null);

        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

        localTracksRef.current = { videoTrack, audioTrack };

        await client.publish([videoTrack, audioTrack]);

        if (mounted && localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
          setIsLoading(false);
        }

        const startTime = Date.now();
        durationIntervalRef.current = setInterval(() => {
          if (mounted) {
            setCallDuration(Math.floor((Date.now() - startTime) / 1000));
          }
        }, 1000);
      } catch (error) {
        console.error('Failed to join Agora channel:', error);
        if (mounted) setIsLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      cleanup();
    };
  }, [appId, channelName, token, uid]);

  const cleanup = async () => {
    const { videoTrack, audioTrack } = localTracksRef.current;
    if (videoTrack) { videoTrack.stop(); videoTrack.close(); }
    if (audioTrack) { audioTrack.stop(); audioTrack.close(); }
    if (clientRef.current) {
      clientRef.current.removeAllListeners();
      await clientRef.current.leave();
    }
  };

  const toggleVideo = useCallback(async () => {
    const track = localTracksRef.current.videoTrack;
    if (track) {
      await track.setEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [isVideoEnabled]);

  const toggleAudio = useCallback(async () => {
    const track = localTracksRef.current.audioTrack;
    if (track) {
      await track.setEnabled(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  }, [isAudioEnabled]);

  const handleEndCall = useCallback(async () => {
    await cleanup();
    onCallEnded();
  }, [onCallEnded]);

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const qualityColor = connectionQuality === 'good' ? 'bg-green-500' : connectionQuality === 'fair' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="relative w-full h-full bg-gray-900 flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-sm">Connecting to video call...</p>
          </div>
        </div>
      )}

      {/* Remote Video */}
      <div ref={remoteVideoRef} className="flex-1 bg-gray-800 relative">
        {!remoteJoined && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-lg font-semibold">{remoteUserName}</p>
              <p className="text-sm">Waiting for them to join...</p>
            </div>
          </div>
        )}
        {remoteJoined && (
          <div className="absolute top-4 left-4 bg-black/50 rounded-lg px-3 py-1.5">
            <p className="text-white text-sm font-semibold">{remoteUserName}</p>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute top-4 right-4 w-48 h-36 rounded-xl overflow-hidden border-2 border-gray-600 shadow-lg bg-gray-800">
        <div ref={localVideoRef} className="w-full h-full" />
        <div className="absolute bottom-2 left-2 bg-black/50 rounded px-2 py-0.5">
          <p className="text-white text-xs">{localUserName}</p>
        </div>
      </div>

      {/* Connection Quality */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-4 py-1.5">
        <div className={`w-2 h-2 rounded-full ${qualityColor}`} />
        <span className="text-white text-xs capitalize">{connectionQuality}</span>
      </div>

      {/* Call Duration */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 mt-8 bg-black/50 rounded-full px-4 py-1">
        <span className="text-white text-xs font-mono">{formatDuration(callDuration)}</span>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-center gap-4">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-colors ${
            isAudioEnabled ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-600 text-white'
          }`}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isAudioEnabled ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            )}
          </svg>
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${
            isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-600 text-white'
          }`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isVideoEnabled ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z M3 3l18 18" />
            )}
          </svg>
        </button>

        <button
          onClick={handleEndCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          title="End call"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
