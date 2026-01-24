// [modules/handler.js]
const Handler = {};

// --- [환경 설정] ---
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; // 1:1 개인톡 링크
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";      // 데이터 저장 경로
const TARGET_ROOM_NAME = "게임봇"; // 실제 단체방 이름 (정확히 일치해야 함)
const MASTER_HASH = "236652781"; // 관리자(사용자님)의 고유 해시값

/**
 * [유저 등록 확인 함수]
 * 닉네임을 기반으로 데이터 파일 존재 여부를 체크합니다.
 */
function isUserRegistered(sender) {
    var file = new java.io.File(DATA_PATH + sender + ".json");
    return file.exists();
}

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    // 1. 기본 정보 추출
    const userHash = String(imageDB.getProfileHash()).trim();
    const FILE_PATH = DATA_PATH + sender + ".json";
    const registered = isUserRegistered(sender);

    // 2. [관리자 전용] .테스트 명령어 (방 고유 정보 확인용)
    if (msg === ".테스트" && userHash === MASTER_HASH) {
        var testInfo = "🧪 [시스템 디버그 모드]\n━━━━━━━━━━━━━━\n";
        testInfo += "👤 유저닉네임: " + sender + "\n";
        testInfo += "🔑 유저해시(방 기준): " + userHash + "\n";
        testInfo += "🏠 현재방이름: [" + room + "]\n";
        testInfo += "👥 채팅타입: " + (isGroupChat ? "단체톡방" : "개인톡방") + "\n";
        testInfo += "📂 데이터파일: " + (registered ? "존재함" : "없음") + "\n";
        testInfo += "━━━━━━━━━━━━━━";
        replier.reply(testInfo);
        return;
    }

    // 3. 단체방('게임봇') 전용 로직 및 차단
    if (isGroupChat && room.trim() === TARGET_ROOM_NAME) {
        // 관리자 명령어 예외 (.업데이트 등)
        if (msg.startsWith(".업데이트")) return;

        // [A] 가입하지 않은 유저가 채팅 시
        if (!registered && msg !== ".가입") {
            var regWarn = "📢 [" + sender + "]님은 등록되지 않은 소환사입니다.\n";
            regWarn += "대화 참여를 위해 [.가입]을 입력해 주세요!\n";
            regWarn += "🔗 개인톡: " + PRIVATE_LINK;
            replier.reply(regWarn);
            return;
        }

        // [B] 가입된 유저가 단체방에서 명령어(.) 입력 시 차단
        if (msg.startsWith(".") && msg !== ".가입") {
            var blockMsg = "⚠️ [" + sender + "] 소환사님, 모든 게임 조작은 개인톡에서만 가능합니다.\n";
            blockMsg += "🔗 1:1 개인톡: " + PRIVATE_LINK;
            replier.reply(blockMsg);
            return; 
        }
    }

    // 4. [.가입] 명령어 (닉네임 기반 등록)
    if (msg === ".가입") {
        if (registered) {
            replier.reply("✅ [" + sender + "]님은 이미 가입되어 있습니다.");
        } else {
            if (!new java.io.File(DATA_PATH).exists()) new java.io.File(DATA_PATH).mkdirs();
            
            var userData = {
                "name": sender,
                "level": 1,
                "money": 1000,
                "joinDate": new Date().toLocaleString()
            };
            FileStream.write(FILE_PATH, JSON.stringify(userData, null, 4));
            
            var success = "🎊 [가입 성공] " + sender + "님 환영합니다!\n";
            success += "이제 개인톡에서 다양한 활동을 시작해 보세요.\n\n";
            success += "🔗 1:1 개인톡: " + PRIVATE_LINK;
            replier.reply(success);
        }
        return;
    }

    // 5. 개인톡(1:1방) 전용 게임 로직
    if (!isGroupChat) {
        // 미가입자 접근 차단
        if (!registered) {
            replier.reply("❌ 가입되지 않았습니다. 단체방이나 이곳에서 [.가입]을 먼저 진행해 주세요.");
            return;
        }

        // [.내정보] 명령어
        if (msg === ".내정보") {
            try {
                var data = JSON.parse(FileStream.read(FILE_PATH));
                var info = "🔍 [" + data.name + "] 소환사 정보\n━━━━━━━━━━━━━━\n";
                info += "⭐ 레벨: " + data.level + "\n";
                info += "💵 자산: " + data.money + "원\n";
                info += "📅 등록일: " + data.joinDate;
                replier.reply(info);
            } catch(e) {
                replier.reply("❌ 데이터를 불러오는 중 오류가 발생했습니다.");
            }
        }
    }
};

module.exports = Handler;
