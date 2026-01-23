// 모듈 로드 (경로 주의: ./modules/ 폴더 안에 handler.js가 있어야 함)
const Handler = require("./modules/handler");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    
    // 1. 관리자 전용 봇 소스 업데이트 명령어
    if (msg === "/업데이트" && sender === "관리자") {
        try {
            // 캐시된 모듈 삭제 (수정된 코드를 즉시 반영하기 위함)
            delete require.cache[require.resolve("./modules/handler")];
            delete require.cache[require.resolve("./modules/user")];
            delete require.cache[require.resolve("./modules/admin")];
            
            // 전역 변수 등 필요시 다시 로드
            // updateBot(replier); // 필요 시 기존에 쓰시던 업데이트 함수 호출
            
            replier.reply("관리자", "✅ 시스템 소스가 최신 버전(v1.0.7)으로 갱신되었습니다.");
        } catch (e) {
            replier.reply("관리자", "❌ 업데이트 중 오류 발생: " + e.message);
        }
        return;
    }

    // 2. 모든 메시지를 Handler로 전달
    // handler.js 내부의 Handler.process 함수를 호출합니다.
    try {
        Handler.process(msg, sender, replier);
    } catch (e) {
        // 에러 발생 시 로그 출력 (디버깅용)
        Api.replyRoom(room, "⚠️ 시스템 오류가 발생했습니다.\n로그를 확인해주세요.");
        Log.error("Handler Error: " + e.message + "\nLine: " + e.lineNumber);
    }
}
