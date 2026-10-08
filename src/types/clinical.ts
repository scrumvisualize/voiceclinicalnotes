export type FindingStatus = 'PASS' | 'REVIEW' | 'FAIL';

export interface Finding {
  requirement: string;
  status: FindingStatus;
  value: string;
  confidence: number;
  explanation: string;
}

export interface ClinicalNote {
  patientId: string;
  diagnosis: string;
  note: string;
}

export interface Evaluation {
  accuracy: number;
  precision: number;
  recall: number;
  testCases: number;
}
