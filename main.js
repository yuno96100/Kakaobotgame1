// sdcard/msgbot/Bots/sub/main.js

// [1] 모듈 로드 (절대 경로 사용으로 로딩 오류 방지)
const PATH = "sdcard/msgbot/Bots/sub/modules/";
const Handler = require(PATH + "handler");
const BridgeTest = require(PATH + "bridge_test");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    
    // [2] 발신자 이름 및 방 이름 정제 (오픈프로필/줄바꿈 대응)
    var senderName = sender.toString().split("\n")[0].trim();
    
    // [3] 디버깅용: 현재 방 이름 확인 (연동 안 될 때 필수 체크)
    if (msg === ".방이름") {
        replier.reply("📍 현재 방 이름: [" + room + "]\n👤 발신자명: [" + senderName + "]");
        return;
    }

    // [4] 관리자 업데이트 (메인폰 '관리자' 전용)
    if (msg === ".업데이트" && senderName === "관리자") {
        updateBot(replier); 
        return;
    }

    // [5] 연동 테스트 섹션 (.연동체크, .연동전송)
    if (msg.startsWith(".연동")) {
        BridgeTest.process(room, msg, senderName, replier);
        return;
    }

    // [6] 기존 게임 명령어 핸들러 (1번 세트 로직)
    // .가입, .메뉴, .정보, .캐릭터 등을 처리합니다.
    try {
        Handler.process(msg, senderName, replier);
    } catch (e) {
        // 게임 모듈 에러 시 로그 출력
        Log.error("Handler Error: " + e.message);
    }
}

// 깃허브 업데이트 및 소스 갱신 함수
function updateBot(replier) {
    replier.reply("🔄 [시스템] 서버로부터 최신 코드를 동기화합니다...");
    // 여기에 관리자님의 깃허브 다운로드 로직을 추가하세요.
}
