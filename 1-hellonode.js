const http = require("http");

const server = http.createServer(function(request, response) {
  response.end("hello node\n");
});

server.listen(8888);
console.log("Server running at http://127.0.0.1:8888/");
