// [modules/tester.js]
const Tester = {};

const MASTER_HASH = "236652781"; // 관리자님의 고유 해시값

Tester.check = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();

    // 오직 관리자가 .테스트 라고 쳤을 때만 작동
    if (msg === ".테스트" && userHash === MASTER_HASH) {
        var info = "🧪 [독립 테스트 모듈]\n━━━━━━━━━━━━━━\n";
        info += "🆔 방 고유코드: " + userHash + "\n";
        info += "🏠 방 이름: [" + room + "]\n";
        info += "👥 채팅 타입: " + (isGroupChat ? "단체톡" : "개인톡") + "\n";
        info += "👤 발신자: " + sender + "\n";
        info += "━━━━━━━━━━━━━━";
        replier.reply(info);
        return true; // 테스트 명령어를 수행했음을 알림
    }
    return false;
};

module.exports = Tester;
