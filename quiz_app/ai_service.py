from google import genai
from google.genai import types
import json
import os
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("GEMINI_API_KEY")
print("\n" + "="*30)
print(f"DEBUG: Key Starts With : {str(api_key)[:10]}")
print(f"DEBUG: Key Ends With   : {str(api_key)[-5:]}")
print(f"DEBUG: Key Length      : {len(str(api_key))}")
print("="*30 + "\n")

# Initialize the NEW client
client = genai.Client(api_key=api_key)

def generate_quiz_json(topic, difficulty):
    # Map the difficulty to specific prompting instructions so the AI knows exactly what it means
    difficulty_instructions = {
        "beginner": "Focus on high-level concepts, basic definitions, and introductory knowledge. Use simple language.",
        "intermediate": "Focus on application, analysis, and standard problem-solving. Assume the user has a working knowledge of the topic.",
        "advanced": "Focus on edge cases, complex multi-step scenarios, highly technical nuances, and expert-level synthesis."
    }

    instruction = difficulty_instructions.get(difficulty, difficulty_instructions["beginner"])

    prompt = f"""
        Generate a JSON quiz with 5 questions about the topic: {topic}.
        
        CRITICAL DIFFICULTY INSTRUCTION: The target difficulty is {difficulty.upper()}. 
        {instruction}
        
        Ensure the distractors (wrong answers) match this difficulty level. For advanced quizzes, the wrong answers should be common misconceptions, not obvious throwaways.
        
        CRITICAL RANDOMIZATION INSTRUCTION: You MUST randomize the position of the correct answer for every question. Do NOT always put the correct answer first. The `correct_index` must be an integer between 0 and 3, accurately reflecting the randomized position of the correct option in the array.
        
        Output valid JSON using this exact schema:
        {{
            "title": "A short, catchy title for the quiz",
            "questions": [
                {{
                    "id": 1,
                    "text": "The question text",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_index": 0 
                }}
            ]
        }}
        """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        
        quiz_data = json.loads(response.text)
        return quiz_data

    except Exception as e:
        print(f"Error generating quiz with Gemini: {e}")
        return None


def get_text_embedding(text):
    """Translates a text string into a mathematical vector."""
    try:
        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
        )
        return result.embeddings[0].values
    except Exception as e:
        print(f"Error generating embedding for '{text}': {e}")
        return None

def ask_video_context(question, context):
    """Answers a user's question strictly based on the provided video transcript."""
    try:
        # If the video has no transcript in the database, handle it gracefully
        if not context or context.strip() == "":
            context = "No transcript available for this video."

        prompt = f"""
        You are a friendly, encouraging AI Study Buddy for an e-learning platform. 
        Your job is to help the student understand the current video lesson.
        
        CRITICAL RULE: Answer the student's question using ONLY the information found in the TRANSCRIPT below. 
        If the answer cannot be found in the transcript, do not make things up. Instead, politely say: 
        "I'm sorry, but the instructor doesn't seem to cover that specific detail in this video."
        
        TRANSCRIPT:
        {context}
        
        STUDENT'S QUESTION:
        {question}
        
        Keep your answer concise, easy to read, and educational.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        return response.text

    except Exception as e:
        print(f"Error generating study buddy response: {e}")
        return None