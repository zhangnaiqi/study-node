const https = require("https");
const dexrpy = require("./6-douban-decrypt.js").decrypt;
const writeFilePromise = require("./fileutils").writeFilePromise;
const jsonToCsv = require("./7-json-to-csv").jsonToCsv;
var cheerio = require("cheerio");
let bookArr = [];
let urlArr = [];
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
  try {
    const promiseAll = Promise.all([
      httpsGet(
        "https://search.douban.com/book/subject_search?search_text=javascript&cat=1001&start=" +
          page * 15
      ),
      httpsGet(
        "https://search.douban.com/book/subject_search?search_text=javascript&cat=1001&start=" +
          (page + 1) * 15
      ),
      httpsGet(
        "https://search.douban.com/book/subject_search?search_text=javascript&cat=1001&start=" +
          (page + 2) * 15
      ),
      httpsGet(
        "https://search.douban.com/book/subject_search?search_text=javascript&cat=1001&start=" +
          (page + 3) * 15
      ),
      httpsGet(
        "https://search.douban.com/book/subject_search?search_text=javascript&cat=1001&start=" +
          (page + 4) * 15
      )
    ]);
    const [page1, page2, page3, page4, page5] = await promiseAll;
    await getData(page1);
    await getData(page2);
    await getData(page3);
    await getData(page4);
    await getData(page5);
  } catch (err) {
    console.log("获取分页列表数据+++++++", err);
  }
};
let getData = async body => {
  const idx = body.indexOf('__DATA__ = "');
  console.log("idx: ", idx);
  //查找加密信息结束下标
  const idx2 = body.indexOf('";');
  console.log("idx2: ", idx2);
  // 截取加密数据
  let str = body.slice(idx + 12, idx2);
  // console.log("str: ", str, "++++++++++++++++++");
  const bookList = dexrpy(str);
  for (let i = 0; i < bookList.payload.items.length; i++) {
    if (bookList.payload.items[i].rating) {
      const evaluateNumber = bookList.payload.items[i].rating.count,
        evaluatestar = bookList.payload.items[i].rating.star_count,
        cover_url = bookList.payload.items[i].cover_url;
      const info = bookList.payload.items[i].abstract.split(" / ");
      const author = info[0],
        press = info[info.length - 3],
        pubDate = info[info.length - 2];
      urlArr.push(bookList.payload.items[i].url);
      let boolItem = {
        title: bookList.payload.items[i].title,
        evaluateNumber,
        evaluatestar,
        cover_url,
        author,
        press,
        pubDate
      };
      bookArr.push(boolItem);
    }
  }
  // 先存储没有摘要信息的数据
  const data = await writeFilePromise(
    "7-doubanArr1.js",
    JSON.stringify(bookArr, null, " "),
    "utf-8"
  );
};
const getAbstract = async () => {
  console.log("urlArr.length", urlArr.length);
  for (i = 0; i < urlArr.length; i += 5) {
    console.log("开始循环回去详情页，摘要", i);
    try {
      const promiseAll = Promise.all([
        await httpsGet(urlArr[i]),
        await httpsGet(urlArr[i + 1]),
        await httpsGet(urlArr[i + 2]),
        await httpsGet(urlArr[i + 3]),
        await httpsGet(urlArr[i + 4])
      ]);
      const [
        bookHtml1,
        bookHtml2,
        bookHtml3,
        bookHtml4,
        bookHtml5
      ] = await promiseAll;
      await analyticalSummary(bookHtml1, i);
      await analyticalSummary(bookHtml2, i + 1);
      await analyticalSummary(bookHtml3, i + 2);
      await analyticalSummary(bookHtml4, i + 3);
      await analyticalSummary(bookHtml5, i + 4);
    } catch (err) {
      console.log("err+++++++", err);
      bookArr.push({ mas: "错误保存数组下标", index: i });
      const data = await writeFilePromise(
        "7-doubanArr1.js",
        JSON.stringify(bookArr, null, " "),
        "utf-8"
      );
    }
    // 间隔30秒后再执行，防止被封
    await sleep(30);
  }
};
let analyticalSummary = async (bookHtml, index) => {
  let abstract = "";
  const $ = cheerio.load(bookHtml);
  //获取span标签class为 all hidden的dom
  const $abstractdom = $("span.all.hidden");
  $abstractdom.find("p").each(function(index) {
    const des = $(this).text();
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
  // 获取到摘要后把再要加进数据，再存储
  bookArr[index].abstract = abstract;
  const data = await writeFilePromise(
    "7-doubanArr1.js",
    JSON.stringify(bookArr, null, " "),
    "utf-8"
  );
  // 保存csv文件
  jsonToCsv(bookArr, ".", "douban.csv");
};
// 封装setTimeout Promise
let sleep = sec => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), sec * 1000);
  });
};
const req = async () => {
  for (let i = 0; i < 10; i += 5) {
    console.log(i, "+++++++++++++");
    await doubanPage(i);
    await getAbstract();
    // 间隔60秒后再执行，防止被封
    await sleep(60);
  }
};

req();
