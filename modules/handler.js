const Handler = {};
const User = require("user_manager");
const Room = require("room_manager");

// 일단 MASTER_HASH 체크를 잠시 무시하고 누구나 조회 가능하게 로직을 짭니다.
Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const roomHash = isGroupChat ? "G_" + room.split("").reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0) : "P_" + userHash;

    Room.saveRoom(room, roomHash);

    // [중요] 누구에게나 응답하도록 설정 (해시값 확인용)
    if (msg === ".정보조회") {
        var res = "📊 [시스템 데이터 확인]\n━━━━━━━━━━━━━━\n";
        res += "👤 발신자: " + sender + "\n";
        res += "🆔 내 해시값: " + userHash + "\n\n"; // 여기서 나오는 번호를 꼭 기억하세요!
        res += "🏠 방이름: " + room + "\n";
        res += "🔑 방해시: " + roomHash + "\n";
        res += "━━━━━━━━━━━━━━";
        replier.reply(res);
        return;
    }

    // --- 기존 단체방/개인톡 로직 ---
    if (isGroupChat && room.trim() === "게임봇") {
        if (msg === ".가입") replier.reply(sender + "님, 개인톡에서 진행해 주세요!");
        return;
    }

    if (!isGroupChat && msg === ".가입") {
        if (User.isRegistered(userHash)) {
            replier.reply("✅ 이미 가입된 유저입니다.\nID: " + userHash);
        } else {
            User.register(userHash, sender);
            replier.reply("🎊 가입 성공! 1,000원이 지급되었습니다.");
        }
    }
};

module.exports = Handler;
