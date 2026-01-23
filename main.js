// sdcard/msgbot/Bots/sub/main.js

// [주의] 진단을 위해 외부 모듈 로드를 일시 중단합니다.
// const Handler = require("./modules/handler"); 

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    var senderName = sender.toString().split("\n")[0].trim();

    // 1. 최우선 반응 테스트
    if (msg === ".체크") {
        replier.reply("✅ 시스템이 정상 응답 중입니다.");
        return;
    }

    // 2. 방정보 확인 (복사하기 쉬운 형태)
    if (msg === ".방정보") {
        var res = "🔍 [진단 결과]\n";
        res += "────────────────\n";
        res += "📍 Room: " + room + "\n";
        res += "👤 User: " + senderName + "\n";
        res += "🌐 Type: " + (isGroupChat ? "Group" : "Private");
        replier.reply(res);
        return;
    }

    // 3. 관리자 전용
    if (msg === ".업데이트" && senderName === "관리자") {
        replier.reply("🔄 시스템 업데이트 프로세스 대기 중...");
        return;
    }
}
