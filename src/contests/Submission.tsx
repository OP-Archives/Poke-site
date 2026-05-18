import { useEffect, useState } from 'react';
import type { Contest, ContestSubmission, ContestUser, VideoData } from '../types/contests';
import client from './client';

interface SubmissionProps {
  user: ContestUser;
  contest: Contest;
  submission?: ContestSubmission;
  type: 'Submission' | 'Modify';
}

type SourceOption = { label: string; value: number };

const SOURCE_MAP: Record<string, SourceOption[]> = {
  alert: [
    { label: 'Youtube', value: 1 },
    { label: 'Tiktok', value: 2 },
  ],
  song: [{ label: 'Soundcloud', value: 1 }],
  review: [{ label: 'Twitter', value: 1 }],
  clips: [{ label: 'Twitch', value: 1 }],
};

const LINK_REGEX: Record<string, RegExp> = {
  youtube:
    /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/|shorts\/|clip\/)?)([\w\-]+)(\S+)?$/,
  tiktok: /tiktok\.com(.*)\/video\/(\d+)/,
  soundcloud: /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:soundcloud\.com|snd.sc))(\/)(\S+)(\/)(\S+)$/,
  twitter: /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:twitter\.com))(\/)(\S+)(\/)(\S+)$/,
  twitch: /https:\/\/(?:clips|www)\.twitch\.tv\/(?:(?:[a-z]+)\/clip\/)?(\S+)$/,
};

