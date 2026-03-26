# quiz_app/management/commands/generate_embeddings.py

from django.core.management.base import BaseCommand
from quiz_app.models import Course
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize the NEW client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class Command(BaseCommand):
    help = 'Generates vector embeddings for all courses using Gemini'

    def handle(self, *args, **kwargs):
        courses = Course.objects.all()
        total_courses = courses.count()
        
        if total_courses == 0:
            self.stdout.write(self.style.WARNING("No courses found in the database."))
            return

        self.stdout.write(f"Starting embedding generation for {total_courses} courses...")

        for course in courses:
            content_to_embed = f"Title: {course.title}. Instructor: {course.instructor}. Description: {course.description}."
            
            try:
                # Call the new SDK method (We can safely use text-embedding-004 again!)
                result = client.models.embed_content(
                    model="gemini-embedding-001",
                    contents=content_to_embed,
                )
                
                # The new SDK stores the array in result.embeddings[0].values
                course.course_embedding = result.embeddings[0].values
                course.save()
                
                self.stdout.write(self.style.SUCCESS(f"Successfully embedded: {course.title}"))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to embed '{course.title}': {str(e)}"))

        self.stdout.write(self.style.SUCCESS("Embedding generation complete!"))