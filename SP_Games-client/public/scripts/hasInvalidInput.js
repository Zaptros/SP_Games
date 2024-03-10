function hasInvalidInput(formid) {
    let form = $(formid)
    // first remove existing red text and input border
    $('form *').removeClass('border-danger')
    $('small.text-danger').remove()
    for (input of form[0]) {
        if (!input.validity.valid) {
            try {
                invalidElement = $("#"+input.id) // get jquery object 
            } catch {
                invalidElement = $("."+input.className.replaceAll(' ','.'))
            }
            invalidElement.parent().append(`<small class="text-danger form-text">${invalidElement[0].validationMessage}</small>`)
            // invalidElement.parentElement.append(`<small class="text-danger form-text">${invalidElement[0].validationMessage}</small>`)
            invalidElement.parent().find(input.tagName).addClass('border-danger')
            return true
        }
    }
    return false
}