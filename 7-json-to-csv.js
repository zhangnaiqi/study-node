const writeFilePromise = require("./fileutils").writeFilePromise;
function jsonToCsv(jsonList, targetPath, fileName) {
  // 这样我们得到了一个第一个为表头，剩余为内容的数组了
  var csvDataList = jsonList.reduce((prev, current, index) => {
    // 因为每个 json 对象的 key 都是相同的，因此我们只需要取一个就行
    if (index === 0) {
      prev.push(Object.keys(current));
    }
    // 将每个值都存到一个数组中去
    // "======1234*n*4321***====="替换“\n”
    // "======1234*comma*4321***====="替换英文逗号
    var dataList = [];
    for (var key in current) {
      if (key === "abstract") {
        dataList.push(
          current[key]
            .toString()
            .replace(/\n/g, "======1234*n*4321***=====")
            .replace(/,/g, "======1234*comma*4321***=====")
        );
      } else {
        dataList.push(current[key]);
      }
    }
    prev.push(dataList);
    return prev;
  }, []);
  // 将上一步得到的数组转为字符串
  var writeData = csvDataList
    .map(data => {
      // 每个数组通过逗号连接 map 返回一个数组
      // console.log("data>>>>>", data.join(";"));
      return data.join(",");
    })
    .join("\r\n");
  return new Promise(async (resolve, reject) => {
    const data = await writeFilePromise(
      `${targetPath}/${fileName}`,
      writeData,
      "utf-8"
    );
    console.log("data》》》》》》", data);
    if (data === true) {
      resolve();
    } else {
      reject(data);
    }
  });
}
exports.jsonToCsv = jsonToCsv;
