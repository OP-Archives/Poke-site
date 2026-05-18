import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import type { Contest, ContestMatch, ContestSubmission } from '../types/contests';
import Footer from '../utils/Footer';
import Loading from '../utils/Loading';
import BracketViewer, { buildRounds } from './BracketViewer';
import client from './client';

export default function Winners() {
  const params = useParams();
  const contestId = params.contestId as string;
  const [matches, setMatches] = useState<ContestMatch[] | undefined>(undefined);
  const [allSubmissions, setAllSubmissions] = useState<ContestSubmission[]>([]);
  const [contest, setContest] = useState<Contest | undefined>(undefined);
  const [rounds, setRounds] = useState<Awaited<ReturnType<typeof buildRounds>> | null>(null);

  useEffect(() => {
    document.title = `Contest ${contestId} Winners - Poke`;

    client
      .service('submissions')
      .find({ query: { contestId } })
      .then((res: unknown) => {
        const all = Array.isArray(res) ? res : ((res as { data: ContestSubmission[] }).data ?? []);
        setAllSubmissions(all);
      })
      .catch(console.error);

    client
      .service('contests')
      .get(contestId)
      .then((data: Contest) => setContest(data))
      .catch(console.error);

    client
      .service('matches')
      .find({ query: { contestId, $sort: { id: 1 } } })
      .then((res: unknown) => {
        const data = Array.isArray(res) ? res : ((res as { data: ContestMatch[] }).data ?? []);
        setMatches(data.length > 0 ? data : undefined);
      })
      .catch(() => setMatches(undefined));
  }, [contestId]);

  useEffect(() => {
    if (!matches || !allSubmissions) return;
    setRounds(buildRounds(matches, allSubmissions));
  }, [matches, allSubmissions]);

  if (!matches || !rounds || !contest) return <Loading />;

  return (
    <SimpleBar className="min-h-0 h-full w-full">
      <div className="flex justify-center items-center flex-col p-1">
        <img src="/contestlogo.png" alt="" className="max-w-[200px] h-auto" />
        <div className="p-3 flex justify-center items-center w-full overflow-x-auto">
          <BracketViewer
            rounds={rounds}
            contestType={contest.type}
            matches={matches}
            setMatches={setMatches}
            isPublic
          />
        </div>
        <Footer />
      </div>
    </SimpleBar>
  );
}
