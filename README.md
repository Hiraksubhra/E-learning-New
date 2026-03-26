# AI-Powered E-Learning Platform 🎓🤖

An intelligent Learning Management System (LMS) built with Django that leverages Google's Gemini AI to dynamically generate quizzes, track student knowledge states, and provide personalized course recommendations using semantic embeddings.

## ✨ Key Features

* **AI Quiz Generation:** Instantly generate custom 5-question quizzes on any topic using the `gemini-2.5-flash` model.
* **Dynamic Difficulty Adjustment (DDA):** Quizzes automatically scale in difficulty (Beginner, Intermediate, Advanced) based on the user's past performance in that specific topic, or can be manually overridden via user settings.
* **Vector-Based Recommendations:** Uses `gemini-embedding-001` to map both course content and user knowledge into mathematical vectors. The dashboard calculates Cosine Similarity to recommend the top 4 courses best suited to the user's current learning state.
* **Progress Tracking:** Tracks completed video lessons and visualizes course completion percentages on the dashboard.
* **Quiz History:** Saves detailed quiz results to a MongoDB database, allowing users to review their past scores and performance over time.
* **Custom User Profiles:** Extends the default Django User model to store complex AI-specific data (like the `learning_vector` array) without needing a custom user model.

## 🛠️ Tech Stack

* **Backend:** Python, Django, Django REST Framework (DRF)
* **Database:** MongoDB (via Djongo/NoSQL adapter) & SQLite (Default Django)
* **AI Integration:** Google GenAI SDK (Gemini API)
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (Fetch API, LocalStorage)
* **Math/Calculations:** NumPy (for vector operations)

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
* Python 3.8+
* Git
* A Google Gemini API Key (Get one at [Google AI Studio](https://aistudio.google.com/))
