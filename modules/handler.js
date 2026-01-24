// [modules/handler.js]
const Handler = {};

// --- [환경 설정] ---
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; 
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";
const TARGET_ROOM_NAME = "게임봇"; // 실제 단체방 이름 (정확히 입력)

/**
 * [유저 체크 함수]
 * 닉네임을 파일명으로 사용하여 데이터 존재 여부를 확인합니다.
 */
function isUserRegistered(sender) {
    var file = new java.io.File(DATA_PATH + sender + ".json");
    return file.exists();
}

    // (테스트용 임시 코드)
    if (msg === ".테스트") {
        replier.reply("방이름: [" + room + "]\n타입: " + (isGroupChat ? "단체" : "개인"));
        return;
    }



Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    // 1. 데이터 경로 설정 (닉네임 기준)
    const FILE_PATH = DATA_PATH + sender + ".json";
    const registered = isUserRegistered(sender);

    // 2. 단체방(게임봇) 차단 로직 (최우선 실행)
    if (isGroupChat && room.trim() === TARGET_ROOM_NAME) {
        // 관리자 명령어 예외
        if (msg.startsWith(".업데이트")) return;

        // [A] 미가입 유저 채팅 제한
        if (!registered && !msg.startsWith(".가입")) {
            replier.reply("📢 [" + sender + "]님은 미등록 상태입니다.\n[.가입]을 입력하여 등록을 완료해 주세요!");
            return;
        }

        // [B] 가입 유저의 게임 명령어(.) 차단 (.가입 제외)
        if (msg.startsWith(".") && msg !== ".가입") {
            var blockMsg = "⚠️ [" + sender + "]님, 게임 조작은 개인톡에서만 가능합니다.\n";
            blockMsg += "🔗 개인톡: " + PRIVATE_LINK;
            replier.reply(blockMsg);
            return; // 단체방에서는 여기서 실행 중단 (내정보 출력 안됨)
        }
    }

    // 3. [.가입] 로직 (닉네임 기반)
    if (msg === ".가입") {
        if (registered) {
            replier.reply("✅ [" + sender + "]님은 이미 등록된 소환사입니다.");
        } else {
            if (!new java.io.File(DATA_PATH).exists()) new java.io.File(DATA_PATH).mkdirs();
            
            var userData = {
                "name": sender,
                "level": 1,
                "money": 1000,
                "joinDate": new Date().toLocaleString(),
                "note": "닉네임 변경 시 데이터가 유실될 수 있습니다."
            };
            FileStream.write(FILE_PATH, JSON.stringify(userData, null, 4));
            
            var success = "🎊 [가입 완료] " + sender + "님 등록 성공!\n";
            success += "이제 어느 방에서든 동일한 데이터로 이용 가능합니다.\n\n";
            success += "🔗 개인톡: " + PRIVATE_LINK;
            replier.reply(success);
        }
        return;
    }

    // 4. 개인톡(1:1방) 전용 로직
    if (!isGroupChat) {
        // 가입 여부 확인
        if (!registered) {
            replier.reply("❌ 가입되지 않았습니다. 단체방이나 이곳에서 [.가입]을 먼저 해주세요.");
            return;
        }

        // [.내정보] 실행
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

