const Handler = require("./modules/handler");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg.startsWith(".")) {
        // 단톡/개인톡 구분 없이 모든 메시지를 핸들러로 전달
        Handler.process(room, msg, sender, isGroupChat, replier);
    }
}
