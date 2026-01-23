// [modules/handler.js]
const Handler = {};

// --- [환경 설정] ---
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; 
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";
const TARGET_ROOM_NAME = "게임봇"; // 실제 단체방 이름

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const FILE_PATH = DATA_PATH + userHash + ".json";
    const isRegistered = new java.io.File(FILE_PATH).exists();

    // [1] 가입 명령어 (.가입) - 단체방/개인톡 어디서든 가능
    if (msg === ".가입") {
        if (isRegistered) {
            replier.reply("✅ [" + sender + "]님은 이미 가입된 상태입니다.");
        } else {
            if (!new java.io.File(DATA_PATH).exists()) new java.io.File(DATA_PATH).mkdirs();
            var userData = {
                "name": sender,
                "hash": userHash,
                "level": 1,
                "money": 1000,
                "joinDate": new Date().toLocaleString()
            };
            FileStream.write(FILE_PATH, JSON.stringify(userData, null, 4));
            replier.reply("🎊 [가입 완료] " + sender + "님 등록 성공!\n이제 단체방 활동 및 개인톡 게임이 가능합니다.");
        }
        return;
    }

    // [2] 단체방('게임봇') 전용 로직
    if (room === TARGET_ROOM_NAME && isGroupChat) {
        if (msg.startsWith(".업데이트")) return; // 관리자 예외

        // 미가입자 대화 제한
        if (!isRegistered) {
            replier.reply("📢 [" + sender + "]님, 가입 후 이용 가능합니다!\n[.가입]을 입력하여 등록해 주세요.");
            return;
        }

        // 가입자라도 단체방에서 조작 기능(.내정보 등) 사용 시 차단
        if (msg.startsWith(".")) {
            var blockMsg = "⚠️ [안내] " + sender + "님, 모든 게임 조작은 개인톡에서만 가능합니다.\n";
            blockMsg += "🔗 개인톡: " + PRIVATE_LINK;
            replier.reply(blockMsg);
            return;
        }
    }

    // [3] 개인톡(1:1방) 전용 로직
    if (!isGroupChat) {
        // 단체방에서 가입했다면 여기서도 즉시 활동 가능
        if (!isRegistered) {
            replier.reply("❌ 가입되지 않은 소환사입니다.\n먼저 [.가입]을 입력해 주세요.");
            return;
        }

        // 가입자 전용 명령어 (.내정보)
        if (msg === ".내정보") {
            var data = JSON.parse(FileStream.read(FILE_PATH));
            var info = "🔍 [" + data.name + "] 소환사 정보\n━━━━━━━━━━━━━━\n";
            info += "⭐ 레벨: " + data.level + "\n💵 자산: " + data.money + "원";
            replier.reply(info);
        }
        
        // 추가 게임 기능(상점 등)은 여기에 구현
    }
};

module.exports = Handler;
