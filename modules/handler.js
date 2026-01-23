// [modules/handler.js]
const Handler = {};

// --- [환경 설정] ---
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; // 1:1 개인톡 링크
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";      // 유저 데이터 저장 경로
const TARGET_ROOM_NAME = "게임봇"; // 실제 단체방 이름

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const FILE_PATH = DATA_PATH + userHash + ".json";
    const isRegistered = new java.io.File(FILE_PATH).exists();

    // 1. [.가입] 명령어 처리 (단체방/개인톡 어디서든 가능)
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
            
            var success = "🎊 [가입 완료] " + sender + "님 등록 성공!\n";
            success += "이제 단체방 활동이 가능합니다.\n\n";
            success += "💡 메뉴 조작(상점, 정보 등)은 개인톡을 이용해 주세요!\n";
            success += "🔗 1:1 개인톡: " + PRIVATE_LINK;
            replier.reply(success);
        }
        return; // 가입 로직 수행 후 종료
    }

    // 2. 단체방('게임봇') 제한 및 링크 유도 로직
    if (room === TARGET_ROOM_NAME && isGroupChat) {
        // 관리자용 업데이트 명령어는 통과
        if (msg.startsWith(".업데이트")) return;

        // [A] 미가입 유저가 채팅을 칠 경우
        if (!isRegistered) {
            var regGuide = "📢 [" + sender + "]님은 아직 등록되지 않았습니다.\n";
            regGuide += "[.가입]을 입력하여 소환사 등록을 해주세요!\n";
            regGuide += "🔗 개인톡: " + PRIVATE_LINK;
            replier.reply(regGuide);
            return;
        }

        // [B] 가입된 유저가 단체방에서 명령어(.)를 쓸 경우 (가장 중요한 차단 로직)
        if (msg.startsWith(".")) {
            var blockMsg = "⚠️ [안내] " + sender + "님, 단체방에서는 대화만 가능합니다.\n\n";
            blockMsg += "명령어 조작은 개인톡(1:1)에서 진행해 주세요!\n";
            blockMsg += "🔗 개인톡 링크: " + PRIVATE_LINK;
            replier.reply(blockMsg);
            return; // 단체방에서는 여기서 실행 중단 (내정보 출력 방지)
        }
    }

    // 3. 개인톡(1:1방) 전용 로직
    if (!isGroupChat) {
        if (!isRegistered) {
            replier.reply("❌ 미가입 소환사입니다. 먼저 [.가입]을 입력해 주세요.");
            return;
        }

        // 개인톡에서만 실행되는 [.내정보]
        if (msg === ".내정보") {
            var data = JSON.parse(FileStream.read(FILE_PATH));
            var info = "🔍 [" + data.name + "] 소환사 정보\n━━━━━━━━━━━━━━\n";
            info += "⭐ 레벨: " + data.level + "\n";
            info += "💵 자산: " + data.money + "원\n";
            info += "📅 등록일: " + data.joinDate;
            replier.reply(info);
        }
    }
};

module.exports = Handler;
