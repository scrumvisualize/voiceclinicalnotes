import { useEffect, useState } from 'react';

import Header from './components/Header';
import VoiceCapture from './components/VoiceCapture';
import ClinicalNote from './components/ClinicalNote';
import AIAnalysis from './components/AIAnalysis';
import Requirements from './components/Requirements';
import Evaluation from './components/Evaluation';

import { clinicalNote } from './data/mockData';
import type { Finding } from './types/clinical';
import ClinicalHistory, {
  type ClinicalHistoryItem
} from './components/ClinicalHistory';
import AudioUpload from './components/AudioUpload';

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
  const [history, setHistory] = useState<ClinicalHistoryItem[]>([]);

  useEffect(() => {
    loadEvaluation();
    loadHistory();
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

  const loadHistory = () => {
    try {
      const storedHistory = localStorage.getItem('clinicalNoteHistory');

      if (!storedHistory) {
        return;
      }

      const parsedHistory: ClinicalHistoryItem[] = JSON.parse(storedHistory);

      setHistory(parsedHistory);
    } catch (error) {
      console.error('Unable to load clinical note history:', error);
    }
  };
  const saveToHistory = (noteText: string, findings: Finding[]) => {
    const newItem: ClinicalHistoryItem = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      note: noteText,
      findings,
      score: calculateScore(findings)
    };

    const updatedHistory = [newItem, ...history].slice(0, 5);

    setHistory(updatedHistory);

    localStorage.setItem('clinicalNoteHistory', JSON.stringify(updatedHistory));
  };

  const calculateScore = (findings: Finding[]) => {
    if (findings.length === 0) {
      return 0;
    }

    const total = findings.reduce((sum, finding) => {
      switch (finding.status) {
        case 'PASS':
          return sum + 100;

        case 'REVIEW':
          return sum + 50;

        case 'FAIL':
          return sum;

        default:
          return sum;
      }
    }, 0);

    return Math.round(total / findings.length);
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

      saveToHistory(note.note, data.findings);

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

  const handleViewHistory = (item: ClinicalHistoryItem) => {
    setNote((current) => ({
      ...current,
      note: item.note
    }));

    setAnalysisFindings(item.findings);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDeleteHistory = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id);

    setHistory(updatedHistory);

    localStorage.setItem('clinicalNoteHistory', JSON.stringify(updatedHistory));
  };

  const handleClearHistory = () => {
    setHistory([]);

    localStorage.removeItem('clinicalNoteHistory');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Voice + Clinical Note */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <VoiceCapture onTranscriptChange={handleTranscriptChange} />

          <ClinicalNote note={note} />
          <AudioUpload
            onTranscript={(transcript) =>
              setNote((previous) => ({
                ...previous,
                note: transcript
              }))
            }
          />
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

        {/* Clinical History */}
        <div className="mb-6">
          <ClinicalHistory
            history={history}
            onView={handleViewHistory}
            onDelete={handleDeleteHistory}
            onClearAll={handleClearHistory}
          />
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
