const UserDB = require("./user");
const AdminDB = require("./admin");
const Champions = require("./champions");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    // 1. 권한 정보 및 가입 상태 확인
    var admins = AdminDB.getAdmins();
    var isMaster = (sender === "관리자");
    var isAdmin = (admins.indexOf(sender) > -1 || isMaster);

    var path = "sdcard/msgbot/Bots/sub/data/" + sender + ".json";
    var isRegistered = java.io.File(path).exists();

    // 2. 미가입자 처리 (관리자 포함 모든 유저 공통)
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender); // 데이터 생성
            replier.reply("🎊 [ 소환사 등록 성공 ]\n━━━━━━━━━━━━━━\n" + sender + "님, 환영합니다!\n이제 게임과 관리 기능을 모두 이용하실 수 있습니다.");
            return;
        }

        // 가입 전에는 어떤 말을 해도 환영 문구 출력
        var welcome = "⚔️ [ 소환사의 협곡에 오신것을 환영합니다 ]\n━━━━━━━━━━━━━━\n";
        welcome += "반갑습니다, " + sender + "님!\n이곳은 매일 결투가 진행되는 리그입니다.\n\n👉 참여를 위해 [.가입]을 입력해주세요!";
        replier.reply(welcome);
        return;
    }

    // 3. [관리자 전용 기능] - 가입된 상태에서만 작동
    if (isAdmin) {
        if (isMaster && msg.startsWith(".권한부여 ")) {
            var target = msg.replace(".권한부여 ", "").trim();
            if (AdminDB.add(target)) replier.reply("✅ [" + target + "]님에게 권한을 부여했습니다.");
            return;
        }
        
        if (msg === ".관리자메뉴") {
            var m = "🛠️ [ 관리자 기능 ]\n.업데이트 / .시스템 / .버전";
            if(isMaster) m += "\n.권한부여 [닉네임]";
            replier.reply(m);
            return;
        }
    }

    // 4. [게임 전용 기능] - 가입된 모든 유저(관리자 포함) 공통
    var user = UserDB.get(sender);

    if (msg === ".메뉴" || msg === ".도움말") {
        var menu = "🎮 [ 메인 메뉴 ]\n━━━━━━━━━━━━━━\n";
        menu += "1️⃣ 내 정보 ➔ .정보\n";
        menu += "2️⃣ 캐릭터 ➔ .캐릭터\n";
        menu += "3️⃣ 일일 보상 ➔ .출석\n";
        menu += "━━━━━━━━━━━━━━";
        replier.reply(menu);
        return;
    }

    if (msg === ".정보") {
        var total = user.win + user.loss;
        var rate = total === 0 ? 0 : ((user.win / total) * 100).toFixed(1);
        var info = "👤 [" + user.name + " 정보]\n";
        if (isAdmin) info += "🎖️ 권한: 관리자\n";
        info += "⭐ Lv." + user.level + " / 💰 " + user.money.toLocaleString() + " G\n";
        info += "📊 전적: " + user.win + "승 " + user.loss + "패 (" + rate + "%)";
        replier.reply(info);
        return;
    }

    if (msg === ".캐릭터") {
        replier.reply("⚔️ " + user.name + "님이 보유한 캐릭터 리스트입니다.\n(추후 캐릭터 목록 연동 예정)");
        return;
    }

    if (msg === ".출석") {
        user.money += 100;
        UserDB.save(sender, user);
        replier.reply("🎁 출석 보상 100G 지급!\n(현재 자산: " + user.money.toLocaleString() + "G)");
        return;
    }
};

module.exports = Handler;
