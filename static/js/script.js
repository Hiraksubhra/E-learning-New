// STATE MANAGEMENT
let currentLessonData = null;
let userAnswers = {};

// --- NAVIGATION FUNCTIONS ---

function startLearning() {
    const url = document.getElementById('urlInput').value;
    if (!url) {
        alert("Please paste a valid YouTube URL!");
        return;
    }

    // Switch to Loading View
    document.getElementById('view-landing').classList.add('hidden');
    document.getElementById('view-landing').classList.remove('active-view');
    document.getElementById('view-loading').classList.remove('hidden');
    document.getElementById('view-loading').classList.add('active-view');

    // Simulate API Call (Replace this with actual fetch() later)
    // fetchLessonFromPython(url); 
    simulateBackendDelay(); 
}

function goHome() {
    location.reload(); // Simple reload to reset state
}

function switchTab(tabName) {
    // Update Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update Content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
}

// --- LOGIC FUNCTIONS ---

// Mocking the Python Backend for Testing
function simulateBackendDelay() {
    setTimeout(() => {
        const mockData = {
            title: "Introduction to Black Holes",
            summary: "A black hole is a region of spacetime where gravity is so strong that nothing - no particles or even electromagnetic radiation such as light - can escape from it. The theory of general relativity predicts that a sufficiently compact mass can deform spacetime to form a black hole.",
            quiz: [
                {
                    question: "What can escape a black hole?",
                    options: ["Light", "Radio Waves", "Nothing", "Sound"],
                    correct: 2 // Index of correct answer
                },
                {
                    question: "Which theory predicts black holes?",
                    options: ["Quantum Mechanics", "General Relativity", "String Theory", "Newtonian Gravity"],
                    correct: 1
                }
            ]
        };
        renderLesson(mockData);
    }, 2500); // 2.5 second simulated delay
}

/* // REAL API FUNCTION (Uncomment when Python is ready)
async function fetchLessonFromPython(url) {
    try {
        const response = await fetch('http://127.0.0.1:8000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_url: url })
        });
        const data = await response.json();
        renderLesson(data);
    } catch (error) {
        alert("Error connecting to AI Server!");
        goHome();
    }
}
*/

function renderLesson(data) {
    currentLessonData = data;

    // 1. Hide Loading, Show Dashboard
    document.getElementById('view-loading').classList.add('hidden');
    document.getElementById('view-loading').classList.remove('active-view');
    document.getElementById('view-dashboard').classList.remove('hidden');
    document.getElementById('view-dashboard').classList.add('active-view');

    // 2. Populate Content
    document.getElementById('topicTitle').innerText = data.title;
    document.getElementById('summaryText').innerText = data.summary;

    // 3. Build Quiz
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = ''; // Clear previous

    data.quiz.forEach((q, index) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'quiz-item';
        
        let optionsHtml = '';
        q.options.forEach((opt, i) => {
            optionsHtml += `<div class="option" onclick="selectOption(${index}, ${i}, this)">${opt}</div>`;
        });

        qDiv.innerHTML = `
            <h4>${index + 1}. ${q.question}</h4>
            <div class="options-group" id="q-${index}">
                ${optionsHtml}
            </div>
        `;
        quizContainer.appendChild(qDiv);
    });
}

// --- QUIZ INTERACTION ---

function selectOption(questionIndex, optionIndex, element) {
    // Store answer
    userAnswers[questionIndex] = optionIndex;

    // Visual Feedback (Radio button behavior)
    const group = document.getElementById(`q-${questionIndex}`);
    group.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
}

function submitQuiz() {
    let score = 0;
    const total = currentLessonData.quiz.length;

    currentLessonData.quiz.forEach((q, index) => {
        const group = document.getElementById(`q-${index}`);
        const selected = userAnswers[index];
        const correct = q.correct;

        // Clear previous styling
        group.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('correct', 'wrong');
        });

        // Highlight results
        const options = group.querySelectorAll('.option');
        
        if (selected === correct) {
            score++;
            if(selected !== undefined) options[selected].classList.add('correct');
        } else {
            if(selected !== undefined) options[selected].classList.add('wrong');
            options[correct].classList.add('correct'); // Show correct answer
        }
    });

    document.getElementById('scoreDisplay').innerText = `Score: ${score}/${total}`;
    window.scrollTo(0,0);
}