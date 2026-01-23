// [modules/handler.js]
const Handler = {};

// [설정] 
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; 
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";

// [중요] 연동하고자 하는 '게임봇' 단체톡방의 고유 해시값을 여기에 적으세요.
// (해시를 모를 경우 아래 진단 로직을 통해 먼저 확인하세요)
const TARGET_ROOM_HASH = "여기에_방_해시값을_넣으세요"; 

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const roomHash = String(imageDB.getRoomHash()).trim(); // 현재 방의 고유 해시
    const FILE_PATH = DATA_PATH + userHash + ".json";

    // --- [방 해시 확인용 임시 로직] ---
    // 단체방에서 .방해시 라고 치면 나오는 값을 TARGET_ROOM_HASH에 넣으시면 됩니다.
    if (msg === ".방해시") {
        replier.reply("📍 현재 방의 고유 해시:\n" + roomHash);
        return;
    }

    // --- [섹션 A: 특정 단체방 로직] ---
    // 방 이름이 아닌 roomHash를 비교하여 정확한 방을 찾아냅니다.
    if (roomHash === TARGET_ROOM_HASH) {
        var isRegistered = new java.io.File(FILE_PATH).exists();

        if (!isRegistered) {
            if (msg.startsWith(".업데이트") || msg.startsWith(".테스트")) return;

            var guide = "📢 [가입 안내] " + sender + "님!\n\n";
            guide += "아직 게임 등록이 되지 않았습니다.\n";
            guide += "아래 개인톡 링크에서 [.가입]을 먼저 해주세요!\n\n";
            guide += "🔗 1:1 링크: " + PRIVATE_LINK;
            
            replier.reply(guide);
            return;
        }
        return; 
    }

    // --- [섹션 B: 개인톡 로직] ---
    if (!isGroupChat) {
        // 가입 및 내 정보 로직 (기존과 동일)
        if (msg === ".가입") {
            var folder = new java.io.File(DATA_PATH);
            if (!folder.exists()) folder.mkdirs();

            if (new java.io.File(FILE_PATH).exists()) {
                replier.reply("⚠️ 이미 가입된 정보가 있습니다.");
            } else {
                var userData = { "name": sender, "hash": userHash, "level": 1, "money": 1000, "joinDate": new Date().toLocaleString() };
                FileStream.write(FILE_PATH, JSON.stringify(userData, null, 4));
                replier.reply("🎊 가입 성공!");
            }
        }
    }
};

module.exports = Handler;
