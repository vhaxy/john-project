const scriptURL = "https://script.google.com/macros/s/AKfycbzGa5wK8qZMgEUC06G0s4smN0cSeZtis6y5WN2gaq5E9XFlbMwcPdPEEbNi_dt_K4iyZA/exec";

document.addEventListener("DOMContentLoaded", function () {
  const fadeEls = document.querySelectorAll(".fade");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        } else {
          entry.target.classList.remove("in-view");
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "50px",
    }
  );
  fadeEls.forEach((el) => observer.observe(el));

  let formLoadTime = Date.now();
  const form = document.getElementById("contactForm");
  let turnstileWidget = null;

  if (typeof turnstile !== "undefined") {
    turnstile.ready(function () {
      turnstileWidget = turnstile.render('.cf-turnstile', {
        sitekey: '0x4AAAAAAA9U149qrooH7PkU',
        callback: function(token) {
          const tokenInput = document.createElement('input');
          tokenInput.type = 'hidden';
          tokenInput.name = 'cf-turnstile-response';
          tokenInput.value = token;
          form.appendChild(tokenInput);
        }
      });
    });
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const honeypotValue = document.getElementById("website").value;
    if (honeypotValue) {
      console.warn("Bot detected via honeypot field.");
      return;
    }

    const timeTaken = Date.now() - formLoadTime;
    if (timeTaken < 3000) {
      alert("Submission too fast. Please take a moment to fill in the form.");
      return;
    }

    try {
      if (turnstileWidget) {
        turnstile.reset(turnstileWidget);
      }
      
      const formData = new FormData(form);
      const firstName = formData.get("firstName");
      const lastName = formData.get("lastName");
      const userEmail = formData.get("email");
      const phone = formData.get("phone").toString();
      const fullName = `${firstName} ${lastName}`;

      await emailjs.send("service_bpoo366", "template_k7g1gcm", {
        name: fullName,
        user_email: userEmail,
        phone: phone,
      });

      const params = new URLSearchParams();
      params.append("firstName", firstName);
      params.append("lastName", lastName);
      params.append("email", userEmail);
      params.append("phone", phone);
      
      const tokenInput = form.querySelector('input[name="cf-turnstile-response"]');
      if (tokenInput) {
        params.append("turnstileToken", tokenInput.value);
      }

      const response = await fetch(scriptURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const formElement = form;
      const thankYouElement = document.getElementById("thankYouMessage");

      formElement.style.opacity = "0";
      formElement.style.transform = "translateY(-20px)";

      setTimeout(() => {
        formElement.style.display = "none";
        thankYouElement.style.display = "block";
        void thankYouElement.offsetWidth;
        thankYouElement.classList.add("visible");
      }, 300);

      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
      alert("There was an error processing your inquiry. Please try again later.");
    }
  });

  const phoneInput = form.querySelector('input[name="phone"]');
  phoneInput.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 10) {
      value = value.slice(0, 10);
      value = value.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }
    e.target.value = value;
  });
});