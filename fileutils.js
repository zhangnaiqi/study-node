const fs = require("fs");

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
function writeFilePromise(fileName, data, encoding) {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, data, encoding, err => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

exports.readFilePromise = readFilePromise;
exports.writeFilePromise = writeFilePromise;
