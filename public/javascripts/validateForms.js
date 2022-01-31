// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms)
        .forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
        })
    })()
    // let navlink = document.querySelectorAll('.nav-link');
    // for(let i=0 ; i<navlink.length; i++){
    //     navlink[i].addEventListener('click',function(){
    //         navlink[1].classList.remove('active');
    //         navlink[2].classList.remove('active');
    //         this.classList.add('active');
    //     });
    // }