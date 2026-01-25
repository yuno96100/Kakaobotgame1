// [modules/handler.js]
const Handler = {};
const User = require("user_manager");
const Room = require("room_manager");

const MASTER_HASH = "236652781"; // 관리자 고유 해시
const targetRoomName = "게임봇";

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    // 방 고유값은 보통 1:1방은 유저해시와 같고, 단톡은 고유값이 생깁니다.
    // 여기서는 간단하게 현재 대화방의 정보를 무조건 기록하도록 합니다.
    const roomHash = isGroupChat ? "G_" + room.split("").reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0) : "P_" + userHash;

    // 자동으로 현재 방 정보 기록/업데이트
    Room.saveRoom(room, roomHash);

    // 1. 관리자 전용: .정보조회
    if (msg === ".정보조회" && userHash === MASTER_HASH) {
        var userData = User.getData(userHash);
        var res = "📊 [실시간 데이터 조회]\n━━━━━━━━━━━━━━\n";
        res += "👤 [유저 정보]\n";
        res += "- 이름: " + sender + "\n";
        res += "- 해시: " + userHash + "\n\n";
        res += "🏠 [현재 방 정보]\n";
        res += "- 방이름: " + room + "\n";
        res += "- 방해시: " + roomHash + "\n";
        res += "- 타입: " + (isGroupChat ? "그룹톡" : "개인톡") + "\n";
        res += "━━━━━━━━━━━━━━";
        replier.reply(res);
        return;
    }

    // 2. 단체방 로직
    if (isGroupChat && room.trim() === targetRoomName) {
        if (msg === "!가입") {
            replier.reply(sender + "님, 가입은 개인톡에서 가능합니다!");
        }
        return;
    }

    // 3. 개인톡 가입 로직
    if (!isGroupChat && msg === "!가입") {
        if (User.isRegistered(userHash)) {
            replier.reply("✅ 이미 가입된 유저입니다.\nID: " + userHash);
        } else {
            User.register(userHash, sender);
            replier.reply("🎊 가입 성공! 1,000원이 지급되었습니다.");
        }
        return;
    }
};

module.exports = Handler;
