
const app = require('./controller/app.js');
var port = 8081
var server = app.listen(port, () => {
    console.log(`Web App posted at http://localhost:${port}`);
})