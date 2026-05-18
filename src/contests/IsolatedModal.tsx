import { useState } from 'react';
import type { Contest, ContestUser } from '../types/contests';
import Creation from './Creation';
import Edit from './Edit';
import Submission from './Submission';

type ModalType = 'Creation' | 'Edit' | 'Submit' | 'Modify';

interface IsolatedModalProps {
  user: ContestUser | null;
  type: ModalType;
  contest?: Contest;
  submission?: unknown;
}

export default function IsolatedModal({ user, type, contest, submission }: IsolatedModalProps) {
  const [modal, setModal] = useState(false);

  if (!user) return null;

  const buttonBase =
    'bg-primary/20 border border-primary text-primary px-3 py-1.5 rounded hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const buttonSecondary =
    'bg-yellow-900/40 border border-yellow-600 text-yellow-200 px-3 py-1.5 rounded hover:bg-yellow-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <>
      {type === 'Creation' && (
        <button onClick={() => setModal(true)} className={buttonBase}>
          Create Contest
        </button>
      )}
      {type === 'Edit' && (
        <button onClick={() => setModal(true)} className={buttonSecondary}>
          Edit
        </button>
      )}
      {(type === 'Submit' || type === 'Modify') && contest && (
        <button disabled={!contest.submission || !user} onClick={() => setModal(true)} className={buttonBase}>
          {type === 'Modify' ? 'Modify' : 'Submit'}
        </button>
      )}

      {modal && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
          onClick={() => setModal(false)}
        >
          <div
            className="bg-dark-light border border-gray-700 rounded-lg p-4 w-[90%] max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {type === 'Creation' && <Creation />}
            {type === 'Submit' && contest && <Submission user={user} contest={contest} type="Submission" />}
            {type === 'Edit' && contest && <Edit contest={contest} />}
            {type === 'Modify' && contest && (
              <Submission user={user} contest={contest} submission={submission as never} type="Modify" />
            )}
          </div>
        </div>
      )}
    </>
  );
}
