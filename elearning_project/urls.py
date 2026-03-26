from django.contrib import admin
from django.urls import path, include 

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # This line tells Django: "Send any URL starting with 'api/' to the quiz app"
    path('api/', include('quiz_app.urls')), 
]
