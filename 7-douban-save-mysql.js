const https = require("https");
const dexrpy = require("./6-douban-decrypt.js").decrypt;
const writeFilePromise = require("./fileutils").writeFilePromise;
const jsonToCsv = require("./7-json-to-csv").jsonToCsv;
var cheerio = require("cheerio");
let bookArr = [];
const mysql = require("mysql");
const httpsGet = url => {
  console.log("+++++++httpsGet");
  return new Promise(function(resolve, rej) {
    var get_req = https.request(url, function(resa) {
      let body = [];
      resa.on("data", function(buffer) {
        body.push(buffer);
      });
      resa.on("end", function() {
        return resolve(Buffer.concat(body).toString());

        // console.log("body++++++", body);
      });
      resa.on("error", err => {
        // This prints the error message and stack trace to `stderr`.
        console.log("请求错误+++++", err);
      });
    });
    get_req.end();
  });
};
let doubanPage = async page => {
  console.log("page++++++++++++", page);
  const body = await httpsGet(
    "https://search.douban.com/book/subject_search?search_text=javascript&cat=1001&start=" +
      (page - 1) * 15
  );

  //查找加密信息开始下标
  const idx = body.indexOf('__DATA__ = "');
  if (idx === -1) return;
  console.log("idx: ", idx);
  //查找加密信息结束下标
  const idx2 = body.indexOf('";');
  console.log("idx2: ", idx2);
  // 截取加密数据
  let str = body.slice(idx + 12, idx2);
  // console.log("str: ", str, "++++++++++++++++++");
  const bookList = dexrpy(str);
  //   console.log("bookList========", bookList);
  //遍历保存书名和其他信息
  for (let i = 0; i < bookList.payload.items.length; i++) {
    if (bookList.payload.items[i].rating) {
      const evaluateNumber = bookList.payload.items[i].rating.count,
        evaluatestar = bookList.payload.items[i].rating.star_count,
        cover_url = bookList.payload.items[i].cover_url;
      const info = bookList.payload.items[i].abstract.split(" / ");
      const author = info[0],
        press = info[info.length - 3];
      let pubDate = info[info.length - 2];
      pubDate = pubDate.length < 8 ? pubDate + "-1" : pubDate;
      let abstract = "";
      //   获取摘要
      const bookAbstract = await httpsGet(bookList.payload.items[i].url);
      const $ = cheerio.load(bookAbstract);
      //获取span标签class为 all hidden的dom
      const $abstractdom = $("span.all.hidden");
      $abstractdom.find("p").each(function(index) {
        const des = $(this).text();
        // abstract += des.indexOf("\n\n") === -1 ? des : "";
        // abstract += des.indexOf("\n") === -1 ? des : "";
        abstract += des;
      });
      //如果上面没有找到摘要就在div id为link-report里寻找（因为没有‘展开全部按钮’）
      if (!abstract) {
        const $abstractdom1 = $("div#link-report");
        $abstractdom1.find("p").each(function(index) {
          const des = $(this).text();
          //   console.log("des++++++", des);
          abstract += des;
        });
      }
      console.log("abstract++++++", abstract.length);
      let boolItem = {
        title: bookList.payload.items[i].title,
        evaluateNumber,
        evaluatestar,
        cover_url,
        author,
        press,
        pubDate,
        abstract
      };
      bookArr.push(boolItem);
      let sql =
        'insert into doubanBooks (title,evaluateNumber,evaluatestar,cover_url,author,press,pubDate,abstract) value ("' +
        bookList.payload.items[i].title +
        '",' +
        evaluateNumber +
        "," +
        evaluatestar +
        ',"' +
        cover_url +
        '","' +
        author +
        '","' +
        press +
        '","' +
        pubDate +
        '","' +
        abstract +
        '")';
      console.log(sql, "sql++++++++++++++");
      connection.query(sql, function(error, results, fields) {
        if (error) throw error;
        console.log(results, fields, "results+++++++");
      });
    }
  }
  // console.log("bookArr=======", bookArr);
  //爬取前2页数据
  if (page < 2) {
    doubanPage(page + 1);
  } else {
    // console.log("bookArr++++++", bookArr);
    //结束数据库连接
    connection.end();
    const data = await writeFilePromise(
      "7-doubanArr.js",
      JSON.stringify(bookArr, null, " "),
      "utf-8"
    );
    //原生解析
    jsonToCsv(bookArr, ".", "douban.csv");
  }
};
doubanPage(1);
//建立数据库连接
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "test"
});
connection.connect();
