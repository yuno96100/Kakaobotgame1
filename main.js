// sdcard/msgbot/Bots/sub/main.js

// [주의] Handler 모듈이 없어도 에러로 멈추지 않도록 try-catch 처리
var Handler;
try {
    Handler = require("./modules/handler");
} catch (e) {
    Handler = null;
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    var senderName = sender.toString().split("\n")[0].trim();

    // 1. 무조건 반응해야 하는 진단 명령어 (코드 상단 배치)
    if (msg === ".체크" || msg === ".방정보") {
        var res = "🔍 [시스템 진단 결과]\n";
        res += "────────────────\n";
        res += "📍 Room: " + room + "\n";
        res += "👤 User: " + senderName + "\n";
        res += "🌐 Type: " + (isGroupChat ? "Group" : "Private") + "\n";
        res += "📅 현재 로드된 버전: 1.0.4";
        replier.reply(res);
        return;
    }

    // 2. 관리자님이 작동한다고 하신 업데이트 명령어
    if (msg === ".업데이트" && senderName === "관리자") {
        replier.reply("🔄 [1.0.4] 버전 업데이트 및 리로드 시도...");
        // 업데이트 로직 실행...
        return;
    }

    // 3. 기존 1번 세트 핸들러 (모듈이 있을 때만 실행)
    if (Handler && typeof Handler.process === "function") {
        try {
            Handler.process(msg, senderName, replier);
        } catch (e) {
            // 핸들러 내부 에러 시 무반응 방지
        }
    }
}
