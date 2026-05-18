import { useState } from 'react';
import client from './client';

const CONTEST_TYPES = ['alert', 'song', 'review', 'clips'] as const;

export default function Creation() {
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [title, setTitle] = useState('');
  const [active, setActive] = useState(true);
  const [submission, setSubmission] = useState(true);
  const [type, setType] = useState<'alert' | 'song' | 'review' | 'clips'>('alert');

  const handleCreate = async () => {
    try {
      await client.service('contests').create({ title, active, type, submission });
      window.location.reload();
    } catch (e) {
      console.error(e);
      setError(true);
      setErrorMsg('Something went wrong..');
    }
  };

  return (
    <div className="flex justify-center items-center flex-col">
      <img alt="" src="/contestlogo.png" className="h-auto w-full" />
      <h4 className="text-primary uppercase font-semibold text-2xl mt-2">Create Contest</h4>
      {error && (
        <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-2 rounded mt-2 w-full text-sm">
          {errorMsg}
        </div>
      )}
      <form onSubmit={(e) => e.preventDefault()} className="w-full mt-2">
        <input
          type="text"
          required
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          autoFocus
          placeholder="Title"
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-dark-light border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
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
          onClick={handleCreate}
          disabled={title.length === 0}
          className="w-full bg-primary/20 border border-primary text-primary px-4 py-2 rounded hover:bg-primary/10 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create
        </button>
      </form>
    </div>
  );
}
