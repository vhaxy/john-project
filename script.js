document.getElementById("contactForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const firstName = this.querySelector('input[name="firstName"]').value;
  const lastName = this.querySelector('input[name="lastName"]').value;
  const userEmail = this.querySelector('input[name="email"]').value;
  const phone = this.querySelector('input[name="phone"]').value;

  const fullName = firstName + " " + lastName;

  const templateParams = {
    name: fullName, 
    user_email: userEmail, 
    phone: phone       
  };

  emailjs.send("service_bpoo366", "template_k7g1gcm", templateParams)
    .then((response) => {
      console.log("SUCCESS!", response.status, response.text);
      alert("Thank you for your inquiry! A confirmation email has been sent.");
      this.reset(); 
    })
    .catch((error) => {
      console.error("FAILED...", error);
      alert("There was an error processing your inquiry. Please try again later.");
    });
});
