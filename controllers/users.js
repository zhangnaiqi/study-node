const { getUserByName, addUser } = require("../services/users");

async function register(request, response) {
  // 1. 检查参数
  let name = "";
  let password = "";
  let age = "";
  let mailbox = "";
  if (request.method.toLowerCase() === "post") {
    name = request.body.name;
    password = request.body.password;
    age = request.body.age;
    mailbox = request.body.mailbox;
  } else if (request.method.toLowerCase() === "get") {
    name = request.qs.name;
    password = request.qs.password;
    age = request.qs.age;
    mailbox = request.qs.mailbox;
  }
  if (password.length < 8) {
    response.statusCode = 400;
    return { errCode: 1, errMsg: "密码太短" };
  }
  if (name.includes(" ")) {
    response.statusCode = 400;
    return { errCode: 2, errMsg: "用户名里面不能包含空格" };
  }

  // 操作数据库， 调用第三方API
  const r = await addUser(name, password, age, mailbox);

  // response
  return { success: true, r };
}

async function login(request, response) {
  const { name, password } = request.qs;

  const r = await getUserByName(name);

  return { name, password, r };
}

exports.register = register;
exports.login = login;
