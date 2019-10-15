const http = require("http");
const url = require("url");
const querystring = require("querystring");
const server = http.createServer(function(request, response) {
  const urlInfo = url.parse(request.url);
  const qs = querystring.parse(urlInfo.query);
  //   const a = parseInt(qs.a);
  //   const b = parseInt(qs.b);
  const a = Number(qs.a);
  const b = Number(qs.b);
  console.log(a, b);
  let res = 0;
  if (urlInfo.pathname === "/add") {
    res = a + b;
  } else if (urlInfo.pathname === "/sub") {
    res = a - b;
  } else if (urlInfo.pathname === "/multiplication") {
    res = a * b;
  } else if (urlInfo.pathname === "/division") {
    res = a / b;
  }
  response.end(res.toString());
});
server.listen(8888);
console.log("server服务已启动，访问地址： http://127.0.0.1:8888");
