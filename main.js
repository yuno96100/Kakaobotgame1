const Handler = require("./modules/handler");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg === "/업데이트" && sender === "관리자") {
        updateBot(replier); // 봇 소스 갱신 함수
        return;
    }
    Handler.process(msg, sender, replier);
}
