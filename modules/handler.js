const UserDB = require("./user");
const AdminDB = require("./admin");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    if (!msg) return;
    var admins = AdminDB.getAdmins();
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();

    // [ 1. 가입 제어 ]
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender);
            replier.reply("시스템", "🎊 [ 가입 성공 ]\n" + sender + "님 환영합니다!\n\n📜 '.메뉴'를 입력하세요.");
            return;
        }
        if (msg.startsWith(".")) {
            replier.reply("시스템", "⚔️ [ 소환사의 협곡 ]\n━━━━━━━━━━━━━━\n등록되지 않은 소환사입니다.\n\n👉 참여를 위해 [.가입] 입력!");
        }
        return;
    }
    
    if (msg === ".가입") {
        replier.reply("시스템", "🔔 [ 알림 ]\n이미 리그에 등록된 소환사입니다.\n명령어 확인은 [.메뉴]를 입력하세요.");
        return;
    }

    var user = UserDB.get(sender);

    // [ 2. 메인 메뉴 ]
    if (msg === ".메뉴" || msg === ".돌아가기") {
        var menu = "🎮 [ 메인 메뉴 ]\n━━━━━━━━━━━━━━\n1️⃣ 소환사 정보 (.정보)\n2️⃣ 캐릭터 (.캐릭터)\n3️⃣ 일일 출석 (.출석)\n";
        if (isAdmin) menu += "🛠️ 관리자 제어 콘솔 (.관리자명령어)\n";
        menu += "━━━━━━━━━━━━━━\n [ 📜 명령어 안내 ]\n • 정보 확인 ➔ .정보\n • 캐릭터 관리 ➔ .캐릭터\n • 매일 출석 ➔ .출석";
        replier.reply("시스템", menu);
        return;
    }

    // [ 3. 유저 명령어 ]
    if (msg === ".정보") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        replier.reply("시스템", "📜 [ 소환사 정보 ]\n━━━━━━━━━━━━━━\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ 레벨: Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n⚔️ 전적: " + user.win + "승 " + user.loss + "패\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    if (msg === ".출석") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) return replier.reply("시스템", "🔔 [ 출석 알림 ]\n이미 보상을 받으셨습니다.");
        user.money += 100; user.exp += 50; user.lastAttendance = today;
        var up = UserDB.checkLevelUp(user);
        UserDB.save(sender, user);
        replier.reply("시스템", "🎁 [ 출석 완료 ]\n+100G / +50EXP 획득!" + (up ? "\n🎊 레벨업! Lv." + user.level : "") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    if (msg === ".캐릭터") {
        replier.reply("시스템", "⚔️ [ 캐릭터 ]\n━━━━━━━━━━━━━━\n보유 캐릭터: " + user.ownedChars.join(", ") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    // [ 4. 관리자 명령어 ]
    if (isAdmin) {
        if (msg === ".관리자명령어") {
            var adm = "🛠️ [ 관리자 시스템 ]\n━━━━━━━━━━━━━━\n• 권한: .관리자추가 / .관리자제거\n• 데이터: .백업 / .복구 확인\n• 유저: .닉네임변경 / .초기화\n━━━━━━━━━━━━━━\n🔙 [.메뉴]";
            replier.reply("관리자", adm);
