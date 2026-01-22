// sdcard/msgbot/Bots/sub/main.js
var Handler;

function loadModule() {
    try {
        // 경로 문제를 방지하기 위해 캐시를 삭제하고 다시 불러옵니다.
        delete require.cache[require.resolve("./modules/handler")];
        Handler = require("./modules/handler");
        Log.info("✅ 핸들러 로딩 성공");
    } catch (e) {
        Log.error("❌ 로딩 실패: " + e.message + "\n라인: " + e.lineNumber);
    }
}

// 봇 시작 시 실행
loadModule();

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    // 봇 상태 체크용 (명령어 앞에 점이 없어도 반응하는지 확인)
    if (msg === "봇") return replier.reply("온라인");

    if (msg.startsWith(".")) {
        if (!Handler) loadModule(); // 로딩 안 되어있으면 재시도
        
        try {
            Handler.process(room, msg, sender, isGroupChat, replier);
        } catch (e) {
            replier.reply("❌ 실행 오류: " + e.message);
            Log.error("실행 오류: " + e.stack);
        }
    }
}
