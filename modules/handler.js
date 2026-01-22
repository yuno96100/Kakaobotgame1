const UserDB = require("./user");
const AdminDB = require("./admin");

var Handler = {};

Handler.process = function(room, msg, sender, isGroupChat, replier) {
    
    // [보강] 이름 뒤의 오픈프로필 태그나 보이지 않는 공백을 모두 제거
    var senderName = sender.toString().split("\n")[0].trim(); 
    
    var admins = AdminDB.getAdmins() || ["관리자"];
    
    // [보강] 관리자 이름 매칭 확인 (로그로 확인 가능하게 구성)
    var isAdmin = (senderName === "관리자" || admins.indexOf(senderName) > -1);
    
    var dataPath = "/sdcard/msgbot/Bots/sub/data/" + senderName + ".json";
    var isRegistered = new java.io.File(dataPath).exists();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SECTION 1. 가입 시스템
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (msg === ".가입") {
        if (isRegistered) return replier.reply("🔔 [" + senderName + "]님은 이미 등록되어 있습니다.");
        UserDB.save(senderName, UserDB.get(senderName));
        return replier.reply("🎊 [ 가입 완료 ]\n" + senderName + "님 환영합니다!\n[.메뉴]를 입력해보세요.");
    }

    // 미가입 가드
    if (!isRegistered) {
        if (msg.startsWith(".")) return replier.reply("⚠️ [.가입]을 먼저 진행해주세요.");
        return;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SECTION 2. 유저 메뉴 (매일)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (msg === ".메뉴") {
        var menu = "🎮 [ 매일 메뉴 ]\n" + "━".repeat(12) + "\n1. .정보\n2. .캐릭터\n3. .출석\n" + (isAdmin ? "🛠️ .관리자명령어\n" : "") + "━".repeat(12);
        return replier.reply(menu);
    }
    
    // .정보, .출석, .캐릭터 로직 (기존과 동일)

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SECTION 3. 관리자 전용
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isAdmin) {
        if (msg === ".관리자명령어") {
            return replier.reply("🛠️ [ 관리자 도구 ]\n.관리자추가 [이름]\n.관리자제거 [이름]\n.백업\n.복구 확인\n.유저체크 [이름]");
        }
        // ... 관리자 상세 로직 ...
    }
};

module.exports = Handler;
