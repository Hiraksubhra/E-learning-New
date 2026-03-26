from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from rest_framework import status
from django.shortcuts import render, get_object_or_404, redirect
import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.views.decorators.cache import never_cache

from .models import AIQuiz, Course, StudentProfile, QuizResult
from .ai_service import generate_quiz_json, ask_video_context

from .utils import (
    calculate_cosine_similarity,
    update_learning_vector,
    get_course_progress,
    calculate_dynamic_difficulty
)

@method_decorator(csrf_exempt, name='dispatch')
class GenerateQuizView(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        topic = request.data.get('topic')
        requested_difficulty = request.data.get('difficulty', 'auto').lower() 

        if not topic:
            return Response({"error": "Topic is required"}, status=400)

        if requested_difficulty == 'auto':
            target_difficulty = calculate_dynamic_difficulty(request.user, topic)
        else:
            valid_difficulties = ['beginner', 'intermediate', 'advanced']
            target_difficulty = requested_difficulty if requested_difficulty in valid_difficulties else 'beginner'

        data = generate_quiz_json(topic, target_difficulty) 
        
        if not data:
             return Response({"error": "AI failed"}, status=500)

        quiz = AIQuiz.objects.create(
            user=request.user,
            title=data['title'], 
            topic=topic, 
            quiz_data=data
        )
        
        return Response({
            "quiz_id": quiz.id,
            "title": quiz.title,
            "difficulty_used": target_difficulty, 
            "questions": data['questions']
        }, status=201)

@method_decorator(csrf_exempt, name='dispatch')
class AskBuddyView(APIView):
    # Only allow logged-in users to use the AI
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        question = request.data.get('question')
        context = request.data.get('context')

        if not question:
            return Response({"error": "Question is required"}, status=400)

        # Call the new AI function
        answer = ask_video_context(question, context)

        if not answer:
            return Response({"error": "AI failed to generate a response."}, status=500)

        return Response({"answer": answer}, status=200)
    
@login_required(login_url='login_page')
def dashboard(request):
    user_profile, created = StudentProfile.objects.get_or_create(user=request.user)
    user_vector = user_profile.learning_vector
    
    recommended_courses = []
    
    if not user_vector:
        recommended_courses = Course.objects.all().order_by('-id')[:4]
    else:
        courses = Course.objects.all() 
        scored_courses = []
        
        for course in courses:
            if not course.course_embedding:
                continue
                
            similarity = calculate_cosine_similarity(user_vector, course.course_embedding)
            scored_courses.append((similarity, course))
        
        scored_courses.sort(key=lambda x: x[0], reverse=True)
        recommended_courses = [item[1] for item in scored_courses[:4]]
    
    for course in recommended_courses:
        course.progress_percentage = get_course_progress(request.user, course)
        
    context = {
        'recommended_courses': recommended_courses,
        'user_profile': user_profile,
    }
    
    return render(request, 'dashboard.html', context)

@csrf_exempt
@login_required(login_url='login_page') 
def save_quiz_result(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            topic = data.get('topic')
            percentage = data.get('percentage')
            
            result = QuizResult.objects.create(
                user=request.user,
                topic=topic,
                score=data.get('score'),
                total_questions=data.get('total_questions'),
                percentage=percentage
            )
            
            update_learning_vector(request.user, topic, percentage)
            
            return JsonResponse({'message': 'Result saved and AI Profile updated!'})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'Invalid request'}, status=400)

def get_quiz_history(request):
    results = QuizResult.objects.filter(user=request.user).order_by('-date_taken').values()
    return JsonResponse(list(results), safe=False)

@never_cache
@login_required(login_url='login_page')
def course_player(request, course_slug):
    course = get_object_or_404(
        Course.objects.prefetch_related('modules__lessons'), 
        slug=course_slug
    )

    modules_list = []
    
    for module in course.modules.all():
        lessons_list = list(module.lessons.all().values(
            'id', 'title', 'video_url', 'content', 'order', 'duration'
        ))
        
        modules_list.append({
            "id": module.id,
            "title": module.title,
            "order": module.order,
            "lessons": lessons_list 
        })

    course_data = {
        "title": course.title,
        "instructor": course.instructor,
        "description": course.description,
        "modules": modules_list, 
    }

    return render(request, 'player.html', {
        'course': course,  
        'course_data': json.dumps(course_data)
    })

from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.shortcuts import render, redirect
from django.contrib import messages

def register_page(request):
    """Renders the registration page and handles new user creation"""
    # Redirect if they are already logged in
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Log the user in immediately after successful registration
            login(request, user)
            return redirect('dashboard')
        else:
            # Pass form errors to the Django messages framework
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, error)
    else:
        form = UserCreationForm()

    return render(request, 'register.html', {'form': form})
    

def login_page(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'login.html')

def login_req(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, "Invalid username or password.")
            return redirect('login_page') 

    return redirect('login_page')

def logout_view(request):
    logout(request)
    request.session.flush()
    return redirect('index')

def index(request):
    return render(request, 'index.html')

@login_required(login_url='login_page') 
def courses_list(request):
    courses = Course.objects.all()
    
    for course in courses:
        course.progress_percentage = get_course_progress(request.user, course)
    
    return render(request, 'courses.html', {'courses': courses})

def analytics(request):
    return render(request, 'analytics.html')

def settings(request):
    return render(request, 'settings.html')

def about(request):
    return render(request, 'about.html')

def contact(request):
    return render(request, 'contact.html')

def courses_home(request):
    return render(request, 'courses_home.html')