import numpy as np
from .models import StudentProfile, Module, Lesson, QuizResult
from .ai_service import get_text_embedding

def calculate_cosine_similarity(vec1, vec2):
    """Calculates the mathematical angle between two vectors."""
    if not vec1 or not vec2:
        return 0.0
    
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    
    dot_product = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
        
    return dot_product / (norm_v1 * norm_v2)

def update_learning_vector(user, topic, percentage):
    """Blends the user's latest quiz performance into their overall learning vector."""
    profile, created = StudentProfile.objects.get_or_create(user=user)
    
    topic_vector_raw = get_text_embedding(topic)
    if not topic_vector_raw:
        return 
        
    v_topic = np.array(topic_vector_raw)
    score_weight = percentage / 100.0 
    
    if not profile.learning_vector:
        new_vector = v_topic * score_weight
    else:
        v_old = np.array(profile.learning_vector)
        alpha = 0.8
        new_vector = (v_old * alpha) + (v_topic * score_weight * (1 - alpha))
        
    norm = np.linalg.norm(new_vector)
    if norm > 0:
        new_vector = new_vector / norm
        
    profile.learning_vector = new_vector.tolist()
    profile.save()

def mark_lesson_complete(user, lesson_id):
    """Marks a specific lesson ID as completed in the user's profile."""
    profile = StudentProfile.objects.get(user=user)
    
    if profile.completed_lessons is None:
        profile.completed_lessons = []
        
    if lesson_id not in profile.completed_lessons:
        profile.completed_lessons.append(lesson_id)
        profile.save()

def get_course_progress(user, course):
    """Calculates the percentage of the course a user has completed."""
    if not user.is_authenticated:
        return 0

    module_ids = list(Module.objects.filter(course=course).values_list('id', flat=True))
    lesson_ids = list(Lesson.objects.filter(module_id__in=module_ids).values_list('id', flat=True))
    
    total_lessons = len(lesson_ids)
    if total_lessons == 0:
        return 0 

    try:
        profile = StudentProfile.objects.get(user=user)
        user_completed = profile.completed_lessons or [] 
    except StudentProfile.DoesNotExist:
        return 0

    completed_count = sum(1 for lesson_id in lesson_ids if lesson_id in user_completed)
    return int((completed_count / total_lessons) * 100)

def calculate_dynamic_difficulty(user, topic):
    """Calculates appropriate difficulty based on user's last 3 quizzes in this topic."""
    recent_quizzes = QuizResult.objects.filter(user=user, topic=topic).order_by('-date_taken')[:3]
    
    if not recent_quizzes:
        return "beginner"
        
    total_percentage = sum(quiz.percentage for quiz in recent_quizzes)
    avg_percentage = total_percentage / len(recent_quizzes)
    
    if avg_percentage >= 80:
        return "advanced"
    elif avg_percentage >= 50:
        return "intermediate"
    else:
        return "beginner"