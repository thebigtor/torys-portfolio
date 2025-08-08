document.addEventListener("DOMContentLoaded", function () {
    const header = document.querySelector(".header-content h1");
    const paragraphs = document.querySelectorAll(".header-content p");

    // Add the animation class on load so it always animates at least once
    if (header) header.classList.add("fade-in-top");
    paragraphs.forEach(p => p.classList.add("fade-in-top"));

    function refreshAnimation(element) {
        element.classList.remove("fade-in-top");
        void element.offsetWidth; // Force reflow
        element.classList.add("fade-in-top");
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    refreshAnimation(entry.target);
                } else {
                    entry.target.classList.remove("fade-in-top");
                }
            });
        },
        { threshold: 0.5 }
    );

    if (header) observer.observe(header);
    paragraphs.forEach(p => observer.observe(p));
});