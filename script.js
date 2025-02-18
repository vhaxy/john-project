const scriptURL = "https://script.google.com/macros/s/AKfycbzGa5wK8qZMgEUC06G0s4smN0cSeZtis6y5WN2gaq5E9XFlbMwcPdPEEbNi_dt_K4iyZA/exec";

document.addEventListener("DOMContentLoaded", function () {
  const fadeEls = document.querySelectorAll(".fade");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Add 'in-view' class when element enters viewport
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        } else {
          // Remove 'in-view' class when element leaves viewport
          entry.target.classList.remove("in-view");
        }
      });
    },
    { 
      threshold: 0.1,
      // Add rootMargin to trigger slightly before elements enter viewport
      rootMargin: '50px'
    }
  );
  
  // Observe all fade elements
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

      console.log("Sending form data:", {
        firstName,
        lastName,
        email: userEmail,
        phone,
      });

      const response = await fetch(scriptURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const responseText = await response.text();
      console.log("Google Sheets Response:", responseText);

      alert("Thank you for your inquiry! A confirmation email has been sent.");
      form.reset();
      
    } catch (error) {
      console.error("Form submission error:", error);
      alert("There was an error processing your inquiry. Please try again later.");
    }
  });

  const phoneInput = form.querySelector('input[name="phone"]');
  phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 10) {
      value = value.slice(0, 10); 
      value = value.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }
    
    e.target.value = value;
  });
});