// [main.js] response 함수 부분
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    const userHash = String(imageDB.getProfileHash()).trim();
    
    if (msg === ".업데이트") { 
        updateBot(replier); 
        return; 
    }
    
    try {
        // [수정] 모듈 캐시 삭제 (수정된 파일이 즉시 반영되도록 함)
        delete require.cache[require.resolve("modules/tester")];
        const Tester = require("modules/tester");
        
        if (Tester && typeof Tester.check === "function") {
            if (Tester.check(room, msg, sender, replier, imageDB, isGroupChat)) return;
        }
    } catch (e) {
        // 파일이 없거나 에러가 나면 다음으로 패스
    }

    try {
        delete require.cache[require.resolve("modules/handler")];
        const Handler = require("modules/handler");
        Handler.process(room, msg, sender, replier, imageDB, isGroupChat);
    } catch (e) {
        // Log.error("Handler Error: " + e.message);
    }
}
