const CONFIG = {
  scriptURL:
    "https://script.google.com/macros/s/AKfycbympGhhf5nkbeGLYTkZk4u_p6OObOzgnIH-9F2ytcRi7T8Lx-mAmLeWGmRvJIR-k7Qtsw/exec",
  emailJSKey: "R0Pu4Wojwu-6Z2RMd",
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
    const turnstileToken = formData.get("turnstileToken");

    if (!turnstileToken) {
      alert("Please complete the security check before submitting.");
      return false;
    }

    await emailjs.send(CONFIG.emailJSService, CONFIG.emailJSTemplate, {
      name: fullName,
      user_email: userEmail,
      phone: phone,
    });

    const params = new URLSearchParams();
    formData.forEach((value, key) => {
      params.append(key, value);
    });

    console.log("Submitting form data to:", CONFIG.scriptURL);

    const response = await fetch(CONFIG.scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      mode: "no-cors"
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error:", response.status, errorText);
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const responseText = await response.text();
    console.log("Raw response:", responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response as JSON:", responseText);
      throw new Error("Invalid response from server");
    }

    if (result.result === "error") {
      throw new Error(result.error || "Unknown error from server");
    }

    showThankYouMessage();
    return true;
  } catch (error) {
    console.error("Form submission error:", error);
    alert(
      "There was an error processing your inquiry. Please try again later. " +
        (error.message || "Unknown error")
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

function initializeFormValidation() {
  const formFields = document.querySelectorAll(".form-control");

  formFields.forEach((field) => {
    if (field.value.trim() !== "") {
      field.parentElement.classList.add("valid");
    }

    field.addEventListener("input", function () {
      if (this.value.trim() !== "") {
        this.parentElement.classList.add("valid");
      } else {
        this.parentElement.classList.remove("valid");
      }

      if (this.type === "email") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailPattern.test(this.value)) {
          this.parentElement.classList.add("valid");
        } else {
          this.parentElement.classList.remove("valid");
        }
      }

      if (this.type === "tel") {
        const phonePattern = /^[0-9\+\-\s]+$/;
        if (phonePattern.test(this.value) && this.value.length >= 10) {
          this.parentElement.classList.add("valid");
        } else {
          this.parentElement.classList.remove("valid");
        }
      }
    });

    field.addEventListener("focus", function () {
      this.parentElement.classList.add("focused");
    });

    field.addEventListener("blur", function () {
      this.parentElement.classList.remove("focused");
      if (this.value.trim() !== "") {
        this.parentElement.classList.add("valid");
      } else {
        this.parentElement.classList.remove("valid");
      }
    });
  });
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

  initializeFormValidation();
});
