import { useEffect, useState } from 'react';

import Header from './components/Header';
import VoiceCapture from './components/VoiceCapture';
import ClinicalNote from './components/ClinicalNote';
import AIAnalysis from './components/AIAnalysis';
import Requirements from './components/Requirements';
import Evaluation from './components/Evaluation';

import { clinicalNote } from './data/mockData';
import type { Finding } from './types/clinical';

function App() {
  const [note, setNote] = useState(clinicalNote);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisFindings, setAnalysisFindings] = useState<Finding[]>([]);
  const [evaluation, setEvaluation] = useState<{
    accuracy: number | null;
    precision: number | null;
    recall: number | null;
    testCases: number;
  }>({
    accuracy: null,
    precision: null,
    recall: null,
    testCases: 0
  });

  useEffect(() => {
    loadEvaluation();
  }, []);

  const loadEvaluation = async () => {
    try {
      console.log('Calling /api/evaluate...');

      const response = await fetch('http://localhost:3001/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Evaluation status:', response.status);

      const data = await response.json();

      console.log('Evaluation API response:', data);

      if (!response.ok) {
        throw new Error(
          data.error || `Evaluation failed with status ${response.status}`
        );
      }

      setEvaluation({
        accuracy: data.accuracy ?? null,
        precision: data.precision ?? null,
        recall: data.recall ?? null,
        testCases: data.testCases ?? 0
      });
    } catch (error) {
      console.error('Unable to evaluate model:', error);
    }
  };

  const handleTranscriptChange = async (transcript: string) => {
    setNote((current) => ({
      ...current,
      note: transcript
    }));

    if (!transcript.trim()) {
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:3001/api/extract-clinical-info',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            transcript
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to extract clinical information');
      }

      const data = await response.json();

      if (data.diagnosis?.trim()) {
        setNote((current) => ({
          ...current,
          diagnosis: data.diagnosis
        }));
      }
    } catch (error) {
      console.error('Unable to extract clinical information:', error);
    }
  };

  const analyzeClinicalNote = async () => {
    if (!note.note.trim()) {
      console.warn('No clinical note available for analysis.');
      return;
    }

    try {
      setAnalyzing(true);

      console.log('Sending clinical note for AI analysis...');

      const response = await fetch('http://localhost:3001/api/analyze-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          note: note.note
        })
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`AI analysis failed: ${errorText}`);
      }

      const data = await response.json();

      console.log('AI analysis response:', data);

      setAnalysisFindings(data.findings);
      // Real evaluation returned by backend
      if (data.evaluation) {
        setEvaluation(data.evaluation);
      }
    } catch (error) {
      console.error('Unable to analyze clinical note:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Voice + Clinical Note */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <VoiceCapture onTranscriptChange={handleTranscriptChange} />

          <ClinicalNote note={note} />
        </div>

        {/* Analyze Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={analyzeClinicalNote}
            disabled={analyzing || !note.note.trim()}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium text-white transition ${
              analyzing || !note.note.trim()
                ? 'cursor-not-allowed bg-slate-400'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {analyzing ? 'Analyzing Clinical Note...' : 'Analyze Clinical Note'}
          </button>
        </div>

        {/* AI Analysis */}
        <div className="mb-6">
          <AIAnalysis findings={analysisFindings} />
        </div>

        {/* Requirements */}
        <div className="mb-6">
          <Requirements />
        </div>

        {/* Evaluation */}
        <div>
          <Evaluation evaluation={evaluation} />
        </div>
      </main>
    </div>
  );
}

export default App;
