const Handler = {};
const User = require("user_manager");
const Room = require("room_manager");

const MASTER_HASH = "236652781"; // 관리자 고유 해시
const roomName = "게임봇"; // 타겟 단체방 이름
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci";

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    // 단체방은 이름 기반 해시, 개인톡은 P_접두사+유저해시로 구분
    const roomHash = isGroupChat ? "G_" + room.split("").reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0) : "P_" + userHash;

    // 모든 방 정보 자동 기록
    Room.saveRoom(room, roomHash);

    // 1. 관리자 명령어: .정보조회
    if (msg === ".정보조회" && userHash === MASTER_HASH) {
        var res = "📊 [시스템 실시간 조회]\n━━━━━━━━━━━━━━\n";
        res += "👤 유저이름: " + sender + "\n";
        res += "🆔 유저해시: " + userHash + "\n\n";
        res += "🏠 현재방명: " + room + "\n";
        res += "🔑 방 해시: " + roomHash + "\n";
        res += "👥 방 타입: " + (isGroupChat ? "단체톡" : "개인톡") + "\n";
        res += "━━━━━━━━━━━━━━";
        replier.reply(res);
        return;
    }

    // 2. 단체방 로직
    if (isGroupChat && room.trim() === roomName) {
        if (msg === ".가입" || msg === ".시작") {
            replier.reply(sender + "님, 게임 시작은 개인톡에서만 가능합니다!\n🔗 " + PRIVATE_LINK);
        }
        return;
    }

    // 3. 개인톡 로직
    if (!isGroupChat) {
        if (msg === ".가입") {
            if (User.isRegistered(userHash)) {
                replier.reply("✅ 이미 등록된 정보가 존재합니다.\n(ID: " + userHash + ")");
            } else {
                User.register(userHash, sender);
                replier.reply("🎊 가입 성공! 1,000원이 지급되었습니다.\n이제 '.내정보'를 입력해보세요.");
            }
        }

        if (msg === ".내정보") {
            var data = User.getData(userHash);
            if (data) {
                var info = "🔍 [" + data.name + "] 소환사 정보\n━━━━━━━━━━━━━━\n";
                info += "⭐ 레벨: " + data.level + "\n";
                info += "💵 자산: " + data.money + "원\n";
                info += "📅 가입일: " + data.joinDate;
                replier.reply(info);
            } else {
                replier.reply("❌ 가입되지 않았습니다. '.가입'을 먼저 해주세요.");
            }
        }
    }
};

module.exports = Handler;
