// [modules/handler.js]
const Handler = {};

// --- [환경 설정] ---
const PRIVATE_LINK = "https://open.kakao.com/o/s4pX9Nci"; 
const DATA_PATH = "/sdcard/msgbot/Bots/sub/data/";
const TARGET_ROOM_NAME = "게임봇"; // 실제 단체방 이름

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    const userHash = String(imageDB.getProfileHash()).trim();
    const FILE_PATH = DATA_PATH + userHash + ".json";
    const isRegistered = new java.io.File(FILE_PATH).exists();

    // --- [섹션 A: 단체 채팅방 제어 로직] ---
    if (room === TARGET_ROOM_NAME) {
        
        // 1. 미가입자: 채팅 시 무한 안내 (명령어/일반대화 모두 차단)
        if (!isRegistered) {
            if (msg.startsWith(".업데이트") || msg.startsWith(".테스트")) return;

            var guide = "⚔️ [소환사의 협곡]에 오신 것을 환영합니다!\n\n";
            guide += "⚠️ " + sender + "님은 현재 미등록 상태입니다.\n";
            guide += "단체방 활동을 위해 아래 개인톡에서 [.가입]을 완료해 주세요!\n\n";
            guide += "🔗 1:1 링크: " + PRIVATE_LINK + "\n\n";
            guide += "가입 완료 전까지는 단체방 이용이 제한됩니다.";
            
            replier.reply(guide);
            return; // 미가입자의 모든 발언 이후 로직 중단
        }

        // 2. 가입자: 단체방에서 메뉴 조작 명령어 차단
        // (가입이 되어있어도 단체방에서는 .가입, .내정보 등을 쓸 수 없음)
        const menuCommands = [".가입", ".내정보", ".상점", ".인벤토리"]; // 차단할 메뉴 목록
        if (menuCommands.includes(msg.split(" ")[0])) {
            replier.reply("⚠️ " + sender + "님, 메뉴 조작 및 상세 정보 확인은 보안을 위해 [1:1 개인톡]에서만 가능합니다.");
            return;
        }

        // 가입된 유저의 일반 대화는 여기서 통과되어 정상적으로 노출됨
        return; 
    }

    // --- [섹션 B: 1:1 개인톡 로직] ---
    // (이곳에서만 실제 가입 및 데이터 조회가 가능함)
    if (!isGroupChat) {
        if (msg === ".가입") {
            var folder = new java.io.File(DATA_PATH);
            if (!folder.exists()) folder.mkdirs();

            if (isRegistered) {
                replier.reply("⚠️ 이미 가입된 소환사입니다.");
            } else {
                var userData = {
                    "name": sender, "hash": userHash, "level": 1, "money": 1000, 
                    "joinDate": new Date().toLocaleString() 
                };
                FileStream.write(FILE_PATH, JSON.stringify(userData, null, 4));
                replier.reply("🎊 [가입 완료]\n이제 단체방에서 자유롭게 활동하실 수 있습니다!");
            }
        }

        if (msg === ".내정보") {
            var data = FileStream.read(FILE_PATH);
            if (data) {
                var user = JSON.parse(data);
                var info = "🔍 [" + user.name + "] 정보\n━━━━━━━━━━━━━━\n";
                info += "⭐ 레벨: " + user.level + "\n💵 자산: " + user.money + "원";
                replier.reply(info);
            } else {
                replier.reply("❌ 가입 정보가 없습니다. [.가입]을 먼저 해주세요.");
            }
        }
    }
};

module.exports = Handler;
