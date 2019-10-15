const http = require("http");
const fs = require("fs");
// fs.readFile("./test.txt", "utf-8", (err, data) => {
//   if (err) throw err;
//   console.log(data);
// });
function readFilePromise(fileName, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, encoding, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
const server = http.createServer(async function(request, response) {
  // 读取URL
  url = request.url;
  //读文件名
  const fileName = url.slice(1);
  try {
    const data = await readFilePromise(fileName, "utf-8");
    console.log("data+++++", data);
    // 响应结果
    response.end(data);
  } catch (err) {
    console.log("err+++++", err);
    response.end("文件不存在");
  }
});
server.listen(8888);
console.log("server服务已启动，访问地址： http://127.0.0.1:8888");
