// [modules/handler.js]
const Handler = {};

// --- [환경 설정] ---
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; // 1:1 개인톡 링크
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";      // 데이터 저장 경로

// [중요] .방해시 명령어로 확인한 단체방 해시값을 여기에 넣으세요.
const TARGET_ROOM_HASH = "여기에_방_해시값을_입력하세요"; 

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const roomHash = String(imageDB.getRoomHash()).trim(); // 현재 방의 고유 해시
    const FILE_PATH = DATA_PATH + userHash + ".json";

    // 1. 방 해시 확인 (최초 설정용)
    if (msg === ".방해시") {
        replier.reply("📍 현재 방의 고유 해시:\n" + roomHash);
        return;
    }

    // --- [섹션 A: 단체방 로직] ---
    // TARGET_ROOM_HASH와 현재 방 해시가 일치할 때만 작동
    if (roomHash === TARGET_ROOM_HASH) {
        var isRegistered = new java.io.File(FILE_PATH).exists();

        if (!isRegistered) {
            if (msg.startsWith(".업데이트") || msg.startsWith(".테스트")) return;

            var guide = "📢 [가입 안내] " + sender + "님!\n\n";
            guide += "현재 게임 데이터가 생성되지 않았습니다.\n";
            guide += "아래 개인톡 링크에서 [.가입]을 먼저 진행해주세요!\n\n";
            guide += "🔗 1:1 링크: " + PRIVATE_LINK + "\n\n";
            guide += "개인톡 입장 후 [.가입]을 입력하세요.";
            
            replier.reply(guide);
            return;
        }
        return; 
    }

    // --- [섹션 B: 개인톡(1:1방) 로직] ---
    if (!isGroupChat) {
        // [명령어: .가입]
        if (msg === ".가입") {
            var folder = new java.io.File(DATA_PATH);
            if (!folder.exists()) folder.mkdirs();

            if (new java.io.File(FILE_PATH).exists()) {
                replier.reply("⚠️ 이미 가입된 계정입니다.\nID: " + userHash);
            } else {
                var userData = {
                    "name": sender,
                    "hash": userHash,
                    "level": 1,
                    "money": 1000,
                    "joinDate": new Date().toLocaleString()
                };
                FileStream.write(FILE_PATH, JSON.stringify(userData, null, 4));
                replier.reply("🎊 가입 완료! 초기 자금 1,000원이 지급되었습니다.");
            }
        }

        // [명령어: .내정보]
        if (msg === ".내정보") {
            var data = FileStream.read(FILE_PATH);
            if (data) {
                var user = JSON.parse(data);
                var info = "🔍 [" + user.name + "]님의 정보\n";
                info += "━━━━━━━━━━━━━━\n";
                info += "⭐ 레벨: " + user.level + "\n";
                info += "💵 자산: " + user.money + "원\n";
                info += "📅 가입일: " + user.joinDate;
                replier.reply(info);
            } else {
                replier.reply("❌ 가입 정보가 없습니다. [.가입]을 먼저 해주세요.");
            }
        }
    }
};

module.exports = Handler;
