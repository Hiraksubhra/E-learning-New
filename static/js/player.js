const player = document.getElementById('mainPlayer');
const lessonTitle = document.getElementById('lessonTitle');
const lessonDesc = document.getElementById('lessonDescription');
const lessonDuration = document.getElementById('lessonDuration');
const playlistContainer = document.getElementById('playlistContainer');
const courseTitle = document.getElementById('courseTitle');
const instructorName = document.getElementById('instructorName');

// Helper function to extract YouTube ID from a full URL
function extractYouTubeID(url) {
    if (!url) return '';
    // If it's already an 11-character ID, return it
    if (url.length === 11 && !url.includes('/')) return url;
    // Otherwise, parse the URL to extract the ID
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    return (match && match[1]) ? match[1] : '';
}

// Initialize Player
function initPlayer() {
    // Check if courseData actually has modules inside it
    if (courseData && courseData.modules && courseData.modules.length > 0) {
        courseTitle.innerText = courseData.title;
        instructorName.innerText = courseData.instructor;
        
        renderPlaylist();
        
        // Auto-load the first lesson of the first module
        if(courseData.modules[0].lessons && courseData.modules[0].lessons.length > 0) {
            loadLesson(courseData.modules[0].lessons[0]);
           
            const firstLessonItem = document.querySelector('.lesson-item');
            if (firstLessonItem) {
                firstLessonItem.classList.add('active');
            }
        }
    } else {
        playlistContainer.innerHTML = '<p style="padding: 20px; color: #666; text-align: center;">No lesson content available yet.</p>';
    }
}

// Render the Sidebar (Modules & Lessons)
function renderPlaylist() {
    playlistContainer.innerHTML = '';

    courseData.modules.forEach((module, index) => {
        // We'll keep the first module open by default, others collapsed
        const isFirstModule = index === 0;

        const modDiv = document.createElement('div');
        modDiv.className = `module-header ${isFirstModule ? '' : 'collapsed'}`;
        modDiv.innerHTML = `
            <span>${module.title}</span>
            <i class="fa-solid fa-chevron-down"></i>
        `;
        playlistContainer.appendChild(modDiv);

        const ul = document.createElement('ul');
        ul.className = `lesson-list ${isFirstModule ? '' : 'collapsed'}`;

        // Toggle functionality
        modDiv.addEventListener('click', () => {
            modDiv.classList.toggle('collapsed');
            ul.classList.toggle('collapsed');
        });

        if (module.lessons) {
            module.lessons.forEach((lesson) => {
                const li = document.createElement('li');
                li.className = 'lesson-item';
                
                // Click Event to Switch Video
                li.onclick = () => {
                    document.querySelectorAll('.lesson-item').forEach(i => i.classList.remove('active'));
                    li.classList.add('active');
                    loadLesson(lesson);
                };

                li.innerHTML = `
                    <i class="fa-regular fa-circle-play status-icon"></i>
                    <div class="lesson-info">
                        <h4>${lesson.title}</h4>
                        <span><i class="fa-regular fa-clock"></i> ${lesson.duration || '--:--'}</span>
                    </div>
                `;
                ul.appendChild(li);
            });
        }
        playlistContainer.appendChild(ul);
    });
}

function loadLesson(lesson) {
    console.log("Raw Lesson Object received:", lesson);

    let rawUrl = lesson.video_url; 
    console.log("Target URL string:", rawUrl);
    
    let videoId = extractYouTubeID(rawUrl);
    console.log("Extracted Video ID:", videoId);

    // SAFETY CHECK: Prevent the iframe from crashing if the ID is missing
    if (!videoId || videoId === "") {
        console.error("Video ID is empty. The regex failed or the database URL is missing/malformed.");
        lessonTitle.innerText = "Error Loading Video";
        lessonDesc.innerText = `Could not extract YouTube ID from: ${rawUrl}`;
        return; // Stop execution before we crash the iframe
    }

    player.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    
    lessonTitle.innerText = lesson.title || "Untitled Lesson";
    lessonDesc.innerText = lesson.content || "No description available for this lesson.";
    lessonDuration.innerText = lesson.duration || "--:--";
}

// Start the player
initPlayer();