// sdcard/msgbot/Bots/sub/main.js
try {
    var Handler = require("./modules/handler");
    Log.info("✅ 핸들러 로딩 성공");
} catch (e) {
    Log.error("❌ 핸들러 로딩 실패: " + e.message);
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg.startsWith(".")) {
        try {
            if (typeof Handler !== "undefined" && Handler.process) {
                Handler.process(room, msg, sender, isGroupChat, replier);
            } else {
                replier.reply("⚠️ 시스템 준비 중입니다. 잠시 후 다시 시도해주세요.");
            }
        } catch (e) {
            replier.reply("❌ 실행 오류: " + e.message);
        }
    }
}
