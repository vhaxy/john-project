const CONFIG = {
  scriptURL: "https://script.google.com/macros/s/your-script-id/exec",
  emailJSKey: "your-emailjs-key",
  emailJSTemplate: "template_k7g1gcm",
  emailJSService: "service_bpoo366",
};

emailjs.init(CONFIG.emailJSKey);

function loadTurnstile() {
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function handleSmoothScroll(targetId) {
  const targetElement = document.querySelector(targetId);
  if (!targetElement) return;

  const navbarHeight = document.querySelector(".navbar")?.offsetHeight || 0;
  const extraOffset = targetId === "#about" ? 435 : 20;

  let targetPosition;
  if (targetId === "#contact" && window.innerWidth <= 768) {
    targetPosition = document.body.scrollHeight - window.innerHeight;
  } else {
    targetPosition =
      targetElement.getBoundingClientRect().top +
      window.pageYOffset -
      navbarHeight -
      extraOffset;
  }

  window.scrollTo({
    top: targetPosition,
    behavior: "smooth",
  });
}

async function handleFormSubmit(form) {
  const formData = new FormData(form);
  const formLoadTime = form.dataset.loadTime;
  const honeypotValue = document.getElementById("website").value;

  if (honeypotValue || Date.now() - formLoadTime < 3000) {
    console.log("Spam detection triggered");
    return false;
  }

  try {
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const userEmail = formData.get("email");
    const phone = formData.get("phone").toString();
    const fullName = `${firstName} ${lastName}`;

    await emailjs.send(CONFIG.emailJSService, CONFIG.emailJSTemplate, {
      name: fullName,
      user_email: userEmail,
      phone: phone,
    });

    const params = new URLSearchParams();
    formData.forEach((value, key) => {
      params.append(key, value);
    });

    const response = await fetch(CONFIG.scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    showThankYouMessage();
    return true;
  } catch (error) {
    console.error("Form submission error:", error);
    alert(
      "There was an error processing your inquiry. Please try again later."
    );
    return false;
  }
}

function showThankYouMessage() {
  const formElement = document.getElementById("contactForm");
  const thankYouElement = document.getElementById("thankYouMessage");

  formElement.style.opacity = "0";
  formElement.style.transform = "translateY(-20px)";

  setTimeout(() => {
    formElement.style.display = "none";
    thankYouElement.style.display = "block";
    void thankYouElement.offsetWidth; 
    thankYouElement.classList.add("visible");
  }, 300);
}

function formatPhoneNumber(input) {
  let value = input.value.replace(/\D/g, "");
  if (value.length >= 10) {
    value = value.slice(0, 10);
    value = value.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  input.value = value;
}

function initializeAnimations() {
  const fadeElements = document.querySelectorAll(".fade");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "50px",
    }
  );
  fadeElements.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", function () {
  loadTurnstile();

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.dataset.loadTime = Date.now();

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleFormSubmit(e.target);
    });

    const phoneInput = contactForm.querySelector('input[name="phone"]');
    if (phoneInput) {
      phoneInput.addEventListener("input", (e) => formatPhoneNumber(e.target));
    }
  }

  document.querySelectorAll(".nav-links a, .bottom-nav a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      handleSmoothScroll(targetId);
      window.history.pushState(null, null, targetId);
    });
  });

  initializeAnimations();
});
