// [modules/handler.js]
const Handler = {};

const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; 
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const hash = String(imageDB.getProfileHash()).trim();
    const FILE_PATH = DATA_PATH + hash + ".json";

    // --- [섹션 A: 단체방('게임봇') 로직] ---
    if (room === "게임봇") {
        // [진단용] 관리자가 단체방에서 말하면 데이터 유무를 리플로 알려줌
        // 테스트 후 이 부분은 지우셔도 됩니다.
        if (msg === ".체크") {
            var exists = new java.io.File(FILE_PATH).exists();
            replier.reply("🔍 진단 결과\n- 해시: " + hash + "\n- 데이터존재: " + (exists ? "✅" : "❌"));
            return;
        }

        var isRegistered = new java.io.File(FILE_PATH).exists();

        // 등록되지 않았으면 무조건 안내 (관리자 제외 로직 삭제됨)
        if (!isRegistered) {
            if (msg.startsWith(".업데이트")) return;

            var guide = "📢 [가입 안내] " + sender + "님!\n\n";
            guide += "아직 게임 등록이 되지 않았습니다.\n";
            guide += "아래 개인톡에서 [.가입]을 먼저 진행해주세요!\n\n";
            guide += "🔗 1:1 링크: " + PRIVATE_LINK;
            
            replier.reply(guide);
            return;
        }
        return; 
    }

    // --- [섹션 B: 개인톡 로직] ---
    if (!isGroupChat || room !== "게임봇") {
        // [명령어: .가입]
        if (msg === ".가입") {
            var folder = new java.io.File(DATA_PATH);
            if (!folder.exists()) folder.mkdirs();

            if (new java.io.File(FILE_PATH).exists()) {
                replier.reply("⚠️ 이미 가입된 정보가 있습니다.");
            } else {
                var userData = {
                    "name": sender,
                    "hash": hash,
                    "level": 1,
                    "money": 1000,
                    "joinDate": new Date().toLocaleString()
                };
                FileStream.write(FILE_PATH, JSON.stringify(userData, null, 4));
                replier.reply("🎊 가입 성공! 초기 자금 1,000원 지급.");
            }
        }
        // [명령어: .내정보]
        if (msg === ".내정보") {
            var data = FileStream.read(FILE_PATH);
            if (data) {
                var user = JSON.parse(data);
                replier.reply("🔍 [" + user.name + "] 정보\n⭐ 레벨: " + user.level + "\n💵 자산: " + user.money + "원");
            } else {
                replier.reply("❌ 가입 정보가 없습니다.");
            }
        }
    }
};

module.exports = Handler;
