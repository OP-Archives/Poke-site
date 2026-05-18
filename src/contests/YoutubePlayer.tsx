import { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import type { ContestSubmission } from '../types/contests';

interface YoutubePlayerProps {
  submission: ContestSubmission;
  show?: boolean;
}

export default function YoutubePlayer({ submission, show }: YoutubePlayerProps) {
  const playerRef = useRef<unknown>(undefined);
  const [showPlayer, setShowPlayer] = useState(show === undefined ? false : show);

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      playsinline: 1,
      rel: 0,
      modestbranding: 1,
    },
  };

  const onReady = (evt: { target: unknown }) => {
    playerRef.current = evt.target;
    cueVideo(evt.target);
  };

  const cueVideo = (target: unknown) => {
    if (!target || !submission) return;
    const player = target as { cueVideoById: (_v: unknown) => void };
    const v =
      submission.video.end != null
        ? {
            videoId: String(submission.video.id),
            startSeconds: submission.video.start ?? 0,
            endSeconds: submission.video.end,
          }
        : { videoId: String(submission.video.id), startSeconds: submission.video.start ?? 0 };
    player.cueVideoById(v);
  };

  useEffect(() => {
    if (show === undefined) setShowPlayer(false);
    if (playerRef.current) cueVideo(playerRef.current);
  }, [submission, show]);

  return (
    <div className="bg-black aspect-video h-full w-full cursor-pointer" onClick={() => setShowPlayer(true)}>
      <YouTube
        id="player"
        style={{ width: '100%', height: '100%', display: showPlayer ? 'block' : 'none' }}
        opts={opts}
        onReady={onReady}
      />
    </div>
  );
}
