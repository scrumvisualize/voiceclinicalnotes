import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import evaluationCases from '../data/evaluationCases';

dotenv.config();

const app = express();
const PORT = 3001;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_VOICE_API_KEY
});

app.use(cors());
app.use(express.json());

// 1. Add these types near the top
type Requirement =
  | 'Diagnosis documented'
  | 'Symptoms documented'
  | 'Medical necessity'
  | 'Treatment documented'
  | 'Treatment duration'
  | 'Patient progress';

type GroundTruth = Record<Requirement, boolean>;

type EvaluationCase = {
  id: number;
  note: string;
  groundTruth: GroundTruth;
};

type MetricResult = {
  predicted: boolean;
  actual: boolean;
};

function calculateMetrics(results: MetricResult[], testCaseCount: number) {
  let truePositive = 0;
  let trueNegative = 0;
  let falsePositive = 0;
  let falseNegative = 0;

  for (const result of results) {
    if (result.predicted && result.actual) {
      truePositive++;
    } else if (!result.predicted && !result.actual) {
      trueNegative++;
    } else if (result.predicted && !result.actual) {
      falsePositive++;
    } else {
      falseNegative++;
    }
  }

  const total = truePositive + trueNegative + falsePositive + falseNegative;

  const accuracy =
    total === 0 ? 0 : ((truePositive + trueNegative) / total) * 100;

  const precision =
    truePositive + falsePositive === 0
      ? 0
      : (truePositive / (truePositive + falsePositive)) * 100;

  const recall =
    truePositive + falseNegative === 0
      ? 0
      : (truePositive / (truePositive + falseNegative)) * 100;

  return {
    accuracy: Number(accuracy.toFixed(1)),
    precision: Number(precision.toFixed(1)),
    recall: Number(recall.toFixed(1)),
    testCases: testCaseCount
  };
}
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    openAIConfigured: Boolean(process.env.OPENAI_VOICE_API_KEY)
  });
});

/*
 * Create a short-lived Realtime client secret.
 *
 * The permanent OPENAI_API_KEY stays on the server.
 */
app.post('/api/realtime/session', async (_req, res) => {
  try {
    const session = await openai.realtime.clientSecrets.create({
      session: {
        type: 'realtime',
        model: 'gpt-realtime-2.1-mini',
        audio: {
          output: {
            voice: 'marin'
          }
        }
      }
    });

    res.json({
      clientSecret: session.value
    });
  } catch (error) {
    console.error('Realtime session error:', error);

    res.status(500).json({
      error: 'Unable to create Realtime session'
    });
  }
});

app.post('/api/analyze-note', async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || typeof note !== 'string') {
      return res.status(400).json({
        error: 'Clinical note is required.'
      });
    }

    const requirements = [
      'Diagnosis documented',
      'Symptoms documented',
      'Medical necessity',
      'Treatment documented',
      'Treatment duration',
      'Patient progress'
    ];

    const response = await openai.responses.create({
      model: 'gpt-6-sol',

      instructions: `
You are a clinical documentation quality analysis assistant.

Analyze ONLY the information explicitly documented in the clinical note.

Do NOT:
- provide medical advice
- diagnose the patient
- infer missing information
- assume information that is not explicitly documented

For EACH of the six requirements, return exactly one finding.

Each finding must contain:

1. requirement
   The exact requirement name from the provided list.

2. status
   - PASS = the information is clearly and explicitly documented
   - REVIEW = the information is partially documented or ambiguous
   - FAIL = the information is not documented

3. value
   The ACTUAL clinical information explicitly found in the note.

   Examples:
   - Symptoms documented -> "Headache and dizziness"
   - Treatment documented -> "Physiotherapy twice weekly"
   - Treatment duration -> "6 weeks"
   - Patient progress -> "Pain has improved by approximately 30%"
   - Medical necessity -> "Continued physiotherapy is required to improve mobility"

   If the information is NOT documented, value MUST be an empty string "".

   IMPORTANT:
   Never put phrases such as:
   "No diagnosis documented"
   "Not mentioned"
   "Not provided"
   into the value field.

4. confidence
   A number between 0 and 1 representing confidence that the finding is supported by the note.

5. explanation
   Briefly explain why the requirement is PASS, REVIEW, or FAIL.

IMPORTANT RULES:

Diagnosis documented:
- Only mark PASS if an actual diagnosis/clinical condition is explicitly documented.
- A symptom is NOT automatically a diagnosis.
- For example, "headache" is a symptom and should normally appear under Symptoms documented, not Diagnosis documented.
- Do not invent a diagnosis from symptoms.

Symptoms documented:
- Extract any symptoms, complaints, signs, injuries, or patient-reported problems explicitly described in the note.
- Do NOT require the word "symptom" to be present.
- A physical complaint, injury, pain, swelling, or functional problem counts as documented symptom/sign information.
- Examples:
  - "headache" → symptom
  - "dizziness" → symptom
  - "my hand hurts" → symptom
  - "pain in my hand" → symptom
  - "bruised hand" → injury/sign
  - "swelling in the ankle" → symptom/sign
  - "difficulty walking" → functional problem
  - "I fell down and bruised my hand" → injury/sign information
- Extract the actual information from the note.
- If no symptom, complaint, sign, injury, or patient-reported problem is documented, mark FAIL.

Medical necessity:
- Only mark PASS if the note explicitly explains why treatment, therapy, investigation, or intervention is required.
- Do not infer medical necessity.

Treatment documented:
- Extract the actual treatment/intervention explicitly documented.

Treatment duration:
- Extract the actual duration, frequency, timeframe, or number of sessions if explicitly documented.
- Examples: "6 weeks", "twice weekly", "10 sessions".
- Do not infer duration.

Patient progress:
- Extract the actual documented response, improvement, deterioration, or lack of progress.
- Do not infer progress.

Return exactly these six requirements:
${requirements.map((item) => `- ${item}`).join('\n')}
      `,

      input: `
Clinical Note:

${note}
      `,

      text: {
        format: {
          type: 'json_schema',
          name: 'clinical_documentation_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              findings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    requirement: {
                      type: 'string'
                    },
                    status: {
                      type: 'string',
                      enum: ['PASS', 'REVIEW', 'FAIL']
                    },
                    value: {
                      type: 'string'
                    },
                    confidence: {
                      type: 'number'
                    },
                    explanation: {
                      type: 'string'
                    }
                  },
                  required: [
                    'requirement',
                    'status',
                    'value',
                    'confidence',
                    'explanation'
                  ],
                  additionalProperties: false
                }
              }
            },
            required: ['findings'],
            additionalProperties: false
          }
        }
      }
    });

    const analysis = JSON.parse(response.output_text);

    res.json(analysis);
  } catch (error) {
    console.error('Clinical note analysis error:', error);

    res.status(500).json({
      error: 'Unable to analyze clinical note.'
    });
  }
});

