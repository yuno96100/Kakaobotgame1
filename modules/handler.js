// [modules/handler.js]
const Handler = {};

// --- [환경 설정] ---
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; // 1:1 개인톡 링크
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";      // 유저 데이터 저장 폴더
const TARGET_ROOM_NAME = "게임봇"; // 실제 단체방 이름 (정확히 입력)

/**
 * [1] 입장 로직 (onJoin)
 * 오픈채팅봇의 환영 인사 이후, 봇이 유저 데이터를 자동 생성하고 개인톡 링크를 안내합니다.
 */
Handler.onJoin = function(room, user, replier, imageDB) {
    if (room === TARGET_ROOM_NAME) {
        // 유저 고유 해시값 추출 (데이터 파일명의 기준)
        const userHash = String(imageDB.getProfileHash()).trim();
        const FILE_PATH = DATA_PATH + userHash + ".json";
        
        // 데이터 저장 폴더 생성 (없을 경우)
        var folder = new java.io.File(DATA_PATH);
        if (!folder.exists()) folder.mkdirs();

        // 자동 가입 로직: 파일이 없으면 초기 데이터와 함께 생성
        if (!new java.io.File(FILE_PATH).exists()) {
            var userData = {
                "name": user,
                "hash": userHash,
                "level": 1,
                "money": 1000,
                "joinDate": new Date().toLocaleString()
            };
            FileStream.write(FILE_PATH, JSON.stringify(userData, null, 4));
        }

        // 입장 환영 및 개인톡 유도 메시지
        var guide = "⚔️ [시스템] " + user + " 소환사님의 데이터 등록이 자동 완료되었습니다.\n\n";
        guide += "내 정보 확인 및 게임 조작은 개인톡에서 가능합니다!\n";
        guide += "🔗 1:1 개인톡: " + PRIVATE_LINK;
        
        // Api.reply 형식을 사용하여 해당 방에 전송
        replier.reply(room, guide);
    }
};

/**
 * [2] 메시지 처리 로직 (process)
 * 단체방에서는 모든 유저 명령어를 차단하고, 개인톡에서만 조작을 허용합니다.
 */
Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const FILE_PATH = DATA_PATH + userHash + ".json";

    // --- 단체방('게임봇')에서의 조작 제한 ---
    if (room === TARGET_ROOM_NAME && isGroupChat) {
        // 명령어 식별 (.으로 시작하는 경우)
        const isCommand = msg.startsWith(".");
        // 관리자 명령어만 예외 처리 (수정/테스트용)
        const isAdminCmd = msg.startsWith(".업데이트") || msg.startsWith(".테스트");

        // 유저가 조작 명령어를 단체방에서 사용했을 때 차단 및 안내
        if (isCommand && !isAdminCmd) {
            var warn = "⚠️ [제한] " + sender + "님, 모든 게임 조작 명령어는 개인톡에서만 사용 가능합니다.\n\n";
            warn += "🔗 개인톡 링크: " + PRIVATE_LINK;
            replier.reply(warn);
            return; // 단체방에서는 여기서 실행 중단
        }
    }

    // --- 개인톡(1:1방) 전용 게임 조작 기능 ---
    if (!isGroupChat) {
        // [명령어: .내정보]
        if (msg === ".내정보") {
            var data = FileStream.read(FILE_PATH);
            if (data) {
                var user = JSON.parse(data);
                var info = "🔍 [" + user.name + "] 소환사 정보\n━━━━━━━━━━━━━━\n";
                info += "⭐ 레벨: " + user.level + "\n";
                info += "💵 자산: " + user.money + "원\n";
                info += "📅 등록일: " + user.joinDate;
                replier.reply(info);
            } else {
                // 입장을 통해 자동 생성이 안 된 특수한 경우
                replier.reply("❌ 데이터가 존재하지 않습니다. 단체방에 다시 입장하여 등록을 완료해 주세요.");
            }
        }

        // 여기에 향후 추가될 상점, 강화, 던전 등의 기능을 구현하면 됩니다.
        // if (msg === ".상점") { ... }
    }
};

module.exports = Handler;
