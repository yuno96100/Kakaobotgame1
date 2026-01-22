// 모듈 로드
const Handler = require("./modules/handler");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    // 1. 관리자 업데이트 명령어는 유지
    if (msg === "/업데이트" && sender === "관리자") {
        updateBot(replier); // updateBot 함수는 여기에 포함되어 있어야 함
        return;
    }

    // 2. 그 외 모든 게임 명령어는 핸들러로 전달
    Handler.process(msg, sender, replier);
}