app.post('/api/evaluate', async (req, res) => {
  try {
    const results = [];

    for (const testCase of evaluationCases) {
      const response = await openai.responses.create({
        model: 'gpt-6-sol',

        instructions: `
You are a clinical documentation quality analysis assistant.

Analyze ONLY information explicitly documented in the clinical note.

For each of these requirements return whether it is documented:

- Diagnosis documented
- Symptoms documented
- Medical necessity
- Treatment documented
- Treatment duration
- Patient progress

Return PASS when explicitly documented.
Return FAIL when not documented.
Return REVIEW when partially documented or ambiguous.

Do not infer missing information.
Do not provide medical advice.
`,

        input: `
Clinical Note:

${testCase.note}
        `,

        text: {
          format: {
            type: 'json_schema',
            name: 'clinical_evaluation',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                findings: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      requirement: {
                        type: 'string'
                      },
                      status: {
                        type: 'string',
                        enum: ['PASS', 'REVIEW', 'FAIL']
                      }
                    },
                    required: ['requirement', 'status'],
                    additionalProperties: false
                  }
                }
              },
              required: ['findings'],
              additionalProperties: false
            }
          }
        }
      });

      const analysis = JSON.parse(response.output_text);

      for (const finding of analysis.findings) {
        const predicted = finding.status === 'PASS';

        //const actual = testCase.groundTruth[finding.requirement] === true;
        const actual =
          testCase.groundTruth[finding.requirement as Requirement] === true;

        results.push({
          predicted,
          actual
        });
      }
    }

    const evaluation = calculateMetrics(results, evaluationCases.length);

    res.json(evaluation);
  } catch (error) {
    console.error('Evaluation error:', error);

    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Unable to evaluate model.'
    });
  }
});

app.post('/api/extract-clinical-info', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({
        error: 'Transcript is required.'
      });
    }

    const response = await openai.responses.create({
      model: 'gpt-6-sol',

      instructions: `
Extract the primary clinical condition or chief complaint
from the clinician's transcript.

Do not invent information.
Only use information explicitly present in the transcript.

If no condition is identifiable, return an empty string.
      `,

      input: transcript,

      text: {
        format: {
          type: 'json_schema',
          name: 'clinical_info',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              diagnosis: {
                type: 'string'
              }
            },
            required: ['diagnosis'],
            additionalProperties: false
          }
        }
      }
    });

    console.log('===== GPT-6 SOL OUTPUT =====');
    console.log(response.output_text);
    console.log('============================');

    const result = JSON.parse(response.output_text);

    res.json(result);
  } catch (error) {
    console.error('Clinical extraction error:', error);

    res.status(500).json({
      error: 'Unable to extract clinical information.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
