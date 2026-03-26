from django.apps import AppConfig

class QuizAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'quiz_app'
    
    # This changes the main section header in the admin panel
    verbose_name = "E-Learning Content Management"

