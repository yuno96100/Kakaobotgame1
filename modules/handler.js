// [modules/handler.js]
const Handler = {};

// --- [환경 설정] ---
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; // 1:1 개인톡 링크
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";      // 유저 데이터 저장 경로
const TARGET_ROOM_NAME = "게임봇"; // 실제 단체방 이름 (정확히 입력하세요)

/**
 * [1] 입장 로직 (onJoin)
 * 유저가 단체방에 입장하는 순간 즉시 환영 문구와 가입 링크를 안내합니다.
 */
Handler.onJoin = function(room, user, replier) {
    if (room === TARGET_ROOM_NAME) {
        var welcome = "⚔️ [소환사의 협곡]에 입장하신 것을 환영합니다!\n\n";
        welcome += user + " 소환사님, 반갑습니다!\n";
        welcome += "원활한 게임 참여를 위해 [데이터 등록]이 필수입니다.\n\n";
        welcome += "🔗 아래 개인톡 링크로 이동하여 [.가입]을 입력해 주세요!\n";
        welcome += "👉 " + PRIVATE_LINK + "\n\n";
        welcome += "⚠️ 가입을 완료해야 단체방 활동이 가능합니다.";
        
        // Api.reply 형식을 위해 room 인자를 함께 전달
        replier.reply(room, welcome);
    }
};

/**
 * [2] 채팅 처리 로직 (process)
 * 메시지를 가로채 가입 여부를 확인하고 단체방 활동을 제어합니다.
 */
Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const FILE_PATH = DATA_PATH + userHash + ".json";
    const isRegistered = new java.io.File(FILE_PATH).exists();

    // --- 단체방(TARGET_ROOM_NAME) 제어 ---
    if (room === TARGET_ROOM_NAME) {
        // 미가입자 (데이터 파일이 없는 경우)
        if (!isRegistered) {
            // 관리자 업데이트 명령어는 통과 (중단 방지)
            if (msg.startsWith(".업데이트") || msg.startsWith(".테스트")) return;

            var guide = "📢 [미등록 사용자 안내]\n";
            guide += sender + "님, 아직 가입 데이터가 생성되지 않았습니다.\n\n";
            guide += "🔗 1:1 개인톡 링크: " + PRIVATE_LINK + "\n";
            guide += "위 링크에서 [.가입] 명령어를 입력해야 등록됩니다.";
            
            replier.reply(guide);
            return; // 미가입자는 이후 모든 게임 로직 실행 불가 (무한 안내)
        }

        // 가입자라 하더라도 단체방에서 메뉴 조작 명령어는 차단
        const blockCmds = [".가입", ".내정보", ".상점", ".인벤토리"];
        if (blockCmds.includes(msg.split(" ")[0])) {
            replier.reply("⚠️ " + sender + "님, 상세 메뉴 조작은 1:1 개인톡에서만 가능합니다.");
            return;
        }
    }

    // --- 개인톡(1:1방) 전용 로직 ---
    if (!isGroupChat) {
        // [.가입] - 실제 유저 데이터를 생성하는 유일한 명령어
        if (msg === ".가입") {
            var folder = new java.io.File(DATA_PATH);
            if (!folder.exists()) folder.mkdirs();

            if (isRegistered) {
                replier.reply("✅ 이미 등록된 소환사입니다.");
            } else {
                // 초기 유저 데이터 객체 생성
                var userData = {
                    "name": sender,
                    "hash": userHash,
                    "level": 1,
                    "money": 1000,
                    "joinDate": new Date().toLocaleString()
                };
                // JSON 파일 물리적 저장
                FileStream.write(FILE_PATH, JSON.stringify(userData, null, 4));
                replier.reply("🎊 [가입 완료]\n데이터가 생성되었습니다! 이제 단체방 활동이 가능합니다.\n초기 지원금 1,000원이 지급되었습니다.");
            }
        }

        // [.내정보] - 개인 데이터 확인
        if (msg === ".내정보") {
            var data = FileStream.read(FILE_PATH);
            if (data) {
                var user = JSON.parse(data);
                var info = "🔍 [" + user.name + "] 소환사 정보\n━━━━━━━━━━━━━━\n";
                info += "⭐ 레벨: " + user.level + "\n💵 자산: " + user.money + "원\n📅 등록일: " + user.joinDate;
                replier.reply(info);
            } else {
                replier.reply("❌ 가입 정보가 없습니다. [.가입]을 먼저 진행해 주세요.");
            }
        }
    }
};

module.exports = Handler;
