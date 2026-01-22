// sdcard/msgbot/Bots/sub/main.js
var Handler;
try {
    // 상대 경로가 불안정할 경우를 대비해 확실하게 로드
    Handler = require("./modules/handler");
    Log.info("✅ 핸들러 로딩 성공");
} catch (e) {
    Log.error("❌ 핸들러 로딩 실패: " + e.message + "\n라인: " + e.lineNumber);
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg.startsWith(".")) {
        try {
            if (Handler && typeof Handler.process === "function") {
                Handler.process(room, msg, sender, isGroupChat, replier);
            } else {
                // 핸들러가 없을 경우 다시 한번 로드 시도 (동적 로딩)
                Handler = require("./modules/handler");
                Handler.process(room, msg, sender, isGroupChat, replier);
            }
        } catch (e) {
            replier.reply("❌ 실행 오류: " + e.message + " (라인: " + e.lineNumber + ")");
        }
    }
}
