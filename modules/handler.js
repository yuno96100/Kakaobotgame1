const UserDB = require("./user");
const AdminDB = require("./admin");
const Champions = require("./champions");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    // 1. 관리자 및 가입 여부 체크
    var admins = AdminDB.getAdmins();
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "시스템");

    var path = "sdcard/msgbot/Bots/sub/data/" + sender + ".json";
    var isRegistered = java.io.File(path).exists();

    // 2. [핵심] 미가입 유저의 첫 대화 감지 및 가입 절차 진행
    if (!isRegistered) {
        // 유저가 이미 '.가입'을 입력 중이라면 중복 안내하지 않음
        if (msg === ".가입") {
            UserDB.get(sender); // 신규 데이터 생성
            var success = "🎊 [ 소환사 등록 성공 ]\n";
            success += "━━━━━━━━━━━━━━\n";
            success += sender + "님, 데이터 생성이 완료되었습니다!\n\n";
            success += "📜 '.메뉴'를 입력하여 기능을 확인하세요.";
            replier.reply(success);
            return;
        }

        // 가입되지 않은 유저가 어떤 대화든 시작했을 때 (첫 대화 감지)
        var welcome = "⚔️ [ 소환사의 협곡에 오신것을 환영합니다 ]\n";
        welcome += "━━━━━━━━━━━━━━\n";
        welcome += "반갑습니다, " + sender + "님!\n";
        welcome += "이곳은 턴제 결투가 진행되는 리그입니다.\n\n";
        welcome += "👉 게임 참여를 위해 [.가입]을 입력해주세요!";
        replier.reply(welcome);
        return;
    }

    // 3. 가입된 유저 또는 관리자의 명령어 처리
    // [관리자 전용]
    if (isAdmin && sender === "시스템") {
        if (msg.startsWith(".권한부여 ")) {
            var target = msg.replace(".권한부여 ", "").trim();
            if (AdminDB.add(target)) replier.reply("✅ [" + target + "]님에게 권한을 부여했습니다.");
            return;
        }
    }

    // [유저 공통 메뉴]
    if (msg === ".메뉴" || msg === ".도움말") {
        var menu = "🎮 [ 메인 메뉴 ]\n━━━━━━━━━━━━━━\n";
        menu += "1️⃣ 내 정보 ➔ .정보\n";
        menu += "2️⃣ 캐릭터 ➔ .보유캐릭터\n";
        menu += "3️⃣ 일일 보상 ➔ .출석\n";
        menu += "━━━━━━━━━━━━━━";
        replier.reply(menu);
        return;
    }

    if (msg === ".정보") {
        var user = UserDB.get(sender);
        var total = user.win + user.loss;
        var rate = total === 0 ? 0 : ((user.win / total) * 100).toFixed(1);
        replier.reply("👤 [" + user.name + " 정보]\n⭐ Lv." + user.level + " / 💰 " + user.money.toLocaleString() + " G\n📊 전적: " + user.win + "승 " + user.loss + "패 (" + rate + "%)");
        return;
    }

    if (msg === ".출석") {
        var user = UserDB.get(sender);
        user.money += 100;
        UserDB.save(sender, user);
        replier.reply("🎁 출석 보상 100G 지급!\n(현재 자산: " + user.money.toLocaleString() + "G)");
        return;
    }
};

module.exports = Handler;
