const Handler = require("./modules/handler.js");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    // 관리자 업데이트 로직
    if (msg === "/업데이트" && sender === "관리자") {
        try {
            delete require.cache[require.resolve("./modules/handler.js")];
            delete require.cache[require.resolve("./modules/user.js")];
            delete require.cache[require.resolve("./modules/admin.js")];
            replier.reply("관리자", "✅ [v1.0.8] 시스템 갱신 완료");
        } catch (e) {
            replier.reply("관리자", "❌ 업데이트 에러: " + e.message);
        }
        return;
    }

    // 핸들러 실행 (에러 핸들링 포함)
    try {
        Handler.process(msg, sender, replier);
    } catch (e) {
        // 응답이 없는 원인을 찾기 위해 로그를 남깁니다.
        Log.error("Handler Error: " + e.message + " (Line: " + e.lineNumber + ")");
    }
}
