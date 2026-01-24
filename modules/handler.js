// [modules/handler.js]
const Handler = {};

// --- [환경 설정] ---
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; 
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";
const TARGET_ROOM_NAME = "게임봇"; 

// 단체방 차단 명령어 리스트
const BLOCKED_COMMANDS = [".내정보", ".상점", ".강화", ".출석", ".도움말", ".인벤토리"];

/**
 * [유저 체크 함수]
 * 해당 유저의 해시값 파일이 존재하는지 확인합니다.
 */
function checkUserRegistered(userHash) {
    var file = new java.io.File(DATA_PATH + userHash + ".json");
    return file.exists();
}

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const FILE_PATH = DATA_PATH + userHash + ".json";
    
    // 유저체크 명령어를 통한 등록 여부 확인
    const isRegistered = checkUserRegistered(userHash);

    // 1. [.가입] 명령어 (최우선 처리)
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
            replier.reply("🎊 [가입 완료] " + sender + "님 등록 성공!\n이제 모든 기능을 이용할 수 있습니다.\n🔗 개인톡: " + PRIVATE_LINK);
        }
        return;
    }

    // 2. 단체방('게임봇') 전용 로직
    if (room === TARGET_ROOM_NAME && isGroupChat) {
        if (msg.startsWith(".업데이트")) return;

        // [등록 여부 확인 절차]
        if (!isRegistered) {
            var regWarn = "📢 [" + sender + "]님은 미등록 상태입니다.\n[.가입]을 입력하여 등록을 완료해 주세요!";
            replier.reply(regWarn);
            return;
        }

        // [차단 명령어 확인 절차]
        var isBlocked = BLOCKED_COMMANDS.some(cmd => msg.startsWith(cmd)) || (msg.startsWith(".") && msg !== ".가입");
        if (isBlocked) {
            replier.reply("⚠️ 이 기능은 개인톡에서만 가능합니다.\n🔗 " + PRIVATE_LINK);
            return;
        }
    }

    // 3. 개인톡(1:1방) 전용 로직
    if (!isGroupChat) {
        // [등록 여부 재확인 절차] - 가입 안 됐으면 모든 기능 차단
        if (!isRegistered) {
            replier.reply("❌ 가입되지 않은 소환사입니다.\n먼저 [.가입] 명령어를 통해 등록을 진행해 주세요.");
            return;
        }

        // 가입이 확인된 유저만 아래 명령어 수행 가능
        if (msg === ".내정보") {
            try {
                var data = JSON.parse(FileStream.read(FILE_PATH));
                var info = "🔍 [" + data.name + "] 소환사 정보\n━━━━━━━━━━━━━━\n";
                info += "⭐ 레벨: " + data.level + "\n";
                info += "💵 자산: " + data.money + "원\n";
                info += "📅 등록일: " + data.joinDate;
                replier.reply(info);
            } catch(e) {
                replier.reply("❌ 데이터 로드 중 오류가 발생했습니다.");
            }
        }
    }
};

module.exports = Handler;
