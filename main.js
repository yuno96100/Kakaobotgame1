// sdcard/msgbot/Bots/sub/main.js
const Handler = require("./modules/handler");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg.startsWith(".")) {
        // [순서 주의] 1.방이름, 2.메세지, 3.보낸사람, 4.단톡여부, 5.응답기
        Handler.process(room, msg, sender, isGroupChat, replier);
    }
}
