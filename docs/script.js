const scriptURL =
  "https://script.google.com/macros/s/AKfycbzGa5wK8qZMgEUC06G0s4smN0cSeZtis6y5WN2gaq5E9XFlbMwcPdPEEbNi_dt_K4iyZA/exec";

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

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Honeypot check
    const honeypotValue = document.getElementById("website").value;
    if (honeypotValue) {
      console.warn("Bot detected via honeypot field.");
      return;
    }

    // Time-based check
    const timeTaken = Date.now() - formLoadTime;
    if (timeTaken < 3000) {
      alert("Submission too fast. Please take a moment to fill in the form.");
      return;
    }

    // Get the Turnstile widget element
    const widget = document.querySelector(".cf-turnstile");

    // Ensure turnstile is loaded
    if (typeof turnstile !== "undefined") {
      turnstile.ready(() => {
        // Reset widget to clear previous state
        turnstile.reset(widget);
        // Execute and obtain a fresh token
        const execResult = turnstile.execute(widget);
        if (execResult && typeof execResult.then === "function") {
          execResult
            .then(async function (token) {
              const formData = new FormData(form);
              formData.append("turnstileToken", token);

              const firstName = formData.get("firstName");
              const lastName = formData.get("lastName");
              const userEmail = formData.get("email");
              const phone = formData.get("phone").toString();
              const fullName = `${firstName} ${lastName}`;

              try {
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
                params.append("turnstileToken", token);

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
            })
            .catch(function (error) {
              console.error("Turnstile execute error:", error);
            });
        } else {
          console.error("turnstile.execute(widget) did not return a promise.");
        }
      });
    } else {
      console.error("Cloudflare Turnstile is not loaded.");
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
