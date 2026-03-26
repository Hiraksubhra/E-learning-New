
document.addEventListener('DOMContentLoaded', () => {
    const moreButtons = document.querySelectorAll('.view-more-btn');
    const modal = document.getElementById('courseModal');
    const closeBtn = document.querySelector('.close-btn');

    // Modal elements to populate
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalDiff = document.getElementById('modalDiff');
    const modalDur = document.getElementById('modalDur');
    const modalInst = document.getElementById('modalInst');

    // Listen for clicks on any "MORE" button
    moreButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevents the page from scrolling to the top

            // Extract data from the clicked button
            modalImg.src = button.getAttribute('data-img');
            modalTitle.textContent = button.getAttribute('data-title');
            modalDesc.textContent = button.getAttribute('data-desc');
            modalDiff.textContent = button.getAttribute('data-difficulty');
            modalDur.textContent = button.getAttribute('data-duration');
            modalInst.textContent = button.getAttribute('data-instructor');

            // Trigger the modal display
            modal.classList.add('active');
        });
    });

    // Close modal when 'X' is clicked
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Close modal when clicking the dark background overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});
