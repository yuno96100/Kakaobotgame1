// [modules/handler.js]
const Handler = {};

// --- [환경 설정] ---
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; 
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";
const TARGET_ROOM_NAME = "게임봇"; 
const MASTER_HASH = "236652781"; // 관리자 해시값

function isUserRegistered(sender) {
    return new java.io.File(DATA_PATH + sender + ".json").exists();
}

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const FILE_PATH = DATA_PATH + sender + ".json";
    const registered = isUserRegistered(sender);

    // --- [신규] 관리자 전용 .테스트 명령어 ---
    if (msg === ".테스트" && userHash === MASTER_HASH) {
        var testInfo = "🧪 [시스템 디버그 센터]\n━━━━━━━━━━━━━━\n";
        testInfo += "👤 유저명: " + sender + "\n";
        testInfo += "🔑 유저해시: " + userHash + "\n";
        testInfo += "🏠 방이름: " + room + "\n";
        
        // 방 고유코드 추출 (API 버전에 따라 다를 수 있으나 보통 아래 방식 사용)
        try {
            // imageDB를 통해 방의 고유 식별값을 가져오는 시도
            testInfo += "🆔 방고유코드: " + imageDB.getProfileHash() + "\n"; 
        } catch(e) {
            testInfo += "🆔 방고유코드: 확인불가\n";
        }

        testInfo += "👥 채팅형태: " + (isGroupChat ? "단체톡방" : "개인톡방") + "\n";
        testInfo += "📂 가입여부: " + (registered ? "완료" : "미가입") + "\n";
        testInfo += "━━━━━━━━━━━━━━";
        replier.reply(testInfo);
        return;
    }

    // --- 단체방 차단 로직 (기존과 동일) ---
    if (isGroupChat && room.trim() === TARGET_ROOM_NAME) {
        if (msg.startsWith(".업데이트")) return;

        if (!registered && !msg.startsWith(".가입")) {
            replier.reply("📢 [" + sender + "]님은 미등록 상태입니다.\n[.가입]을 입력해 주세요!");
            return;
        }

        if (msg.startsWith(".") && msg !== ".가입") {
            replier.reply("⚠️ 게임 조작은 개인톡에서만 가능합니다.\n🔗 " + PRIVATE_LINK);
            return;
        }
    }

    // --- [.가입] 및 개인톡 로직 (기존과 동일) ---
    if (msg === ".가입") {
        if (registered) {
            replier.reply("✅ [" + sender + "]님은 이미 가입되어 있습니다.");
        } else {
            if (!new java.io.File(DATA_PATH).exists()) new java.io.File(DATA_PATH).mkdirs();
            var userData = { "name": sender, "level": 1, "money": 1000, "joinDate": new Date().toLocaleString() };
            FileStream.write(FILE_PATH, JSON.stringify(userData, null, 4));
            replier.reply("🎊 [가입 완료] " + sender + "님 등록 성공!\n🔗 개인톡: " + PRIVATE_LINK);
        }
        return;
    }

    if (!isGroupChat && registered) {
        if (msg === ".내정보") {
            var data = JSON.parse(FileStream.read(FILE_PATH));
            replier.reply("🔍 [" + data.name + "] 정보\n⭐ 레벨: " + data.level + "\n💵 자산: " + data.money + "원");
        }
    }
};

module.exports = Handler;
