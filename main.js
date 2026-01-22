// sdcard/msgbot/Bots/sub/main.js

const PATH = "sdcard/msgbot/Bots/sub/modules/";
var BridgeTest;

// [안전장치] 모듈 로딩 시 에러가 나면 채팅방에 알림을 띄우도록 설정
try {
    BridgeTest = require(PATH + "bridge_test");
} catch (e) {
    // 이 메시지가 뜨면 파일 경로 문제입니다.
    // BridgeTest = null;
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    var senderName = sender.toString().split("\n")[0].trim();
    if (!msg.startsWith(".")) return;

    // 1. 작동 확인용 디버깅 (이건 무조건 작동해야 함)
    if (msg === ".체크") {
        replier.reply("✅ 시스템 응답 중\n📍 현재 방: [" + room + "]\n👤 발신자: [" + senderName + "]");
        return;
    }

    // 2. 작동한다고 하신 업데이트 (기존 로직)
    if (msg === ".업데이트" && senderName === "관리자") {
        updateBot(replier); 
        return;
    }

    // 3. 연동 테스트 (모듈 로딩 확인 후 실행)
    if (msg.startsWith(".연동")) {
        if (!BridgeTest) {
            replier.reply("❌ [시스템] bridge_test 모듈을 찾을 수 없습니다. 경로를 확인하세요.");
            return;
        }
        BridgeTest.process(room, msg, senderName, replier);
        return;
    }
}
