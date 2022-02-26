const axios = require("axios");

//代理地址 tgproxy.hwkxk.workers.dev
module.exports.tgBot = (token, chatId, msg) => {
  let message = msg.replace(/\#|\(|\)|\[|\]|\-/g, "\\$&\\");
  axios
    .post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        parse_mode: "MarkdownV2",
        chat_id: chatId,
        text: message,
      },
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      }
    )
    .then(
      (res) => {
        console.log(res.data);
      },
      (err) => {
        console.log(err.response.data);
      }
    );
};

module.exports.qmsgBot = (type, key, num, msg) => {
  axios
    .post(
      `https://qmsg.zendee.cn/${type}/${key}`,
      new URLSearchParams({
        msg: msg,
        qq: num,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then(
      (res) => {
        console.log(res.data);
      },
      (err) => {
        console.log(err.response.data);
      }
    );
};
