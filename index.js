const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const axios = require("axios");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let objUsers = {};

app.post("/", async function (req, res) {
  let session = req.body.session;
  let request = req.body.request;
  let obj = {
    response: {
      text: ``,
      tts: `<speaker audio="alice-music-harp-1.opus">`,
      end_session: false,
    },
    version: "1.0",
  };

  if (session.new) {
    objUsers[session.session_id] = {};
    obj.response.text = "Здравствуйте! Перевод какой фразы Вы хотите узнать?";
    res.json(obj);
  }

  if (!session.new && !objUsers[session.session_id].text) {
    objUsers[session.session_id].text = request.command;
    obj.response.text =
      "На каком языке Вы хотите узнать перевод этой фразы? Назовите аббревиатуру языка";
    res.json(obj);
    res.end();
  } else if (
    !session.new &&
    objUsers[session.session_id].text &&
    !objUsers[session.session_id].lang
  ) {
    objUsers[session.session_id].lang = request.command;
    let userText = objUsers[session.session_id].text;
    let lang = objUsers[session.session_id].lang;

    let data = JSON.stringify({
      folderId: "your folderId here",
      texts: userText,
      targetLanguageCode: lang,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://translate.api.cloud.yandex.net/translate/v2/translate",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Api-Key your API key here",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        obj.response.text = `Перевод фразы ${userText}: ${response.data.translations[0].text}`;
        objUsers[session.session_id].text = false;
        objUsers[session.session_id].lang = false;
        res.json(obj);
        res.end();
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

app.listen(3000);