export default function Submission({ contest, user, submission, type }: SubmissionProps) {
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [title, setTitle] = useState(submission?.title ?? '');
  const [comment, setComment] = useState(submission?.comment ?? '');
  const [start, setStart] = useState<number | null | undefined>(submission?.video.start ?? null);
  const [end, setEnd] = useState<number | null | undefined>(submission?.video.end ?? undefined);
  const [video, setVideo] = useState<VideoData | undefined>(submission?.video ?? undefined);
  const [linkError, setLinkError] = useState(false);
  const [linkErrorMsg, setLinkErrorMsg] = useState<string | undefined>();
  const [commentError, setCommentError] = useState(false);
  const [commentErrorMsg, setCommentErrorMsg] = useState<string | undefined>();
  const [startError, setStartError] = useState(false);
  const [startErrorMsg, setStartErrorMsg] = useState<string | undefined>();
  const [endError, setEndError] = useState(false);
  const [endErrorMsg, setEndErrorMsg] = useState<string | undefined>();
  const [source, setSource] = useState(1);
  const [link, setLink] = useState(submission?.video.link ?? '');

  useEffect(() => {
    if (link.length === 0) return;
    setLinkError(false);

    let regex: RegExp | null = null;
    let videoSource: VideoData['source'] = null;

    if (contest.type === 'alert' && source === 1) {
      regex = LINK_REGEX.youtube;
      videoSource = 'youtube';
    } else if (contest.type === 'alert' && source === 2) {
      regex = LINK_REGEX.tiktok;
      videoSource = 'tiktok';
    } else if (contest.type === 'song' && source === 1) {
      regex = LINK_REGEX.soundcloud;
      videoSource = 'soundcloud';
    } else if (contest.type === 'review' && source === 1) {
      regex = LINK_REGEX.twitter;
      videoSource = 'twitter';
    } else if (contest.type === 'clips' && source === 1) {
      regex = LINK_REGEX.twitch;
      videoSource = 'twitch';
    }

    if (!regex || !regex.test(link)) {
      setLinkError(true);
      setLinkErrorMsg('Link is not valid!');
      setVideo(null as unknown as VideoData);
      return;
    }

    let newLink = link.valueOf();
    if (contest.type === 'review' && link.indexOf('?') !== -1) {
      newLink = link.substring(0, link.indexOf('?'));
    }
    const linkSplit = newLink.split(regex);

    let videoId: string | null = null;
    if (contest.type === 'alert' && source === 1) videoId = linkSplit[5];
    else if (contest.type === 'alert' && source === 2) videoId = linkSplit[2];
    else if (contest.type === 'song' && source === 1) videoId = linkSplit[7];
    else if (contest.type === 'review' && source === 1) videoId = linkSplit[7];
    else if (contest.type === 'clips' && source === 1) videoId = linkSplit[1];

    setVideo({ id: videoId, link, source: videoSource, start: start ?? null, end: end ?? null });
  }, [link, contest, source]);

  const handleCommentChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentError(false);
    if (evt.target.value.length >= 280) {
      setCommentError(true);
      setCommentErrorMsg('Comment is too long..');
      setComment('');
      return;
    }
    setComment(evt.target.value);
  };

  const startChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setStartError(false);
    const number = parseInt(evt.target.value);
    if (isNaN(number)) {
      setStartError(true);
      setStartErrorMsg('Must be a number');
      setStart(undefined);
      return;
    }
    if (number < 0) {
      setStartError(true);
      setStartErrorMsg('Must be a positive number & Start timestamp must be less than start');
      setStart(undefined);
      return;
    }
    if (end !== undefined && end !== null && number >= end) {
      setStartError(true);
      setStartErrorMsg('Start timestamp should be less than end timestamp');
      setStart(undefined);
      return;
    }
    setStart(number);
  };

  const endChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setEndError(false);
    const number = parseInt(evt.target.value);
    if (isNaN(number)) {
      setEndError(true);
      setEndErrorMsg('Must be a number');
      setEnd(undefined);
      return;
    }
    if (number < 0) {
      setEndError(true);
      setEndErrorMsg('Must be a positive number');
      setEnd(undefined);
      return;
    }
    if (start !== undefined && start !== null && number <= start) {
      setEndError(true);
      setEndErrorMsg('End timestamp should be greater than start timestamp');
      setEnd(undefined);
      return;
    }
    setEnd(number);
  };

  const handleSubmit = async () => {
    const tmpVideo: VideoData = {
      id: video?.id ?? null,
      link: video?.link ?? '',
      source: video?.source ?? null,
      start: start !== undefined ? (start ?? null) : null,
      end: end !== undefined ? (end ?? null) : null,
    };
    try {
      await client.service('submissions').create({
        contestId: contest.id,
        userId: user.id,
        username: user.username,
        display_name: user.display_name,
        video: tmpVideo,
        comment,
        title,
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
      setError(true);
      setErrorMsg((e as Error).message);
    }
  };

  const handleModify = async () => {
    if (!submission) return;
    const tmpVideo: VideoData = {
      id: video?.id ?? null,
      link: video?.link ?? '',
      source: video?.source ?? null,
      start: start !== undefined ? (start ?? null) : null,
      end: end !== undefined ? (end ?? null) : null,
    };
    try {
      await client.service('submissions').patch(submission.id, {
        contestId: contest.id,
        video: tmpVideo,
        comment,
        title,
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
      setError(true);
      setErrorMsg((e as Error).message);
    }
  };

  const sources = SOURCE_MAP[contest.type] ?? [];
  const needsTitle = ['song', 'alert', 'clips'].includes(contest.type);
  const isDisabled = needsTitle ? title.length === 0 || !video : !video;

  return (
    <div className="flex justify-center items-center flex-col">
      <img alt="" src="/contestlogo.png" className="h-auto w-full" />
      {submission && <p className="uppercase text-sm mt-1">Submission ID: {submission.id}</p>}
      <p className="uppercase text-sm">Contest ID: {contest.id}</p>
      <p className="uppercase text-sm">{contest.title}</p>
      <h5 className="text-primary uppercase font-semibold text-xl mt-1">
        {type === 'Modify' ? 'Modify Submission' : 'Submission'}
      </h5>
      {error && (
        <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-2 rounded mt-1 w-full text-sm">
          {errorMsg}
        </div>
      )}
      <form onSubmit={(e) => e.preventDefault()} className="w-full">
        {(contest.type === 'song' || contest.type === 'alert' || contest.type === 'clips') && (
          <input
            type="text"
            required
            placeholder="Title"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-dark-light border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 mt-1"
          />
        )}
        {sources.length > 0 && (
          <select
            value={source}
            onChange={(e) => setSource(Number(e.target.value))}
            required
            className="w-full bg-dark-light border border-gray-600 rounded px-3 py-2 text-sm text-white mt-1"
          >
            {sources.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          required
          placeholder="Link"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          onChange={(e) => setLink(e.target.value)}
          className="w-full bg-dark-light border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 mt-1"
        />
        {linkError && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-2 rounded mt-1 w-full text-sm">
            {linkErrorMsg}
          </div>
        )}
        {contest.type === 'alert' && source === 1 && (
          <>
            {startError && (
              <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-2 rounded mt-1 w-full text-sm">
                {startErrorMsg}
              </div>
            )}
            <input
              type="text"
              required
              placeholder="Start Timestamp"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              onChange={startChange}
              className="w-full bg-dark-light border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 mt-1"
            />
          </>
        )}
        {contest.type === 'alert' && source === 1 && (
          <>
            {endError && (
              <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-2 rounded mt-1 w-full text-sm">
                {endErrorMsg}
              </div>
            )}
            <input
              type="text"
              required
              placeholder="End Timestamp"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              onChange={endChange}
              className="w-full bg-dark-light border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 mt-1"
            />
          </>
        )}
        {commentError && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-2 rounded mt-1 w-full text-sm">
            {commentErrorMsg}
          </div>
        )}
        {(contest.type === 'song' || contest.type === 'alert') && (
          <textarea
            rows={4}
            placeholder="Comment"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            onChange={handleCommentChange}
            className="w-full bg-dark-light border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 mt-1 resize-none"
          />
        )}
        <button
          type="submit"
          onClick={type === 'Modify' ? handleModify : handleSubmit}
          disabled={isDisabled}
          className="w-full bg-primary/20 border border-primary text-primary px-4 py-2 rounded hover:bg-primary/10 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {type === 'Modify' ? 'Modify' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
