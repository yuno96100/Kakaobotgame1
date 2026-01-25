// [modules/handler.js]
const Handler = {};
const User = require("user_manager");
const Room = require("room_manager");

const MASTER_HASH = "236652781"; 
const roomName = "게임봇"; // 타겟 단체방 이름
const PRIVATE_LINK = "https://open.kakao.com/o/sXXXXXX";

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    
    // 방 고유 해시 생성 (단체방은 이름 기반 해시, 개인톡은 유저 해시 기반)
    const roomHash = isGroupChat ? "G_" + room.split("").reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0) : "P_" + userHash;

    // 모든 대화가 일어나는 방 정보를 자동으로 저장
    Room.saveRoom(room, roomHash);

    // --- [1. 관리자 명령어] ---
    if (msg === ".정보조회" && userHash === MASTER_HASH) {
        var res = "📊 [데이터 통합 조회]\n━━━━━━━━━━━━━━\n";
        res += "👤 유저명: " + sender + "\n";
        res += "🆔 유저해시: " + userHash + "\n\n";
        res += "🏠 현재방: " + room + "\n";
        res += "🔑 방해시: " + roomHash + "\n";
        res += "👥 타입: " + (isGroupChat ? "그룹" : "개인") + "\n";
        res += "━━━━━━━━━━━━━━";
        replier.reply(res);
        return;
    }

    // --- [2. 단체방 로직] ---
    if (isGroupChat && room.trim() === roomName) {
        if (msg === ".가입" || msg === ".시작") {
            var m = sender + "님, 게임 시작은 개인톡에서 가능합니다!\n🔗 " + PRIVATE_LINK;
            replier.reply(m);
        }
        return;
    }

    // --- [3. 개인톡 로직] ---
    if (!isGroupChat) {
        // [.가입]
        if (msg === ".가입") {
            if (User.isRegistered(userHash)) {
                replier.reply("✅ 이미 가입된 정보가 있습니다.\nID: " + userHash);
            } else {
                User.register(userHash, sender);
                replier.reply("🎊 가입 성공! 1,000원이 지급되었습니다.\n이제 '.내정보'를 입력해보세요.");
            }
        }

        // [.내정보]
        if (msg === ".내정보") {
            var data = User.getData(userHash);
            if (data) {
                var info = "🔍 [" + data.name + "] 정보\n━━━━━━━━━━━━━━\n";
                info += "⭐ 레벨: " + data.level + "\n";
                info += "💵 자산: " + data.money + "원\n";
                info += "📅 가입: " + data.joinDate;
                replier.reply(info);
            } else {
                replier.reply("❌ 가입되지 않았습니다. '.가입'을 먼저 해주세요.");
            }
        }
    }
};

module.exports = Handler;
