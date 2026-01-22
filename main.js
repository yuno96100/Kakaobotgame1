const Handler = require("./modules/handler");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg.startsWith(".")) {
        try {
            // 인자 순서: 방이름, 메시지, 보낸이, 단톡여부, 응답기
            Handler.process(room, msg, sender, isGroupChat, replier);
        } catch (e) {
            // 에러 발생 시 상세 원인 출력
            replier.reply("❌ 실행 오류: " + e.message + "\n라인: " + e.lineNumber);
        }
    }
}
