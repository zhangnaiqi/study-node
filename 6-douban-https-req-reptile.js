const http = require("http");
const https = require("https");
const dexrpy = require("./6-douban-decrypt.js").decrypt;
const writeFilePromise = require("./fileutils").writeFilePromise;
let bookArr = [];

let doubanPage = async page => {
  console.log("page++++++++++++", page);

  let url = https.get(
    "https://search.douban.com/book/subject_search?search_text=javascript&cat=1001&start=" +
      (page - 1) * 15,
    res => {
      let body = [];
      res
        .on("data", chunk => {
          console.log("=====chunk", chunk);
          body.push(chunk);
        })
        .on("end", async () => {
          body = Buffer.concat(body).toString();

          // console.log("body++++++", body);
          //查找加密信息开始下标
          const idx = body.indexOf('__DATA__ = "');
          console.log("idx: ", idx);
          //查找加密信息结束下标
          const idx2 = body.indexOf('";');
          console.log("idx2: ", idx2);
          // 截取加密数据
          let str = body.slice(idx + 12, idx2);
          // console.log("str: ", str, "++++++++++++++++++");
          // 解密数据
          const bookList = dexrpy(str);
          // 存储当前页json
          const data = await writeFilePromise(
            "6-douban.json",
            JSON.stringify(bookList, null, " "),
            "utf-8"
          );
          //遍历保存书名和其他信息
          for (let i = 0; i < bookList.payload.items.length; i++) {
            let boolItem = {
              title: bookList.payload.items[i].title,
              abstract: bookList.payload.items[i].abstract
            };
            bookArr.push(boolItem);
          }
          // console.log("bookArr=======", bookArr);
          //爬取前10页数据
          if (page < 10) {
            doubanPage(page + 1);
          } else {
            const data1 = await writeFilePromise(
              "6-doubanArr.js",
              JSON.stringify(bookArr, null, " "),
              "utf-8"
            );
          }
        });
    }
  );
};
doubanPage(1);
