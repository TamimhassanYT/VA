const textElement = document.getElementById('typewriter');
const words = ["block", "gui", "item","armor"]; // Ensure no spaces inside quotes
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    if (!textElement) return;

    const currentWord = words[wordIndex];
    
    // Strict substring: No extra characters allowed
    const currentDisplay = currentWord.substring(0, charIndex);
    textElement.textContent = currentDisplay;

    let typeSpeed = isDeleting ? 75 : 150;

    if (!isDeleting && charIndex < currentWord.length) {
        charIndex++;
    } else if (isDeleting && charIndex > 0) {
        charIndex--;
    } else if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
}

document.addEventListener('DOMContentLoaded', type);