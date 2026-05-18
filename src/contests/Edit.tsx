import { useState } from 'react';
import type { Contest } from '../types/contests';
import client from './client';

interface EditProps {
  contest: Contest;
}

const CONTEST_TYPES = ['alert', 'song', 'review', 'clips'] as const;

export default function Edit({ contest }: EditProps) {
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [title, setTitle] = useState(contest.title);
  const [active, setActive] = useState(contest.active);
  const [submission, setSubmission] = useState(contest.submission);
  const [type, setType] = useState<Contest['type']>(contest.type);

  const handleEdit = async () => {
    try {
      await client.service('contests').patch(contest.id, { title, active, submission, type });
      window.location.reload();
    } catch (e) {
      console.error(e);
      setError(true);
      setErrorMsg('Something went wrong..');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await client.service('matches').remove(null, { query: { contestId: contest.id } });
    } catch (e) {
      console.error(e);
    }
    try {
      await client.service('contests').remove(contest.id);
      window.location.reload();
    } catch (e) {
      console.error(e);
      setError(true);
      setErrorMsg('Something went wrong..');
    }
  };

  const hasChanges =
    title !== contest.title || submission !== contest.submission || active !== contest.active || type !== contest.type;

  return (
    <div className="flex justify-center items-center flex-col">
      <img alt="" src="/contestlogo.png" className="h-auto w-full" />
      <h4 className="text-primary uppercase font-semibold text-2xl mt-2">Edit</h4>
      <p className="uppercase text-sm mt-1">Contest ID: {contest.id}</p>
      <p className="uppercase text-sm">{contest.title}</p>
      {error && (
        <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-2 rounded mt-2 w-full text-sm">
          {errorMsg}
        </div>
      )}
      <form onSubmit={(e) => e.preventDefault()} className="w-full mt-2">
        <input
          type="text"
          required
          defaultValue={contest.title}
          onChange={(e) => setTitle(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          autoFocus
          className="w-full bg-dark-light border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Contest['type'])}
          className="w-full bg-dark-light border border-gray-600 rounded px-3 py-2 text-sm text-white mt-2"
        >
          {CONTEST_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input type="checkbox" checked={active} onChange={() => setActive(!active)} className="accent-primary" />
          <span className="text-sm text-gray-300">Active Contest</span>
        </label>
        <label className="flex items-center gap-2 mt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={submission}
            onChange={() => setSubmission(!submission)}
            className="accent-primary"
          />
          <span className="text-sm text-gray-300">Allow Submissions</span>
        </label>
        <button
          type="submit"
          onClick={handleEdit}
          disabled={!hasChanges}
          className="w-full bg-primary/20 border border-primary text-primary px-4 py-2 rounded hover:bg-primary/10 transition-colors mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="w-full bg-red-900/40 border border-red-600 text-red-300 px-4 py-2 rounded hover:bg-red-900/60 transition-colors mt-2"
        >
          Delete
        </button>
      </form>
    </div>
  );
}
