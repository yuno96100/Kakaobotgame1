// [modules/handler.js]
const Handler = {};

// --- [설정 및 경로] ---
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; 
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const hash = String(imageDB.getProfileHash()).trim();
    const FILE_PATH = DATA_PATH + hash + ".json";

    // --- [섹션 A: 단체방('게임봇') 전용 로직] ---
    if (room === "게임봇") {
        var isRegistered = new java.io.File(FILE_PATH).exists();

        // 관리자라 하더라도 데이터 파일(.json)이 없으면 안내 대상이 됨
        if (!isRegistered) {
            // 시스템 핵심 명령어(.업데이트) 입력 시에는 안내를 건너뜀
            if (msg.startsWith(".업데이트")) return;

            var guide = "📢 [가입 안내] " + sender + "님!\n\n";
            guide += "현재 게임봇에 등록되지 않은 상태입니다.\n";
            guide += "아래 개인톡에서 [.가입]을 먼저 진행해주세요!\n\n";
            guide += "🔗 1:1 링크: " + PRIVATE_LINK + "\n\n";
            guide += "입장 후 [.가입]을 입력하시면 즉시 시작됩니다.";
            
            replier.reply(guide);
            return;
        }
        return; 
    }

    // --- [섹션 B: 개인톡(1:1방) 전용 로직] ---
    if (!isGroupChat || room !== "게임봇") {
        
        // 1. 가입 처리
        if (msg === ".가입") {
            var folder = new java.io.File(DATA_PATH);
            if (!folder.exists()) folder.mkdirs();

            if (new java.io.File(FILE_PATH).exists()) {
                replier.reply("⚠️ 이미 가입된 정보가 있습니다.\nID: " + hash);
            } else {
                var userData = {
                    "name": sender,
                    "hash": hash,
                    "level": 1,
                    "money": 1000,
                    "exp": 0,
                    "joinDate": new Date().toLocaleString()
                };
                FileStream.write(FILE_PATH, JSON.stringify(userData, null, 4));
                
                var successMsg = "🎊 가입이 완료되었습니다! 🎊\n";
                successMsg += "━━━━━━━━━━━━━━\n";
                successMsg += "👤 닉네임: " + sender + "\n";
                successMsg += "💰 초기자금: 1,000원\n";
                successMsg += "━━━━━━━━━━━━━━\n";
                successMsg += "이제 여기서 게임 명령어를 사용해보세요!";
                replier.reply(successMsg);
            }
        }

        // 2. 내 정보 확인
        if (msg === ".내정보") {
            var data = FileStream.read(FILE_PATH);
            if (data) {
                var user = JSON.parse(data);
                var info = "🔍 [" + user.name + "]님의 정보\n";
                info += "━━━━━━━━━━━━━━\n";
                info += "⭐ 레벨: " + user.level + "\n";
                info += "💵 자산: " + user.money + "원\n";
                info += "📅 가입일: " + user.joinDate;
                replier.reply(info);
            } else {
                replier.reply("❌ 가입 정보가 없습니다. [.가입]을 먼저 해주세요.");
            }
        }
    }
};

module.exports = Handler;
