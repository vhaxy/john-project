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

  const form = document.getElementById("contactForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const formData = new FormData(this);
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
      alert(
        "There was an error processing your inquiry. Please try again later."
      );
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
