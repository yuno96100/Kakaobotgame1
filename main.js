// [main.js]의 response 함수 부분
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    const userHash = String(imageDB.getProfileHash()).trim();
    
    // 1. 업데이트 명령어 (최우선)
    if (msg === ".업데이트" && userHash === MASTER_HASH) { 
        updateBot(replier); 
        return; 
    }
    
    try {
        // 2. 테스트 모듈 먼저 실행
        const Tester = require("modules/tester");
        if (Tester.check(room, msg, sender, replier, imageDB, isGroupChat)) {
            return; // 테스트 명령어가 실행되었다면 여기서 종료
        }

        // 3. 테스트가 아니라면 일반 게임 핸들러 실행
        const Handler = require("modules/handler");
        if (Handler && typeof Handler.process === "function") {
            Handler.process(room, msg, sender, replier, imageDB, isGroupChat);
        }
    } catch (e) {
        // 에러 발생 시 로그 (개발 중에만 켜두세요)
        // replier.reply("Error: " + e.message);
    }
}
