const Handler = require("./modules/handler");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg.startsWith(".")) {
        // ⭐ 중요: room과 isGroupChat을 반드시 포함해서 5개를 넘겨야 합니다.
        Handler.process(room, msg, sender, isGroupChat, replier);
    }
}
