// [main.js] 내 response 함수
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    const userHash = String(imageDB.getProfileHash()).trim();
    
    // 업데이트 (MASTER_HASH 생략하고 테스트용으로 열어둠)
    if (msg === ".업데이트") { 
        updateBot(replier); 
        return; 
    }
    
    // 1. 테스트 모듈 실행 시도
    try {
        const Tester = require("modules/tester");
        // Tester.check가 true를 반환하면(명령어 수행 완료) 여기서 종료
        if (Tester.check(room, msg, sender, replier, imageDB, isGroupChat)) return;
    } catch (e) {
        // 테스트 모듈이 없거나 에러가 나면 무시하고 다음으로 진행
    }

    // 2. 게임 핸들러 실행 시도
    try {
        const Handler = require("modules/handler");
        Handler.process(room, msg, sender, replier, imageDB, isGroupChat);
    } catch (e) {
        // 핸들러 에러 시 로그 기록
        Log.error("Handler Error: " + e.message);
    }
}
