const UserDB = require("./user");
const AdminDB = require("./admin");
const Champions = require("./champions");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    // 1. 관리자 권한 및 데이터 경로 확인
    var admins = AdminDB.getAdmins();
    var isMaster = (sender === "관리자");
    var isAdmin = (admins.indexOf(sender) > -1 || isMaster);

    var path = "sdcard/msgbot/Bots/sub/data/" + sender + ".json";
    var isRegistered = java.io.File(path).exists();

    // 2. [미가입 유저 처리] - 기존 유저/신규 유저 공통
    if (!isRegistered) {
        // 유저가 가입 명령어를 입력한 경우
        if (msg === ".가입") {
            UserDB.get(sender); // 신규 유저 파일 생성
            var success = "🎊 [ 소환사 등록 성공 ]\n";
            success += "━━━━━━━━━━━━━━\n";
            success += sender + "님, 소환사의 리그에 합류하신 것을 환영합니다!\n\n";
            success += "📜 '.메뉴'를 입력하여 모험을 시작하세요.";
            replier.reply(success);
            return;
        }

        // 가입하지 않은 유저가 아무 말(명령어 포함)이나 했을 때 안내
        var guide = "⚔️ [ 소환사의 협곡에 오신것을 환영합니다 ]\n";
        guide += "━━━━━━━━━━━━━━\n";
        guide += "아직 등록되지 않은 소환사입니다.\n";
        guide += "이곳은 매일 결투가 진행되는 소환사의 리그입니다.\n\n";
        guide += "👉 참여를 위해 [.가입]을 입력해주세요!";
        replier.reply(guide);
        return;
    }

    // 3. [가입된 유저 및 관리자 공용 로직]
    var user = UserDB.get(sender);

    // 관리자 전용 명령어 (가입된 관리자만 가능)
    if (isAdmin && isMaster) {
        if (msg.startsWith(".권한부여 ")) {
            var target = msg.replace(".권한부여 ", "").trim();
            if (AdminDB.add(target)) replier.reply("✅ [" + target + "]님에게 권한을 부여했습니다.");
            return;
        }
    }

    // 유저 공통 메뉴
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
        replier.reply("⚔️ " + user.name + "님의 캐릭터 인벤토리입니다.\n(보유한 캐릭터 목록 표시 준비중)");
        return;
    }

    if (msg === ".출석") {
        user.money += 100;
        UserDB.save(sender, user);
        replier.reply("🎁 매일 출석 보상 100G 지급!\n(현재 자산: " + user.money.toLocaleString() + "G)");
        return;
    }
};

module.exports = Handler;
