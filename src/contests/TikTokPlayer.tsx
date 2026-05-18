import { useEffect, useState } from 'react';
import type { ContestSubmission } from '../types/contests';

interface TikTokPlayerProps {
  submission: ContestSubmission;
  show?: boolean;
}

export default function TikTokPlayer({ submission, show }: TikTokPlayerProps) {
  const [showPlayer, setShowPlayer] = useState(show === undefined ? false : show);

  useEffect(() => {
    if (show === undefined) setShowPlayer(false);
  }, [submission, show]);

  return (
    <div
      className="bg-black aspect-[9/16] max-w-[325px] h-[575px] min-h-0 cursor-pointer"
      onClick={() => setShowPlayer(true)}
    >
      <iframe
        className={!showPlayer ? 'hidden' : ''}
        title="TikTok Player"
        width="100%"
        height="100%"
        scrolling="no"
        frameBorder="0"
        allowFullScreen
        src={`https://tiktok.com/embed/${submission.video.id}`}
      />
    </div>
  );
}
