// [modules/handler.js]
const Handler = {};

const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; 
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";
const TARGET_ROOM_NAME = "게임봇"; 

Handler.onJoin = function(room, user, replier, imageDB) {
    if (room === TARGET_ROOM_NAME) {
        const userHash = String(imageDB.getProfileHash()).trim();
        const FILE_PATH = DATA_PATH + userHash + ".json";
        
        if (!new java.io.File(DATA_PATH).exists()) new java.io.File(DATA_PATH).mkdirs();

        // [자동 가입] 입장 즉시 데이터 생성
        if (!new java.io.File(FILE_PATH).exists()) {
            var userData = { "name": user, "hash": userHash, "level": 1, "money": 1000, "joinDate": new Date().toLocaleString() };
            FileStream.write(FILE_PATH, JSON.stringify(userData, null, 4));
        }

        replier.reply(room, "⚔️ [시스템] " + user + "님 데이터 등록 완료!\n모든 조작은 개인톡에서 가능합니다.\n🔗 " + PRIVATE_LINK);
    }
};

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const FILE_PATH = DATA_PATH + userHash + ".json";

    // 단체방에서의 모든 유저 명령어 차단
    if (room === TARGET_ROOM_NAME && isGroupChat) {
        if (msg.startsWith(".") && !msg.startsWith(".업데이트")) {
            replier.reply("⚠️ [제한] 모든 게임 조작은 개인톡(1:1)에서만 가능합니다.\n🔗 " + PRIVATE_LINK);
            return;
        }
    }

    // 개인톡 전용 기능
    if (!isGroupChat && msg === ".내정보") {
        var data = FileStream.read(FILE_PATH);
        if (data) {
            var user = JSON.parse(data);
            replier.reply("🔍 [" + user.name + "] 정보\n⭐ 레벨: " + user.level + "\n💵 자산: " + user.money + "원");
        }
    }
};

module.exports = Handler;
