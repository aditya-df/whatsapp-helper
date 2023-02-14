const qrcode = require("qrcode-terminal");
const fs = require("fs");

const { Client, LocalAuth } = require("whatsapp-web.js");
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "client-one" }),
});
// const mainClient = new Client({
//   authStrategy: new LocalAuth({ clientId: "main-client" }),
// });

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// mainClient.on("qr", (qr) => {
//   qrcode.generate(qr, { small: true });
// });

client.on("ready", () => {
  console.log("Client is ready!");
});
// mainClient.on("ready", () => {
//   console.log("main Client is ready!");
// });

async function saveViewOnceImage(msg) {
  let location = "./images/";
  if (msg.hasMedia && msg._data.isViewOnce) {
    location = "./images/once/";
  }
  const media = await msg.downloadMedia();
  let date = new Date();
  let month = date.getMonth() + 1;
  let timestamp = `${month}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
  fs.writeFile(
    `${location}${msg._data.notifyName.split(" ").join("-")}_${timestamp}.${
      media.mimetype.split("/")[1]
    }`,
    media.data,
    "base64",
    function (err) {
      console.log(err);
    }
  );
}

// mainClient.on("message", (msg) => {
//   console.log(msg);
//   saveViewOnceImage(msg);
// });

client.on("message", async (msg) => {
  if (msg.hasMedia) {
    saveViewOnceImage(msg);
  }
  // console.log(msg);
  if (msg.body === "!ping") {
    msg.reply("pong");
  }

  if (msg.body === "@here") {
    const chat = await msg.getChat();

    let text = "";
    let mentions = [];

    for (let participant of chat.participants) {
      const contact = await client.getContactById(participant.id._serialized);

      mentions.push(contact);
      text += `@${participant.id.user} `;
    }

    await chat.sendMessage(text, { mentions });
  }
});

client.initialize();
// mainClient.initialize();
