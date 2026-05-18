import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { BracketSeed, ContestMatch } from '../types/contests';
import CustomLink from '../utils/CustomLink';
import { useMediaQuery } from '../utils/useMediaQuery';
import client from './client';
import TikTokPlayer from './TikTokPlayer';
import YoutubePlayer from './YoutubePlayer';

interface SeedCardProps {
  seed: BracketSeed;
  contestType: string;
  matches: ContestMatch[];
  setMatches: (_m: ContestMatch[]) => void;
  isPublic: boolean;
}

export default function SeedCard({ seed, contestType, matches, setMatches, isPublic }: SeedCardProps) {
  const [modal, setModal] = useState(false);
  const isMobile = useMediaQuery('(max-width: 800px)');

  const TEAM_A = seed.teams[0];
  const TEAM_B = seed.teams[1];

  const winnerA =
    seed.winner != null &&
    (seed.winner === Number(String(TEAM_A?.id)) || seed.winner === Number(String(TEAM_A?.submission?.userId)));
  const winnerB =
    seed.winner != null &&
    (seed.winner === Number(String(TEAM_B?.id)) || seed.winner === Number(String(TEAM_B?.submission?.userId)));

  const chooseWinner = async (winner: NonNullable<typeof TEAM_A.submission>) => {
    if (isPublic) return;
    if (!window.confirm(`${winner.display_name} will be the winner of this match. Are you sure?`)) return;

    const newMatches = [...matches];

    try {
      const data = await client.service('matches').patch(seed.match.id, { winner_id: winner.userId });
      for (let i = 0; i < newMatches.length; i++) {
        if (Number(newMatches[i].id) === Number((data as { id: string }).id)) {
          newMatches[i] = data as ContestMatch;
          break;
        }
      }
    } catch (e) {
      console.error(e);
    }

    const nextMatch = newMatches.find(
      (m) =>
        Number(String(m.previous_a_match)) === seed.match.challonge_match_id ||
        Number(String(m.previous_b_match)) === seed.match.challonge_match_id
    );

    if (!nextMatch) {
      setMatches(newMatches);
      setModal(false);
      return;
    }

    const isTeamA = nextMatch.previous_a_match === seed.match.challonge_match_id;

    try {
      const data = await client
        .service('matches')
        .patch(nextMatch.id, isTeamA ? { team_a_id: winner.userId } : { team_b_id: winner.userId });
      for (let x = 0; x < newMatches.length; x++) {
        if (Number(newMatches[x].id) === Number((data as { id: string }).id)) {
          newMatches[x] = data as ContestMatch;
          break;
        }
      }
    } catch (e) {
      console.error(e);
    }

    setMatches(newMatches);
    setModal(false);
  };

  const hasSubmissions = TEAM_A.submission || TEAM_B.submission;

  return (
    <>
      <div
        className={`w-full min-w-[100px] px-3 py-2 bg-dark-light border border-gray-700 rounded cursor-pointer hover:border-primary/50 transition-colors flex flex-col ${
          seed.useOldVersion ? '' : 'relative'
        }`}
        onClick={() => hasSubmissions && setModal(true)}
      >
        <TeamName name={TEAM_A?.name} isWinner={winnerA} />
        <div className="border-t border-gray-700 my-0.5" />
        <TeamName name={TEAM_B?.name} isWinner={winnerB} />
      </div>

      {hasSubmissions &&
        modal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"
            onClick={() => setModal(false)}
          >
            <div
              className="bg-dark-light border border-gray-700 rounded-lg p-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`flex ${isMobile ? 'flex-col gap-6' : 'flex-row'} justify-evenly items-center`}>
                {TEAM_A.submission &&
                  (() => {
                    const subA = TEAM_A.submission;
                    return (
                      <ModalTeamColumn
                        submission={subA}
                        contestType={contestType}
                        isMobile={isMobile}
                        onChooseWinner={() => chooseWinner(subA)}
                        isPublic={isPublic}
                      />
                    );
                  })()}
                <div className="flex items-center justify-center mx-4">
                  <h4 className="text-red-400 uppercase text-2xl font-bold">Vs</h4>
                </div>
                {TEAM_B.submission &&
                  (() => {
                    const subB = TEAM_B.submission;
                    return (
                      <ModalTeamColumn
                        submission={subB}
                        contestType={contestType}
                        isMobile={isMobile}
                        onChooseWinner={() => chooseWinner(subB)}
                        isPublic={isPublic}
                      />
                    );
                  })()}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function TeamName({ name, isWinner }: { name: string | null; isWinner: boolean }) {
  return (
    <span className={`text-[10px] truncate ${isWinner ? 'text-red-400 font-bold' : 'text-gray-300'}`}>
      {name || '----------'}
    </span>
  );
}

function ModalTeamColumn({
  submission,
  contestType,
  isMobile,
  onChooseWinner,
  isPublic,
}: {
  submission: NonNullable<BracketSeed['teams'][0]['submission']>;
  contestType: string;
  isMobile: boolean;
  onChooseWinner: () => void;
  isPublic: boolean;
}) {
  const widthClass = isMobile ? 'w-full' : 'w-[60%]';

  return (
    <div className="flex items-center justify-center flex-col w-full">
      <p className="text-sm text-gray-400">Submission ID: {submission.id}</p>
      <VideoEmbed submission={submission} contestType={contestType} widthClass={widthClass} />
      <div className="m-1 flex justify-center items-center flex-col">
        <h6 className="font-semibold">{submission.title}</h6>
        <h6 className="text-primary font-semibold">{submission.display_name}</h6>
        <CustomLink href={submission.video.link} target="_blank" rel="noreferrer noopener">
          <p className="text-xs text-gray-400 truncate max-w-[200px] hover:underline cursor-pointer">
            {submission.video.link}
          </p>
        </CustomLink>
        {!isPublic && (
          <button
            className="border border-primary text-primary px-3 py-1.5 rounded hover:bg-primary/10 transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onChooseWinner}
          >
            Winner
          </button>
        )}
      </div>
    </div>
  );
}

function VideoEmbed({
  submission,
  contestType,
  widthClass,
}: {
  submission: NonNullable<BracketSeed['teams'][0]['submission']>;
  contestType: string;
  widthClass: string;
}) {
  if (contestType === 'alert' && (submission.video.source === 'youtube' || !submission.video.source)) {
    return (
      <div className={`m-1 ${widthClass}`}>
        <YoutubePlayer show submission={submission} />
      </div>
    );
  }
  if (contestType === 'alert' && submission.video.source === 'tiktok') {
    return (
      <div className={`m-1 ${widthClass}`}>
        <TikTokPlayer show submission={submission} />
      </div>
    );
  }
  if (contestType === 'clips') {
    return (
      <div className={`m-1 ${widthClass}`}>
        <iframe
          title={submission.video.id ?? ''}
          src={`https://clips.twitch.tv/embed?clip=${submission.video.id}&parent=${window.location.hostname}`}
          height="500px"
          width="100%"
          allowFullScreen
          frameBorder="0"
        />
      </div>
    );
  }
  if (contestType === 'review') {
    return (
      <div className={`m-1 ${widthClass}`}>
        <iframe
          title="Tweet"
          src={`https://platform.twitter.com/embed/Tweet.html?id=${submission.video.id}`}
          width="550"
          height="600"
          frameBorder="0"
        />
      </div>
    );
  }
  if (contestType === 'song') {
    return (
      <div className={`m-1 ${widthClass}`}>
        <iframe
          title="SoundCloud Player"
          width="100%"
          height="160"
          scrolling="no"
          frameBorder="0"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${submission.video.link.replace(/(www\.|m\.)/, '')}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
        />
      </div>
    );
  }
  return null;
}
