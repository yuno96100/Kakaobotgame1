const UserDB = require("./user");
const AdminDB = require("./admin");
const Champions = require("./champions");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    // 1. 권한 체크
    var admins = AdminDB.getAdmins();
    var isMaster = (sender === "시스템"); 
    var isAdmin = (admins.indexOf(sender) > -1);

    // 2. 가입 여부 체크 (중요: 이 코드가 있어야 아래에서 에러가 안 납니다)
    var path = "sdcard/msgbot/Bots/sub/data/" + sender + ".json";
    var isRegistered = java.io.File(path).exists();

    // [최종 관리자 전용 명령어]
    if (isMaster) {
        if (msg.startsWith(".권한부여 ")) {
            var target = msg.replace(".권한부여 ", "").trim();
            if (AdminDB.add(target)) replier.reply("✅ [" + target + "]님에게 관리자 권한을 부여했습니다.");
            else replier.reply("⚠️ 이미 관리자이거나 오류가 발생했습니다.");
            return;
        }
        if (msg.startsWith(".권한해제 ")) {
            var target = msg.replace(".권한해제 ", "").trim();
            if (AdminDB.remove(target)) replier.reply("✅ [" + target + "]님의 관리자 권한을 해제했습니다.");
            else replier.reply("❌ 해제할 수 없는 대상입니다.");
            return;
        }
    }

    // [관리자 공통 메뉴]
    if (isAdmin) {
        if (msg === ".관리자메뉴") {
            var m = "🛠️ [ 관리자 메뉴 ]\n";
            m += ".업데이트 - 시스템 동기화\n";
            m += ".시스템 - 상태 점검\n";
            if (isMaster) m += ".권한부여/해제 [닉네임]";
            replier.reply(m);
            return;
        }
    }

    // [이벤트 감지: 환영 문구]
    if (msg.includes("소환사의 협곡에 오신것을 환영합니다.")) {
        var welcomeGuide = "📜 [ 가입 안내 ]\n━━━━━━━━━━━━━━\n새로 오신 소환사님, 반갑습니다!\n게임을 시작하려면 [.가입]을 입력해주세요.\n━━━━━━━━━━━━━━";
        replier.reply(welcomeGuide);
        return;
    }

    // [명령어: .가입]
    if (msg === ".가입") {
        if (isRegistered) {
            replier.reply("⚠️ 이미 등록된 소환사입니다.");
            return;
        }
        UserDB.get(sender); 
        replier.reply("🎊 [" + sender + "]님 등록 성공! '.메뉴'를 입력하세요.");
        return;
    }

    // [미가입자 차단] - 관리자는 차단하지 않음
    if (!isRegistered && !isAdmin) {
        if (msg.startsWith(".")) {
            replier.reply("👋 아직 등록되지 않은 소환사입니다.\n'.가입'을 먼저 진행해주세요!");
        }
        return;
    }

    // [가입 유저 전용 메뉴]
    if (isRegistered) {
        var user = UserDB.get(sender);
        if (msg === ".메뉴" || msg === ".도움말") {
            replier.reply("🎮 [ 메인 메뉴 ]\n━━━━━━━━━━━━━━\n1️⃣ 내 정보 ➔ .정보\n2️⃣ 캐릭터 ➔ .보유캐릭터\n3️⃣ 일일 보상 ➔ .출석");
            return;
        }
        if (msg === ".정보") {
            var total = user.win + user.loss;
            var rate = total === 0 ? 0 : ((user.win / total) * 100).toFixed(1);
            replier.reply("👤 [" + user.name + " 정보]\n⭐ Lv." + user.level + " / 💰 " + user.money.toLocaleString() + " G\n📊 전적: " + user.win + "승 " + user.loss + "패 (" + rate + "%)");
            return;
        }
    }
};

module.exports = Handler;
