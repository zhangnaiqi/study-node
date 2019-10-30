const queryPromise = require("./dbutils").queryPromise;

function getUserByNameFromDB(name) {
  return queryPromise(`select * from users where name="${name}"`);
}

function addUserToDB(name, password, age, mailbox) {
  console.log("++++++++", name, password, age, mailbox);
  return queryPromise(
    `insert into users(name,age,password,mailbox) values("${name}", "${age}", "${password}", "${mailbox}")`
  );
}

function getUsers() {
  return queryPromise(`select * from users`);
}

exports.getUserByNameFromDB = getUserByNameFromDB;
exports.addUserToDB = addUserToDB;
exports.getUsers = getUsers;
