$(document).ready(() => {
    $("#nav").append(`
    <div class="container-fluid">
        <a class="navbar-brand" href="/"><img src="/images/game_icon.png" class="img-fluid" style="max-height:90px; max-width:90px"></a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button> 
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="/">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/search.html">Search Games</a>
                </li>
            </ul>
        </div>
    </div>
    `)
    token = localStorage.getItem('token')
    if (token == null) {
        $("#nav").append(`
            <a href="/login.html" class="navbar-brand bg-secondary btn-block p-2 rounded">
                Log In 
            </a>
        `)
    } else {
        userData = JSON.parse(atob(token.split('.')[1]))
        $("#nav").append(`
            <div class="dropdown show">
                <a class="btn bg-secondary dropdown-toggle text-light" role="button" data-bs-toggle="dropdown" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    ${userData.username} 
                    <img src="/images/user_icon_small.png" class="m-1" alt="user dropdown">
                </a>
                <div class="dropdown-menu dropdown-menu-end bg-secondary" aria-labelledby="dropdownMenuLink">
                    <a class="dropdown-item text-light" href="/profile.html">Profile</a>
                    <a class="dropdown-item text-light" href="/cart.html">Cart</a>
                    <a class="dropdown-item text-light" href="/preferences.html">Preferences</a>
                    <div class="dropdown-divider bg-light"></div>
                    <a class="dropdown-item text-light" role="button" id="logout" href="#">Log Out</a>
                </div>
            </div>
        `);
        $('#navbarSupportedContent ul').append(`
            <li class="nav-item">
                <a class="nav-link" aria-current="page" href="/recommendations.html">Recommendations</a>
            </li>
        `)
        if (userData.role == 'Admin') { // admin test
            $('#navbarSupportedContent ul').append(`
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Admin Panel
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="/admin/add-game.html">Add Games</a></li>
                    <li><a class="dropdown-item" href="/admin/add-platform.html">Add Platforms</a></li>
                </ul>
            </li>
            `); 
        }
    }
})

