from django.urls import path
from .views import GenerateQuizView, AskBuddyView
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('courses_home/', views.courses_home, name='courses_home'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('courses/', views.courses_list, name='courses'), # The list of all courses
    path('analytics/', views.analytics, name='analytics'),
    path('settings/', views.settings, name='settings'),
    path('login/', views.login_page, name='login_page'), 
    path('login/submit/', views.login_req, name='login_req'),
    path('logout/', views.logout_view, name='logout_view'),
    path('register/', views.register_page, name='register_page'),

    path('generate-quiz/', GenerateQuizView.as_view(), name='generate-quiz'),
    path('ask-buddy/', AskBuddyView.as_view(), name='ask_buddy'),
    path('save-result/', views.save_quiz_result, name='save_result'),
    path('history/', views.get_quiz_history, name='quiz_history'),
    path('course/<slug:course_slug>/', views.course_player, name='course_player'),
]