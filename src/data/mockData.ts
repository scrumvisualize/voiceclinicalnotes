import type { ClinicalNote, Evaluation, Finding } from '../types/clinical';

export const clinicalNote: ClinicalNote = {
  patientId: 'SYN-10452',
  diagnosis: '',
  note: ''
};

export const findings: Finding[] = [
  {
    requirement: 'Diagnosis documented',
    status: 'PASS',
    value: 'Lower back pain',
    confidence: 0.97,
    explanation: 'Diagnosis is explicitly documented.'
  },
  {
    requirement: 'Symptoms documented',
    status: 'PASS',
    value: 'Lower back pain and stiffness',
    confidence: 0.95,
    explanation: 'Patient symptoms are described.'
  },
  {
    requirement: 'Medical necessity',
    status: 'REVIEW',
    value: '',
    confidence: 0.82,
    explanation:
      'The note does not clearly explain why treatment is medically necessary.'
  },
  {
    requirement: 'Treatment documented',
    status: 'PASS',
    value: 'Physical therapy and stretching exercises',
    confidence: 0.98,
    explanation: 'Treatment interventions are documented.'
  },
  {
    requirement: 'Treatment duration',
    status: 'FAIL',
    value: '',
    confidence: 0.94,
    explanation: 'Treatment frequency or duration is not documented.'
  },
  {
    requirement: 'Patient progress',
    status: 'FAIL',
    value: '',
    confidence: 0.91,
    explanation: 'No measurable patient progress or outcome is documented.'
  }
];

export const evaluation: Evaluation = {
  accuracy: 94,
  precision: 91,
  recall: 96,
  testCases: 100
};
