function handleSubmit(event) {
    event.preventDefault(); // Prevent page reload

    var form = document.getElementById("contactForm");
    var formData = {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      email: form.email.value,
      phone: form.phone.value
    };

    google.script.run.withSuccessHandler(function(response) {
      if (response === "Success") {
        alert("Thank you for your inquiry! A confirmation email has been sent.");
        form.reset();
      } else {
        alert("There was an error processing your inquiry. Please try again later.");
      }
    }).processForm(formData);
  }