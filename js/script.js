document.addEventListener('DOMContentLoaded', function() {

    // Smooth Scrolling for Nav Links
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            let targetId = this.getAttribute('href');
            let targetElement = document.querySelector(targetId);
            let offset = document.getElementById('header').offsetHeight; // Navbar height

            if (targetElement) {
                let targetPosition = targetElement.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
            // Close mobile menu if open
            if(document.querySelector('.nav-links').classList.contains('active')) {
                document.querySelector('.nav-links').classList.remove('active');
                document.querySelector('.menu-toggle').classList.remove('active');
            }
        });
    });

    // Sticky Navbar & Active Link Highlighting
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section[id]'); // All sections with an ID
    const navbarHeight = header.offsetHeight;

    window.addEventListener('scroll', function() {
        let scrollPosition = window.scrollY;

        // Sticky behavior (optional, could also be done with CSS position: sticky if preferred)
        if (scrollPosition > navbarHeight / 2) { // A small threshold
            header.classList.add('sticky'); // You might need to define .sticky CSS if you want different styles
        } else {
            header.classList.remove('sticky');
        }

        // Active link highlighting
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - 20; // Adjusted for navbar and a little buffer
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
        // Special case for top of page / hero section
        if (scrollPosition < sections[0].offsetTop - navbarHeight - 20) {
             document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
             const homeLink = document.querySelector('.nav-links a[href="#home"]');
             if(homeLink) homeLink.classList.add('active');
        }
    });


    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active'); // For changing hamburger to close icon
    });

    // Testimonial Carousel
    let slideIndex = 0;
    const slides = document.querySelectorAll('.testimonial-slide');
    const totalSlides = slides.length;

    function showSlides() {
        if (totalSlides === 0) return;
        slides.forEach(slide => slide.classList.remove('active'));
        slideIndex++;
        if (slideIndex > totalSlides) { slideIndex = 1 }
        slides[slideIndex - 1].classList.add('active');
        // setTimeout(showSlides, 5000); // Auto-rotate every 5 seconds
    }

    // Manual controls for carousel
    window.changeSlide = function(n) {
        slideIndex += n;
        if (slideIndex > totalSlides) { slideIndex = 1; }
        if (slideIndex < 1) { slideIndex = totalSlides; }
        slides.forEach(slide => slide.classList.remove('active'));
        slides[slideIndex - 1].classList.add('active');
    }

    if (slides.length > 0) {
        slides[0].classList.add('active'); // Show first slide initially
        // setTimeout(showSlides, 5000); // Start auto-rotation if desired
    }


    // Gallery Modal
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const captionText = document.getElementById("caption");
    const spanClose = document.querySelector(".close-modal");

    window.openModal = function(imgSrc) {
        modal.style.display = "block";
        modalImg.src = imgSrc;
        // You can get alt text from the clicked image if needed for caption
        // const clickedImg = document.querySelector(`img[src="${imgSrc}"]`);
        // captionText.innerHTML = clickedImg ? clickedImg.alt : "";
    }

    window.closeModal = function() {
        modal.style.display = "none";
    }

    // Close modal when clicking outside the image
    modal.addEventListener('click', function(event) {
        if (event.target === modal) { // Check if the click is on the modal background itself
            closeModal();
        }
    });
    // Close modal with escape key
     document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && modal.style.display === "block") {
            closeModal();
        }
    });


    // Contact Form Validation & Submission (using Web3Forms)
    const form = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Basic client-side validation
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !subject || !message) {
            formStatus.textContent = 'Please fill in all fields.';
            formStatus.style.color = 'red';
            return;
        }
        if (!validateEmail(email)) {
            formStatus.textContent = 'Please enter a valid email address.';
            formStatus.style.color = 'red';
            return;
        }

        const formData = new FormData(form);
        const object = {};
        formData.forEach((value, key) => {
            object[key] = value;
        });
        // Add access key if it's not in a hidden field (though it is in the HTML)
        // object.access_key = "9521d260-54a3-4a9a-82d0-0e41e743d144"; // Redundant if using hidden input

        // For Honeypot (botcheck)
        if (document.getElementById('botcheck').checked) {
            formStatus.textContent = 'Bot submission detected.';
            formStatus.style.color = 'red';
            return; // Or handle as spam
        }


        formStatus.textContent = 'Sending...';
        formStatus.style.color = 'var(--text-color-dark)';

        // Web3Forms submission
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(object)
        })
        .then(async (response) => {
            let json = await response.json();
            if (response.status == 200) {
                formStatus.textContent = json.message || "Form submitted successfully!";
                formStatus.style.color = 'green';
                form.reset();
            } else {
                console.log(response);
                formStatus.textContent = json.message || "Something went wrong!";
                formStatus.style.color = 'red';
            }
        })
        .catch(error => {
            console.log(error);
            formStatus.textContent = "Something went wrong!";
            formStatus.style.color = 'red';
        })
        .finally(() => {
            setTimeout(() => {
                formStatus.textContent = '';
            }, 5000); // Clear status message after 5 seconds
        });
    });

    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // Footer: Update Copyright Year
    document.getElementById('currentYear').textContent = new Date().getFullYear();

});
