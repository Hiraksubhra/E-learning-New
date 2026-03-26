// --- GLOBAL VARIABLES ---
let currentQuizData = null;
let currentQuestionIndex = 0;
let score = 0;
let activeCardId = null; 
let questionTimer;

// Store quiz data safely
const quizStore = {}; 


// Generate Lesson
async function generateLesson() {
    const input = document.getElementById('videoUrlInput');
    const topic = input.value;
    
    // Fetch the user's setting
    const savedDifficulty = localStorage.getItem('quiz_difficulty') || 'auto';
    
    if (!topic) {
        alert("Please enter a topic.");
        return;
    }

    const overlay = document.getElementById('ai-overlay');
    const loadingText = overlay.querySelector('p');
    
    // Dynamic loading text based on difficulty
    if (savedDifficulty === 'advanced') {
        loadingText.innerText = "Crafting complex scenarios • Generating tricky distractors...";
    } else if (savedDifficulty === 'beginner') {
        loadingText.innerText = "Gathering fundamental concepts • Simplifying terms...";
    } else {
        loadingText.innerText = "Analyzing your skill level • Generating custom quiz...";
    }

    overlay.classList.remove('hidden');

    console.log("Sending difficulty to backend:", savedDifficulty);
    try { 
        const response = await fetch('http://127.0.0.1:8000/api/generate-quiz/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': CSRF_TOKEN
            },
            // Send the difficulty to backend
            body: JSON.stringify({ topic: topic, difficulty: savedDifficulty })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (response.ok) {
            addQuizCardToGrid(data);
            input.value = ''; 
        } else {
            alert("Error: " + (data.error || "Failed to generate"));
        }

    } catch (error) {
        console.error("API Error:", error);
        alert("Could not connect to backend.");
    } finally {
        overlay.classList.add('hidden');
    }
}

// Add Card to Dashboard
function addQuizCardToGrid(data) {
    const grid = document.getElementById('courseGrid');
    const uniqueStoreId = 'quiz_' + Date.now();
    const uniqueCardId = 'card_' + Date.now();
    
    quizStore[uniqueStoreId] = data;

    // Capitalize the first letter of the difficulty for a clean UI
    const diffLevel = data.difficulty_used 
        ? data.difficulty_used.charAt(0).toUpperCase() + data.difficulty_used.slice(1) 
        : "Auto";

    const newCardHTML = `
        <div class="thumbnail">
            <img src="https://placehold.co/400x250/6C63FF/ffffff?text=${encodeURIComponent(data.title)}" alt="Thumb">
            <span class="badge">New AI Quiz</span>
            <span class="badge" style="top: 35px; background: #1D2939; color: white;">Level: ${diffLevel}</span>
        </div>
        <div class="card-body">
            <h4>${data.title}</h4>
            <p>${data.questions.length} Questions • Difficulty: ${diffLevel}</p>
            <div class="progress-container">
                <div class="progress-bar"><div class="fill" style="width: 0%"></div></div>
                <span class="progress-text">0%</span>
            </div>
            <button class="btn-sm quiz-btn" style="background: var(--primary); color: white;" 
                onclick="loadQuizFromStore('${uniqueStoreId}', '${uniqueCardId}')">
                Start Quiz
            </button>
        </div>
    `;

    const newCardDiv = document.createElement('div');
    newCardDiv.className = 'course-card';
    newCardDiv.id = uniqueCardId;
    newCardDiv.innerHTML = newCardHTML;
    grid.insertBefore(newCardDiv, grid.firstChild);
}

// Load Quiz
function loadQuizFromStore(storeId, cardId) {
    const data = quizStore[storeId];
    if (data) {
        activeCardId = cardId; 
        startQuiz(data);
    } else {
        console.error("Quiz data not found for ID:", storeId);
    }
}

// Start Quiz
function startQuiz(quizData) {
    currentQuizData = quizData;
    currentQuestionIndex = 0;
    score = 0;
    
    const modal = document.getElementById('quiz-modal');
    modal.classList.remove('hidden');
    document.getElementById('quiz-title').innerText = quizData.title;
    
    renderQuestion();
}

function renderQuestion() {
    clearTimeout(questionTimer);

    const question = currentQuizData.questions[currentQuestionIndex];
    document.getElementById('question-text').innerText = question.text;
    document.getElementById('quiz-progress').innerText = `Question ${currentQuestionIndex + 1} of ${currentQuizData.questions.length}`;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    question.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(index, question.correct_index, btn);
        optionsContainer.appendChild(btn);
    });

    questionTimer = setTimeout(() => {
        // Logic for when time runs out
        goToNextQuestion(); 
    }, 20000);
}

function checkAnswer(selectedIndex, correctIndex, btnElement) {
    clearTimeout(questionTimer);

    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);

    if (selectedIndex === correctIndex) {
        btnElement.classList.add('correct');
        score++;
    } else {
        btnElement.classList.add('wrong');
        allBtns[correctIndex].classList.add('correct');
    }

    setTimeout(() => {
        goToNextQuestion();
    }, 1000); 
}

function goToNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuizData.questions.length) {
        renderQuestion();
    } else {
        finishQuiz();
    }
}



// Finish Quiz with MongoDB Save
async function finishQuiz() {
    const container = document.getElementById('quiz-body');
    const totalQuestions = currentQuizData.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    //SAVE TO DATABASE
    try {
        await fetch('http://127.0.0.1:8000/api/save-result/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: currentQuizData.title,
                score: score,
                total_questions: totalQuestions,
                percentage: percentage
            })
        });
        console.log("Quiz saved to MongoDB");
    } catch (error) {
        console.error("Failed to save result:", error);
    }

    //UPDATE DASHBOARD CARD
    if (activeCardId) {
        const card = document.getElementById(activeCardId);
        if (card) {
            const fillBar = card.querySelector('.fill');
            fillBar.style.width = `${percentage}%`;
            if(percentage >= 70) fillBar.style.backgroundColor = '#2ecc71';
            
            card.querySelector('.progress-text').innerText = `${percentage}%`;

            const btn = card.querySelector('.quiz-btn'); 
            if (btn) {
                const scoreBadge = document.createElement('div');
                scoreBadge.innerText = `Completed: ${score}/${totalQuestions}`;
                scoreBadge.style.marginTop = '10px';
                scoreBadge.style.fontWeight = 'bold';
                scoreBadge.style.padding = '8px';
                scoreBadge.style.textAlign = 'center';
                scoreBadge.style.borderRadius = '6px';
                scoreBadge.style.backgroundColor = percentage >= 70 ? '#d4edda' : '#fff3cd';
                scoreBadge.style.color = percentage >= 70 ? '#155724' : '#856404';
                
                btn.replaceWith(scoreBadge);
            }
        }
    }

    // MODAL SUMMARY
    container.innerHTML = `
        <div style="text-align:center; padding: 20px;">
            <h2>🎉 Quiz Completed!</h2>
            <p style="font-size: 1.2rem; margin: 10px 0;">Your Score: <strong>${score} / ${totalQuestions}</strong></p>
            <p style="color: #666; font-size: 1.5rem; font-weight:bold;">${percentage}%</p>
            <div style="margin-top: 20px;">
                <button class="btn-sm" onclick="closeQuiz()">Close</button>
                </div>
        </div>
    `;
    document.getElementById('quiz-progress').innerText = "Result Saved to Database";
}

function closeQuiz() {
    document.getElementById('quiz-modal').classList.add('hidden');
    setTimeout(() => {
        document.getElementById('quiz-body').innerHTML = `
            <h4 id="question-text"></h4>
            <div class="options-grid" id="options-container"></div>
        `;
    }, 500);
}

// History Function
async function openHistory() {
    const modal = document.getElementById('quiz-modal');
    const container = document.getElementById('quiz-body');
    const title = document.getElementById('quiz-title');
    const progress = document.getElementById('quiz-progress');

    //Open the modal
    modal.classList.remove('hidden');
    title.innerText = "📚 Past Quiz Results";
    progress.innerText = ""; // Clear progress text
    
    //Show loading state
    container.innerHTML = `<div style="text-align:center; padding:20px;"><p>Loading your history...</p></div>`;

    //Fetch Data
    try {
        const response = await fetch('http://127.0.0.1:8000/api/history/');
        const historyData = await response.json();

        if (historyData.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:20px;"><p>No quizzes taken yet!</p><button class="btn-sm" onclick="closeQuiz()">Close</button></div>`;
            return;
        }

        //Build Table
        let historyHTML = `
            <div style="max-height: 400px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; margin-top:10px;">
                    <thead style="background: #f4f4f4; position: sticky; top: 0;">
                        <tr>
                            <th style="padding: 12px; text-align: left;">Topic</th>
                            <th style="padding: 12px; text-align: center;">Score</th>
                            <th style="padding: 12px; text-align: right;">Date</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        historyData.forEach(item => {
            const dateObj = new Date(item.date_taken);
            const dateStr = dateObj.toLocaleDateString();
            
            // Color coding the score
            const scoreColor = item.percentage >= 70 ? '#2ecc71' : '#e74c3c';

            historyHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px;">${item.topic}</td>
                    <td style="padding: 12px; text-align: center; font-weight:bold; color:${scoreColor}">
                        ${item.percentage}%
                    </td>
                    <td style="padding: 12px; text-align: right; font-size: 0.85rem; color: #666;">
                        ${dateStr}
                    </td>
                </tr>
            `;
        });

        historyHTML += `
                    </tbody>
                </table>
            </div>
            <div style="text-align:center; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
                <button class="btn-sm" onclick="closeQuiz()">Close History</button>
            </div>
        `;

        container.innerHTML = historyHTML;

    } catch (error) {
        console.error("History Error:", error);
        container.innerHTML = `<p style="color:red; text-align:center; padding:20px;">Failed to load history.</p>`;
    }
}