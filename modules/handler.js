// [modules/handler.js]
const Handler = {};

// --- [환경 설정] ---
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; // 개인톡방 링크
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";      // 유저 데이터 저장 경로
const TARGET_ROOM_NAME = "게임봇"; // 실제 단체방 이름 (이름 기반 차단)

/**
 * [유저 등록 확인 함수]
 * 닉네임을 기반으로 저장된 JSON 파일이 있는지 확인합니다.
 */
function isUserRegistered(sender) {
    var file = new java.io.File(DATA_PATH + sender + ".json");
    return file.exists();
}

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    // 1. 유저 데이터 경로 및 등록 여부 파악
    const FILE_PATH = DATA_PATH + sender + ".json";
    const registered = isUserRegistered(sender);

    // 2. 단체방('게임봇') 차단 및 필터링 로직
    // room.trim()을 사용하여 방 이름 앞뒤의 보이지 않는 공백을 제거하고 비교합니다.
    if (isGroupChat && room.trim() === TARGET_ROOM_NAME) {
        
        // [A] 미가입 유저 채팅 제한 (.가입 제외)
        if (!registered && msg !== ".가입") {
            replier.reply("📢 [" + sender + "]님은 미등록 상태입니다.\n[.가입]을 입력하여 등록을 완료해 주세요!");
            return;
        }

        // [B] 가입 유저가 게임 명령어(.)를 단체방에서 쓸 경우 차단 (.가입 제외)
        if (msg.startsWith(".") && msg !== ".가입") {
            var blockMsg = "⚠️ [" + sender + "] 소환사님, 해당 기능은 개인톡 전용입니다.\n";
            blockMsg += "🔗 1:1 개인톡: " + PRIVATE_LINK;
            replier.reply(blockMsg);
            return; // 단체방에서는 여기서 로직을 종료하여 개인 정보를 보호합니다.
        }
    }

    // 3. [.가입] 명령어 (단체방/개인톡 어디서나 가능)
    if (msg === ".가입") {
        if (registered) {
            replier.reply("✅ [" + sender + "]님은 이미 가입된 상태입니다.");
        } else {
            // 데이터 폴더가 없으면 생성
            if (!new java.io.File(DATA_PATH).exists()) new java.io.File(DATA_PATH).mkdirs();
            
            // 기본 유저 데이터 객체 생성
            var userData = {
                "name": sender,
                "level": 1,
                "money": 1000,
                "joinDate": new Date().toLocaleString()
            };
            
            // 닉네임.json 파일로 저장
            FileStream.write(FILE_PATH, JSON.stringify(userData, null, 4));
            
            var success = "🎊 [가입 완료] " + sender + "님 등록 성공!\n";
            success += "이제 개인톡에서 자유롭게 게임을 이용해 보세요.\n\n";
            success += "🔗 개인톡: " + PRIVATE_LINK;
            replier.reply(success);
        }
        return;
    }

    // 4. 개인톡(1:1방) 전용 게임 기능
    if (!isGroupChat) {
        // 미가입자라면 개인톡 기능을 이용할 수 없음
        if (!registered) {
            replier.reply("❌ 아직 가입되지 않았습니다.\n먼저 [.가입]을 입력하여 소환사 등록을 완료해 주세요.");
            return;
        }

        // [.내정보] 명령어 - 가입된 유저만 호출 가능
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
