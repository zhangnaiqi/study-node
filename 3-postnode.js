const http = require("http");
const url = require("url");
const querystring = require("querystring");
const server = http.createServer(function(request, response) {
  //从request获取信息
  const urlInfo = url.parse(request.url);
  const method = request.method;
  const contentType = request.headers["content-type"];
  console.log("method+++++====", method, contentType);
  let body = [];
  request
    .on("data", chunk => {
      console.log("chunk++++++", chunk);
      body.push(chunk);
    })
    .on("end", () => {
      body = Buffer.concat(body).toString();
      let a, b;
      console.log("body++++++", body);
      if (contentType === "application/x-www-form-urlencoded") {
        const qs = querystring.parse(body);
        a = qs.a;
        b = qs.b;
      } else if (contentType === "application/json") {
        const bodyObj = JSON.parse(body);
        a = bodyObj.a;
        b = bodyObj.b;
      }
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
      response.end(res.toFixed(1).toString());
    });
});
server.listen(8888);
console.log("server服务已启动，访问地址： http://127.0.0.1:8888");
