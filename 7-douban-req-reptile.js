const https = require("https");
const dexrpy = require("./6-douban-decrypt.js").decrypt;
const writeFilePromise = require("./fileutils").writeFilePromise;
const jsonToCsv = require("./7-json-to-csv").jsonToCsv;
var cheerio = require("cheerio");
let bookArr = [];

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
    // 为了避开这两本摘要不一样啊 https://book.douban.com/subject/2994925/和https://book.douban.com/subject/1869705/
    if (bookList.payload.items[i].rating && i != 2 && i != 15) {
      // if (bookList.payload.items[i].rating) {
      const evaluateNumber = bookList.payload.items[i].rating.count,
        evaluatestar = bookList.payload.items[i].rating.star_count,
        cover_url = bookList.payload.items[i].cover_url;
      const info = bookList.payload.items[i].abstract.split(" / ");
      const author = info[0],
        press = info[info.length - 3],
        pubDate = info[info.length - 2];
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
          console.log("des++++++", des);
          abstract += des;
        });
      }
      let boolItem = {
        title: bookList.payload.items[i].title,
        abstract: bookList.payload.items[i].abstract,
        evaluateNumber,
        evaluatestar,
        cover_url,
        author,
        press,
        pubDate,
        abstract: abstract
      };
      bookArr.push(boolItem);
    }
  }
  // console.log("bookArr=======", bookArr);
  //爬取前10页数据
  if (page < 1) {
    doubanPage(page + 1);
  } else {
    // console.log("bookArr++++++", bookArr);
    const data1 = await writeFilePromise(
      "6-doubanArr.js",
      JSON.stringify(bookArr, null, " "),
      "utf-8"
    );
    //这种解析https://book.douban.com/subject/2994925/和https://book.douban.com/subject/1869705/  摘要解析有问题
    jsonToCsv(bookArr, ".", "writeFile.csv");
  }
};
doubanPage(1);
