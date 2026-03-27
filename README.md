# AI-Powered E-Learning Platform 🎓🤖

A modern, intelligent e-learning platform built with Django and vanilla JavaScript. Moving beyond traditional "digital filing cabinets" for videos, this platform natively integrates Google's Gemini AI to provide semantic curriculum matching, real-time knowledge profiling, and context-aware tutoring.

🚀 Key Innovative Features
Semantic Curriculum Matching (Vector Embeddings):
Traditional platforms rely on rigid keyword tags. Our system uses the gemini-embedding-001 model to convert course transcripts and descriptions into high-dimensional mathematical vectors. By plotting both the course content and the student's knowledge state (learning_vector) in the same concept space, the platform serves personalized course recommendations using Cosine Similarity.

Context-Bounded AI "Study Buddy" (RAG Architecture):
A built-in chat widget that acts as a localized Teaching Assistant. Using Retrieval-Augmented Generation (RAG), the frontend secretly passes the exact transcript of the currently playing video to the Gemini API alongside the user's question. This forces the AI to answer strictly based on the lesson's context, eliminating AI hallucinations.

Dynamic Knowledge Profiling & Adaptive Quizzes:
Instead of static, hardcoded tests, the platform generates tailored quizzes on the fly based on the user's current competency level (Beginner, Intermediate, Advanced). Real-time quiz scores mathematically shift the student's 3D knowledge profile, creating a continuous feedback loop of their actual understanding.

Seamless Real-Time Progress Tracking:
A frictionless learning experience. As users complete videos, the vanilla JavaScript frontend syncs asynchronously with the Django backend, updating progress bars and completion checkmarks instantly without requiring page reloads.

🛠️ Tech Stack
Backend: Python, Django, Django REST Framework

AI Integration: Google Gemini API (gemini-embedding-001 and generative models)

Frontend: Vanilla JavaScript, HTML5, CSS3 (Modern Flexbox/Grid layouts)

Database: SQLite (default) / PostgreSQL (production ready)

Icons & Assets: FontAwesome

### Prerequisites
Make sure you have the following installed on your machine:
* Python 3.8+
* Git
* A Google Gemini API Key (Get one at [Google AI Studio](https://aistudio.google.com/))
