$(document).ready(() => {
    $("#logout").click((event) => {
        localStorage.clear(); 
        window.location.href = "/login.html"
    })
})