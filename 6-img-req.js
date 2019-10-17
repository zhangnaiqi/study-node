const http = require("http");
var cheerio = require("cheerio");
const writeFilePromise = require("./fileutils").writeFilePromise;
const request = require("request"); //利用request模块保存图片
const fs = require("fs");
http.get("http://www.win4000.com/wallpaper_big_114591_11.html", res => {
  let body = [];
  let imgs = [];
  res
    .on("data", chunk => {
      // console.log("=====chunk", chunk);
      body.push(chunk);
    })
    .on("end", () => {
      body = Buffer.concat(body).toString();
      filterSlideList(body);

      async function filterSlideList(html) {
        if (html) {
          const $ = cheerio.load(html); // 利用cheerio模块将完整的html装载到变量$中，之后就可以像jQuery一样操作html了

          // 拿到图片的父容器
          // class为cf的ul标签dom
          const $imgdom = $("ul.cf");
          console.log("$imgdom+++++", $imgdom);
          //创建放图片的文件夹
          fs.mkdir("./img/", err => {
            if (err) {
              console.log(err);
            }
          });
          console.log("开始爬 风景的图片");
          $imgdom.find("img").each(function(index) {
            const imgurl = $(this).attr("src"); //拿到图片链接
            imgs.push(imgurl);

            // 利用request模块保存图片
            request(imgurl).pipe(
              fs.createWriteStream("./img/" + index + ".jpg")
            );
          });
          console.log("imgs++++", imgs);
          const data1 = await writeFilePromise(
            "6-imgsArr.js",
            JSON.stringify(imgs, null, " "),
            "utf-8"
          );
        }
      }
    });
});
