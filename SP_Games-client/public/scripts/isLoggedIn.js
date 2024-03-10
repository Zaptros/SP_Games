if (window.location.pathname.startsWith("/admin/")) {
    axios.get("http://localhost:8081/verify/admin", { headers: {
        Authorization :"Bearer " + localStorage.getItem('token')
    }})
        .then((response) => {
            console.log("is admin")
        })
        .catch((error) => {
            window.location.href = "/error.html"
        })
} else {
    axios.get("http://localhost:8081/verify/token", { headers: {
        Authorization :"Bearer " + localStorage.getItem('token')
    }})
        .then((response) => {
            console.log("is logged in")
        })
        .catch((error) => {
            window.location.href = "/login.html"
        })
}