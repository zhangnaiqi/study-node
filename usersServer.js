const http = require("http");
const url = require("url");
const querystring = require("querystring");
const mysql = require("mysql");

const Tokens = new Map();

// 创建数据库连接
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "test"
});
connection.connect();
const server = http.createServer(function(request, response) {
  //从request获取信息
  const urlInfo = url.parse(request.url);
  const method = request.method;
  const contentType = request.headers["content-type"];
  const cookin = request.headers.cookie;
  response.setHeader("Content-Type", "text/plain;charset=UTF-8");
  console.log("method+++++====", method, contentType, cookin);
  if (method === "GET") {
    const urlInfo = url.parse(request.url);
    const body = querystring.parse(urlInfo.query);
    //两数相加

    let res;
    if (urlInfo.pathname === "/add") {
      // 两数和
      const a = Number(body.a);
      const b = Number(body.b);
      console.log(a, b);
      res = a + b;
      response.end(res.toString());
    } else if (urlInfo.pathname === "/login") {
      // 登录
      let sql =
        'select name,password from users where name="' + body.name + '"';
      connection.query(sql, function(error, results, fields) {
        console.log("error++++++++", error);
        if (error) throw error;
        if (results.length === 0) {
          res = "该用户不存在";
        } else {
          if (results[0].password === body.password) {
            // 设置 cookie
            const token = "123456";
            Tokens.set(token, body.name);
            response.setHeader("Set-Cookie", [`token=${token}; path=/;`]);
            res = "登录成功";
          } else {
            res = "密码错误";
          }
        }
        response.end(res);
      });
    } else if (urlInfo.pathname === "/selectEmail") {
      // 登录后查询邮箱
      const token = cookin.slice("token=".length);
      const username = Tokens.get(token);
      console.log("token: ", token, username);
      if (username) {
        let sql =
          'select name,mailbox from users where name="' + username + '"';
        connection.query(sql, function(error, results, fields) {
          console.log("error++++++++", error, results);
          if (error) {
            console.error(error);
            response.end("邮箱查询失败");
          } else {
            res = results[0].mailbox;
            response.end(res);
          }
        });
      } else {
        res = "请登录！";
        response.end(res);
      }
    } else if (urlInfo.pathname === "/logout") {
      response.setHeader("Set-Cookie", [`token=''; path=/;`]);
      const token = cookin.slice("token=".length);
      Tokens.put(token, null);
      response.end("退出登录");
    }
  } else if (method === "POST") {
    let body = [];
    request
      .on("data", chunk => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        console.log("body++++++", body);
        const bodyObj = JSON.parse(body);
        // 注册
        if (urlInfo.pathname === "/register") {
          if (
            bodyObj.name &&
            bodyObj.age &&
            bodyObj.password &&
            bodyObj.mailbox
          ) {
            let sql =
              'select name,password from users where name="' +
              bodyObj.name +
              '"';
            connection.query(sql, function(error, results, fields) {
              console.log("error++++++++", error);
              if (error) throw error;
              if (error) {
                response.end("查询失败");
              } else {
                if (results.length === 0) {
                  let sql =
                    'insert into users (name,age,password,mailbox) value ("' +
                    bodyObj.name +
                    '",' +
                    bodyObj.age +
                    ',"' +
                    bodyObj.password +
                    '","' +
                    bodyObj.mailbox +
                    '")';
                  console.log(sql, "sql++++++++++++++");
                  connection.query(sql, function(error, results, fields) {
                    if (error) throw error;
                    if (error) {
                      response.end("插入失败");
                    } else {
                      response.end("注册成功");
                    }
                  });
                } else {
                  response.end("用户名已存在");
                }
              }
            });
          } else {
            response.end("参数不正确");
          }
        }
      });
  }
});
server.listen(8888);
console.log("server服务已启动，访问地址： http://127.0.0.1:8888");
