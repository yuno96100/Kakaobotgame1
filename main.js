// sdcard/msgbot/Bots/sub/main.js

const USER_DB = require("sdcard/msgbot/Bots/sub/modules/user");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    var senderName = sender.toString().split("\n")[0].trim();
    
    // [설정] 모든 기록이 남을 그룹톡방 이름
    var ADMIN_GROUP_ROOM = "소환사의 협곡"; 

    // 1. 공통 디버깅 명령어
    if (msg === ".체크") {
        replier.reply("✅ 시스템 작동 중 (위치: " + (isGroupChat ? "그룹톡" : "개인톡") + ")");
        return;
    }

    // 2. 유저 조작 로직 (주로 개인톡에서 발생)
    if (!isGroupChat) {
        // [예시] .가입 명령어
        if (msg === ".가입") {
            var userData = USER_DB.get(senderName);
            replier.reply("🎮 [" + senderName + "]님, 가입을 환영합니다!");
            
            // ⭐ 핵심: 개인톡 조작 결과를 그룹톡에 전송
            replier.reply(ADMIN_GROUP_ROOM, "📢 [신규 유저]: " + senderName + "님이 방금 가입하셨습니다!");
            return;
        }

        // [예시] .강화 (도박 등 결과 보고)
        if (msg === ".강화") {
            // 강화 로직 실행...
            replier.reply("✨ 강화에 성공하셨습니다!");
            
            // ⭐ 핵심: 중요한 조작 내역을 그룹톡에 기록
            replier.reply(ADMIN_GROUP_ROOM, "🔥 [강화 성공]: " + senderName + "님이 +10 강화에 성공했습니다!");
            return;
        }
    }

    // 3. 관리자 전용 명령어 (개인톡/그룹톡 어디서든 '관리자'만 가능)
    if (senderName === "관리자" && msg === ".업데이트") {
        updateBot(replier);
        return;
    }
}
