const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "test"
});

connection.connect();

console.log("mysql init.....");

exports.connection = connection;
