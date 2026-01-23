// [modules/handler.js]
const Handler = {};

const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; 
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";
const TARGET_ROOM_NAME = "게임봇"; 
const WELCOME_MSG = "소환사의 협곡에 오신것을 환영합니다."; // 인식할 오픈채팅봇 문구

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const FILE_PATH = DATA_PATH + userHash + ".json";

    // --- [핵심] 오픈채팅봇의 멘트 인식 및 대응 ---
    if (room === TARGET_ROOM_NAME && msg.includes(WELCOME_MSG)) {
        // 1. 데이터 폴더 생성
        var folder = new java.io.File(DATA_PATH);
        if (!folder.exists()) folder.mkdirs();

        // 2. 자동 가입 처리 (파일이 없을 경우만)
        if (!new java.io.File(FILE_PATH).exists()) {
            var userData = {
                "name": sender, // 여기서는 환영받는 유저의 이름이 sender가 됨
                "hash": userHash,
                "level": 1,
                "money": 1000,
                "joinDate": new Date().toLocaleString()
            };
            FileStream.write(FILE_PATH, JSON.stringify(userData, null, 4));
        }

        // 3. 오픈채팅봇 인사에 이어서 다음 안내 출력
        var guide = "🛡️ [데이터 엔진] 소환사 " + sender + "님 등록 완료!\n";
        guide += "내 정보 확인과 상점 이용은 개인톡에서 가능합니다.\n";
        guide += "🔗 1:1 개인톡: " + PRIVATE_LINK;
        
        replier.reply(guide);
        return;
    }

    // --- 단체방 유저 명령어 차단 ---
    if (room === TARGET_ROOM_NAME && isGroupChat) {
        if (msg.startsWith(".") && !(msg.startsWith(".업데이트") || msg.startsWith(".테스트"))) {
            replier.reply("⚠️ 모든 게임 명령어는 개인톡에서만 가능합니다.\n🔗 " + PRIVATE_LINK);
            return;
        }
    }

    // --- 개인톡 전용 기능 ---
    if (!isGroupChat) {
        if (msg === ".내정보") {
            var data = FileStream.read(FILE_PATH);
            if (data) {
                var user = JSON.parse(data);
                replier.reply("🔍 [" + user.name + "] 정보\n⭐ 레벨: " + user.level + "\n💵 자산: " + user.money + "원");
            }
        }
    }
};

module.exports = Handler;
