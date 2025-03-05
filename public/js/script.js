// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })()

  // Navbar toggler
  document.addEventListener("DOMContentLoaded", function () {
    const navbarToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.querySelector("#navbarNavAltMarkup");
    const icon = navbarToggler.querySelector("i");

    navbarToggler.addEventListener("click", function () {
      if (navbarCollapse.classList.contains("show")) {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      } else {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      }
    });
  });
