const { getUserByNameFromDB, addUserToDB } = require("../db/users");
function getUserByName(name) {
  return getUserByNameFromDB(name);
}

function addUser(name, password, age, mailbox) {
  const dbR = addUserToDB(name, password, age, mailbox);

  return dbR;
}

exports.addUser = addUser;
