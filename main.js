// sdcard/msgbot/Bots/sub/main.js
const Handler = require("./modules/handler");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg.startsWith(".")) {
        try {
            // 명령어가 들어오면 핸들러 실행
            Handler.process(room, msg, sender, isGroupChat, replier);
        } catch (e) {
            // 에러 발생 시 채팅방에 에러 내용을 알림
            replier.reply("❌ 핸들러 실행 오류: " + e.message);
        }
    }
}
