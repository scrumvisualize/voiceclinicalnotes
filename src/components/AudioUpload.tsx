import { useState } from 'react';

interface Props {
  onTranscript: (text: string) => void;
}

export default function AudioUpload({ onTranscript }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an audio file.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData
      });

      // Read the response as text first to handle empty or invalid JSON.
      const responseText = await response.text();

      if (!responseText.trim()) {
        throw new Error(
          `Server returned an empty response (HTTP ${response.status}).`
        );
      }

      let data: { transcript?: string; error?: string };

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Server returned an invalid response (HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || 'Audio transcription failed.');
      }

      if (!data.transcript) {
        throw new Error('The server response did not contain a transcript.');
      }

      onTranscript(data.transcript);
      setSuccess('Audio transcribed successfully.');
      setFile(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Audio upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <label className="mb-2 block font-semibold">Upload Sample Audio</label>

      <input
        type="file"
        accept="audio/*"
        onChange={(event) => {
          setFile(event.target.files?.[0] ?? null);
          setError('');
          setSuccess('');
        }}
        disabled={loading}
        className="block w-full text-sm"
      />

      {file && (
        <p className="mt-2 text-sm text-slate-600">Selected: {file.name}</p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={loading || !file}
        className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Transcribing...' : 'Upload & Transcribe'}
      </button>

      {loading && (
        <p className="mt-2 text-sm text-slate-600">Transcribing audio...</p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
    </div>
  );
}
