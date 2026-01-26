// [main.js 원본]
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const MASTER_HASH = "236652781"; 

    // 1. 업데이트 조건 수정 (.접두사 및 해시값 기준)
    if (msg === ".업데이트" && userHash === MASTER_HASH) {
        updateBot(replier); 
        return;
    }

    try {
        // 2. 캐시 삭제 (수정사항 즉시 반영을 위해 중요!)
        delete require.cache[require.resolve("modules/handler")];
        var Handler = require("modules/handler");

        // 3. 인자 개수 맞추기 (handler.js가 요구하는 6개 모두 전달)
        Handler.process(room, msg, sender, replier, imageDB, isGroupChat);

    } catch (e) {
        // 어디서 꼬였는지 채팅창에 바로 보고
        if (msg.startsWith(".")) {
            replier.reply("⚠️ 엔진 오류: " + e.message + "\n라인: " + e.lineNumber);
        }
    }
}
