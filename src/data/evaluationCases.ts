export default [
  {
    id: 1,
    note: `Patient diagnosed with lower back pain.
Symptoms include pain when bending.
Continued physiotherapy is medically necessary.
Patient received physiotherapy twice weekly for 6 weeks.
Patient reports 30% improvement.`,

    groundTruth: {
      'Diagnosis documented': true,
      'Symptoms documented': true,
      'Medical necessity': true,
      'Treatment documented': true,
      'Treatment duration': true,
      'Patient progress': true
    }
  },

  {
    id: 2,
    note: `Patient reports headache and dizziness.`,

    groundTruth: {
      'Diagnosis documented': false,
      'Symptoms documented': true,
      'Medical necessity': false,
      'Treatment documented': false,
      'Treatment duration': false,
      'Patient progress': false
    }
  }
];
