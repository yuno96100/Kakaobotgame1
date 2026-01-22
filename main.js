// /sdcard/msgbot/Bots/sub/main.js
const Handler = require("./modules/handler");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg.startsWith(".")) {
        try {
            // V1.2.2 표준 인자 전달
            Handler.process(room, msg, sender, isGroupChat, replier);
        } catch (e) {
            // 에러 발생 시 로그 탭과 채팅창에 동시에 출력
            Log.error(e.message + "\n" + e.stack);
            replier.reply("❌ 시스템 오류 발생: " + e.message);
        }
    }
}
