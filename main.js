const Handler = require("./modules/handler");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg.startsWith(".")) {
        try {
            // [중요] 반드시 이 순서를 지켜야 합니다: room, msg, sender, isGroupChat, replier
            Handler.process(room, msg, sender, isGroupChat, replier);
        } catch (e) {
            // replier가 살아있는지 확인 후 에러 출력
            if (replier) {
                replier.reply("❌ 실행 오류: " + e.message);
            } else {
                Log.error("핸들러 실행 오류 (replier 미정의): " + e.message);
            }
        }
    }
}
