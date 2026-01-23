
// sdcard/msgbot/Bots/sub/main.js

const Handler = require("./modules/handler");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    
    // [1] 발신자 이름 정제 (오픈프로필 대응)
    var senderName = sender.toString().split("\n")[0].trim();

    // [2] 방 정보 및 닉네임 확인 테스트 (신규 추가)
    if (msg === ".방정보") {
        var res = "🔍 [시스템 정보 확인]\n";
        res += "────────────────\n";
        res += "📍 방 이름 (room): [" + room + "]\n";
        res += "👤 발신자 (sender): [" + senderName + "]\n";
        res += "🌐 채팅 형태: " + (isGroupChat ? "그룹톡" : "개인톡");
        replier.reply(res);
        return;
    }

    // [3] 관리자 전용 명령어
    if (msg === ".업데이트" && senderName === "관리자") {
        updateBot(replier); 
        return;
    }

    // [4] 환영 인사 로직
    if (msg === ".환영") {
        replier.reply("🌟 안녕하세요! 매일 성장하는 게임봇입니다.\n\n시작하려면 [.가입]을 입력해주세요!");
        return;
    }

    // [5] 메인 핸들러 연결 (1번 세트의 .가입, .캐릭터 등 처리)
    try {
        Handler.process(msg, senderName, replier);
    } catch (e) {
        // 핸들러 파일이 없거나 오류 발생 시 로그 출력
        // Log.error("Handler 실행 오류: " + e.message);
    }
}

// 소스 갱신 함수
function updateBot(replier) {
    replier.reply("🔄 시스템 업데이트를 시작합니다...");
    // 갱신 로직 실행 구역
}
