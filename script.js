document.addEventListener('DOMContentLoaded', () => {
    const subjectSelector = document.getElementById('subject-selector');
    const sidebar = document.getElementById('sidebar');
    const contentSections = document.querySelectorAll('.content-section');
    const subjectSpan = subjectSelector.querySelector('span');
    const STORAGE_KEY = 'topicTickState';

    // --- State Management Functions ---
    function saveState() {
        const state = {};
        contentSections.forEach(section => {
            if (section.id) {
                const completedSubTopics = section.querySelectorAll('.sub-dot.done');
                const completedTexts = Array.from(completedSubTopics).map(dot => {
                    const textElement = dot.nextElementSibling;
                    return textElement ? textElement.textContent.trim() : null;
                }).filter(Boolean); // Filter out any null/empty values
                state[section.id] = completedTexts;
            }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function loadState() {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (!savedState) return;

        const state = JSON.parse(savedState);

        contentSections.forEach(section => {
            if (section.id && state[section.id]) {
                const completedTexts = state[section.id];
                const allSubDots = section.querySelectorAll('.sub-dot');

                allSubDots.forEach(dot => {
                    const textElement = dot.nextElementSibling;
                    const text = textElement ? textElement.textContent.trim() : null;
                    if (text && completedTexts.includes(text)) {
                        dot.classList.add('done');
                        dot.closest('li').classList.add('sub-topic-done');
                    }
                });
            }
        });
    }


    // Function to update the progress bar for a given content section
    function updateProgressBar(sectionElement) {
        const progressBar = sectionElement.querySelector('.progress-bar');
        const progressText = sectionElement.querySelector('.progress-text');
        // Progress is now based on all individual, checkable sub-topics
        const totalTopics = sectionElement.querySelectorAll('.sub-dot').length;
        const completedTopics = sectionElement.querySelectorAll('.sub-dot.done').length;

        if (progressBar && progressText && totalTopics > 0) {
            const percentage = (completedTopics / totalTopics) * 100;
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${Math.round(percentage)}% Analysed`;
            if (percentage === 100) {
                progressText.style.color = 'white';
            } else {
                progressText.style.color = '#333';
            }
        } else if (progressText) {
            progressText.textContent = `0% Analysed`; // Handle case with no sub-topics
            if (progressBar) progressBar.style.width = '0%';
        }
    }

    subjectSelector.addEventListener('click', (event) => {
        event.stopPropagation();
        sidebar.style.display = sidebar.style.display === 'block' ? 'none' : 'block';
    });

    sidebar.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const contentId = event.target.dataset.content;
            const subjectName = event.target.textContent;

            subjectSpan.textContent = subjectName;
            contentSections.forEach(section => {
                section.style.display = 'none';
            });

            const selectedContent = document.getElementById(contentId);
            if (selectedContent) {
                selectedContent.style.display = 'block';
                updateProgressBar(selectedContent);
            }
            
            sidebar.style.display = 'none';
        }
    });

    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !subjectSelector.contains(event.target)) {
            sidebar.style.display = 'none';
        }
    });

    // --- Logic for Toggling "Done" State on Topics & Sub-topics ---
    const contentArea = document.querySelector('.content-area');

    function updateParentTopicStatus(subTopicElement) {
        const topicItem = subTopicElement.closest('.topic-item');
        if (!topicItem) return;

        const parentContentSection = topicItem.closest('.content-section');
        const mainTopicDot = topicItem.querySelector('.dot');
        const allSubDots = topicItem.querySelectorAll('.sub-dot');
        
        if (allSubDots.length === 0) return;

        const allSubTopicsDone = Array.from(allSubDots).every(dot => dot.classList.contains('done'));

        if (allSubTopicsDone) {
            mainTopicDot.classList.add('done');
            topicItem.classList.add('topic-done');
        } else {
            mainTopicDot.classList.remove('done');
            topicItem.classList.remove('topic-done');
        }

        if (parentContentSection) {
            updateProgressBar(parentContentSection);
        }
    }

    contentArea.addEventListener('click', (event) => {
        const target = event.target;
        let stateHasChanged = false;

        // Check if a main topic dot was clicked
        if (target.classList.contains('dot')) {
            stateHasChanged = true;
            const topicItem = target.closest('.topic-item');
            const parentContentSection = target.closest('.content-section');

            if (topicItem) {
                target.classList.toggle('done');
                topicItem.classList.toggle('topic-done');

                // Toggle all sub-topics within this main topic
                const allSubDots = topicItem.querySelectorAll('.sub-dot');
                if (target.classList.contains('done')) {
                    allSubDots.forEach(subDot => {
                        subDot.classList.add('done');
                        subDot.closest('li').classList.add('sub-topic-done');
                    });
                } else {
                    allSubDots.forEach(subDot => {
                        subDot.classList.remove('done');
                        subDot.closest('li').classList.remove('sub-topic-done');
                    });
                }

                if (parentContentSection) {
                    updateProgressBar(parentContentSection);
                }
            }
        }
        // Check if a sub-topic dot was clicked
        else if (target.classList.contains('sub-dot')) {
            stateHasChanged = true;
            const subTopicItem = target.closest('li');
            if (subTopicItem) {
                target.classList.toggle('done');
                subTopicItem.classList.toggle('sub-topic-done');
                // After toggling a sub-topic, check if the parent topic should be marked as done
                updateParentTopicStatus(subTopicItem);
            }
        }

        if (stateHasChanged) {
            saveState();
        }
    });

    // --- Initial Setup ---
    loadState(); // Load the saved state from localStorage

    // Set initial visibility and update progress for all sections
    let isFirstSection = true;
    contentSections.forEach(section => {
        // Update parent topics based on loaded sub-topics
        const topicItems = section.querySelectorAll('.topic-item');
        topicItems.forEach(topic => updateParentTopicStatus(topic));
        
        // Hide all sections first
        section.style.display = 'none';
        
        // Update the progress bar for every section
        updateProgressBar(section);
    });

    // Then, show the first section that has content
    const firstSection = document.getElementById('content-49');
    if (firstSection) {
        firstSection.style.display = 'block';
    } else {
        // Fallback if content-49 is not there for some reason
        const firstVisibleSection = document.querySelector('.content-section');
        if (firstVisibleSection) firstVisibleSection.style.display = 'block';
    }
});