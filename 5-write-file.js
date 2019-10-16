const http = require("http");
const writeFilePromise = require("./fileutils").writeFilePromise;

const server = http.createServer(async function(request, response) {
  // 读参数
  const url = request.url;
  console.log(url);
  const fileName = url.slice(1);

  let body = [];
  request
    .on("data", chunk => {
      console.log("=====chunk", chunk);
      body.push(chunk);
    })
    .on("end", async () => {
      body = Buffer.concat(body).toString();

      try {
        const data = await writeFilePromise(fileName, body, "utf-8");
        console.log("data+++++++=", data);
        response.end("文件保存成功");
      } catch (err) {
        console.log(err);
        response.end("文件不存在");
      }
    });
});

server.listen(8888);
console.log("Server running at http://127.0.0.1:8888/");
