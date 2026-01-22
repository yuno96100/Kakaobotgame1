// sdcard/msgbot/Bots/sub/main.js

const Handler = require("./modules/handler");
const BridgeTest = require("sdcard/msgbot/Bots/sub/modules/bridge_test");


function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    
    // [1] 이름 정제 (오픈프로필 대응)
    var senderName = sender.toString().split("\n")[0].trim();

    // [2] 관리자 업데이트 (기존 1번 세트 고정 기능)
    // 메인폰 이름이 '관리자'이므로 senderName으로 검사합니다.
    if (msg === ".업데이트" && senderName === "관리자") {
        updateBot(replier); 
        return;
    }

    // [3] 연동 테스트 섹션 (새로 추가)
    // 접두사 '.'으로 시작하는 연동 명령어 처리
    if (msg.startsWith(".연동")) {
        BridgeTest.process(room, msg, senderName, replier);
        return;
    }

    // [4] 기존 게임 로직 (1번 세트 핸들러)
    // .정보, .캐릭터, .출석 등의 기존 기능을 그대로 수행합니다.
    Handler.process(msg, senderName, replier);
}

// 깃허브 업데이트 함수 (기존 구조 유지)
function updateBot(replier) {
    replier.reply("🔄 시스템 업데이트를 시작합니다...");
    // 업데이트 로직 실행...
}
