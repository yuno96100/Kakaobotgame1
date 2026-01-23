// [modules/handler.js]
const Handler = {};

// --- [환경 설정] ---
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; 
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";
const TARGET_ROOM_NAME = "게임봇"; 

/**
 * [1] 입장 로직 (onJoin)
 * 오픈채팅봇의 인사 뒤에 시스템 등록 완료를 알리고 자동 가입을 처리합니다.
 */
Handler.onJoin = function(room, user, replier, imageDB) {
    if (room === TARGET_ROOM_NAME) {
        // 유저 고유 해시값 추출
        const userHash = String(imageDB.getProfileHash()).trim();
        const FILE_PATH = DATA_PATH + userHash + ".json";
        
        // 데이터 폴더 생성
        var folder = new java.io.File(DATA_PATH);
        if (!folder.exists()) folder.mkdirs();

        // 자동 가입: 오픈채팅봇 환영 인사가 나갈 때 우리 봇은 파일만 즉시 생성
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

        // 오픈채팅봇 안내 이후 추가 시스템 메시지 출력
        var guide = "🛡️ [시스템] 소환사 " + user + "님의 게임 데이터가 자동 생성되었습니다.\n\n";
        guide += "내 정보 확인 및 메뉴 조작은 봇과의 개인톡에서 가능합니다!\n";
        guide += "🔗 1:1 개인톡: " + PRIVATE_LINK;
        
        replier.reply(room, guide);
    }
};

/**
 * [2] 채팅 처리 로직 (process)
 * 유저 조작은 단체방에서 금지하고 개인톡에서만 수행합니다.
 */
Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const FILE_PATH = DATA_PATH + userHash + ".json";

    // 단체방('게임봇') 조작 제한
    if (room === TARGET_ROOM_NAME && isGroupChat) {
        const isCommand = msg.startsWith(".");
        const isAdminCmd = msg.startsWith(".업데이트") || msg.startsWith(".테스트");

        if (isCommand && !isAdminCmd) {
            var warn = "⚠️ [알림] 모든 게임 명령어는 개인톡(1:1)에서만 작동합니다.\n\n";
            warn += "🔗 개인톡 링크: " + PRIVATE_LINK;
            replier.reply(warn);
            return; 
        }
    }

    // 개인톡(1:1방) 로직
    if (!isGroupChat) {
        if (msg === ".내정보") {
            var data = FileStream.read(FILE_PATH);
            if (data) {
                var user = JSON.parse(data);
                var info = "🔍 [" + user.name + "] 정보\n━━━━━━━━━━━━━━\n";
                info += "⭐ 레벨: " + user.level + "\n";
                info += "💵 자산: " + user.money + "원";
                replier.reply(info);
            } else {
                replier.reply("❌ 가입 정보가 없습니다. 단체방에 재입장해주세요.");
            }
        }
    }
};

module.exports = Handler;
