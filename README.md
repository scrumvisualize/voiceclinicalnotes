# Clinical Documentation AI

An AI-powered clinical documentation analysis application built with **React, TypeScript, Vite, Node.js, and OpenAI models**.

The application allows users to capture or enter clinical notes, extract clinical information, and use AI to evaluate whether important documentation requirements are present.

The project also includes an evaluation workflow using labelled test cases to calculate **Accuracy, Precision, and Recall** for the clinical-note analysis model.

---

## Overview

The application is designed to help identify whether a clinical note contains the information required for documentation quality.

The AI evaluates the following six requirements:

1. **Diagnosis documented**
2. **Symptoms documented**
3. **Medical necessity**
4. **Treatment documented**
5. **Treatment duration**
6. **Patient progress**

Each requirement is classified as:

- **PASS** – Information is clearly and explicitly documented.
- **REVIEW** – Information is partially documented or ambiguous.
- **FAIL** – Information is not documented.

The application also displays the actual clinical information extracted from the note, along with an explanation and confidence score.

---

![Clinical Documentation AI](assets/ClinAI.png)

## AI / OpenAI Models

The project uses OpenAI models for different purposes.

### Voice Experiments

**GPT-Realtime-2.1 Mini**

Used for experimenting with real-time voice interaction and voice-based clinical note capture.

The purpose is to allow spoken clinical information to be converted into a usable transcript for further analysis.

### Clinical Note Analysis

**GPT-6 Sol**

Used for clinical documentation analysis.

GPT-6 Sol processes the clinical note and determines whether each documentation requirement is present.

It returns structured information such as:

```json
{
  "requirement": "Symptoms documented",
  "status": "PASS",
  "value": "Fall with bruised hand",
  "confidence": 0.96,
  "explanation": "The patient explicitly reports falling and bruising their hand."
}
```

### High-Level Flow

```text
Voice Input
     │
     ▼
GPT-Realtime-2.1 Mini
     │
     ▼
Clinical Transcript
     │
     ▼
React Clinical Note UI
     │
     ▼
Node.js / Express API
     │
     ▼
GPT-6 Sol
     │
     ▼
Clinical Documentation Analysis
     │
     ├── Diagnosis
     ├── Symptoms / Signs
     ├── Medical Necessity
     ├── Treatment
     ├── Treatment Duration
     └── Patient Progress
     │
     ▼
AI Analysis Results
```
