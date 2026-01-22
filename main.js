// /sdcard/msgbot/Bots/sub/main.js
var Handler;

function load() {
    try {
        Handler = require("./modules/handler");
        Log.info("✅ 핸들러 로딩 완료");
    } catch (e) {
        Log.error("❌ 로딩 에러: " + e.message);
    }
}

load(); // 시작 시 로드

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg === ".리로드" && sender.toString() === "관리자") {
        load();
        return replier.reply("🔄 시스템이 재시작되었습니다.");
    }

    if (msg.startsWith(".")) {
        try {
            Handler.process(room, msg, sender, isGroupChat, replier);
        } catch (e) {
            replier.reply("❌ 실행 에러: " + e.message);
        }
    }
}
// main.js response 함수 안에 임시 추가
replier.reply("내 이름은: [" + sender + "]");
