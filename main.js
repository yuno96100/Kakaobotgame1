const Handler = require("./modules/handler");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    /**
     * V1.2.2 시스템 입구
     * 모든 명령어는 마침표(.)로 시작할 때만 핸들러로 전달됩니다.
     */
    if (msg.startsWith(".")) {
        // [순서] 방이름, 메시지, 보낸사람, 단체채팅여부, 답장도구
        Handler.process(room, msg, sender, isGroupChat, replier);
    }
}
