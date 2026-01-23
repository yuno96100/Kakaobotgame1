// [modules/handler.js]
const Handler = {};

// --- [환경 설정] ---
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; 
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";
const TARGET_ROOM_NAME = "게임봇"; 

/**
 * [채팅 처리 로직]
 * 단체방에서의 가입(.가입) 처리를 최우선으로 작동하게 설계했습니다.
 */
Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const FILE_PATH = DATA_PATH + userHash + ".json";
    const isRegistered = new java.io.File(FILE_PATH).exists();

    // 1. [.가입] 명령어 처리 (단체방/개인톡 공통)
    if (msg === ".가입") {
        if (isRegistered) {
            replier.reply("✅ [" + sender + "]님은 이미 등록된 소환사입니다.");
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
            
            var successMsg = "🎊 [가입 완료] " + sender + " 소환사님, 환영합니다!\n";
            successMsg += "단체방에서 활동이 가능해졌습니다.\n\n";
            successMsg += "💡 상세 메뉴(상점, 정보 등)는 개인톡을 이용해 주세요!\n";
            successMsg += "🔗 1:1 개인톡: " + PRIVATE_LINK;
            replier.reply(successMsg);
        }
        return; // 가입 로직 종료
    }

    // 2. 단체방('게임봇') 제한 로직
    if (room === TARGET_ROOM_NAME && isGroupChat) {
        // 관리자 명령어 예외
        if (msg.startsWith(".업데이트")) return;

        // 미가입 유저가 채팅을 칠 경우
        if (!isRegistered) {
            var warn = "📢 [" + sender + "]님은 미등록 소환사입니다.\n";
            warn += "채팅 참여를 위해 [.가입]을 먼저 입력해 주세요!";
            replier.reply(warn);
            return;
        }

        // 등록된 유저가 게임 명령어를 단체방에서 쓸 경우
        if (msg.startsWith(".")) {
            replier.reply("⚠️ 게임 조작은 개인톡(1:1)에서만 가능합니다.\n🔗 " + PRIVATE_LINK);
            return;
        }
    }

    // 3. 개인톡(1:1방) 전용 로직
    if (!isGroupChat) {
        if (msg === ".내정보") {
            if (isRegistered) {
                var data = JSON.parse(FileStream.read(FILE_PATH));
                var info = "🔍 [" + data.name + "] 정보\n━━━━━━━━━━━━━━\n";
                info += "⭐ 레벨: " + data.level + "\n💵 자산: " + data.money + "원";
                replier.reply(info);
            } else {
                replier.reply("❌ 가입되지 않았습니다. [.가입]을 먼저 입력해 주세요.");
            }
        }
    }
};

module.exports = Handler;
