// main.js 파일 (또는 스크립트 메인 부분)

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg.startsWith(".")) {
        // ⭐ 이 순서를 반드시 지켜야 합니다! (5개 인자)
        // Handler.process(방이름, 메세지, 보낸이, 단톡여부, 응답기)
        Handler.process(room, msg, sender, isGroupChat, replier);
    }
}
