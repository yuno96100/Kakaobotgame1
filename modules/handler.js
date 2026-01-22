const UserDB = require("./user");
const AdminDB = require("./admin");

var Handler = {
    process: function(room, msg, sender, isGroupChat, replier) {
        var senderName = sender.toString().trim();
        var admins = AdminDB.getAdmins();
        var isAdmin = (senderName === "관리자" || admins.indexOf(senderName) > -1);
        var dataPath = "/sdcard/msgbot/Bots/sub/data/" + senderName + ".json";
        var isRegistered = new java.io.File(dataPath).exists();

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // SECTION 1. 가입 시스템
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (msg === ".가입") {
            if (isRegistered) return replier.reply("🔔 이미 가입된 소환사입니다.");
            UserDB.save(senderName, UserDB.get(senderName));
            return replier.reply("🎊 [ 가입 완료 ]\n" + senderName + "님 환영합니다!\n[.메뉴]를 입력해보세요.");
        }

        if (!isRegistered) {
            if (msg.startsWith(".")) return replier.reply("⚠️ [.가입]을 먼저 진행해주세요.");
            return;
        }

        var user = UserDB.get(senderName);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // SECTION 2. 유저 메뉴 (매일)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (msg === ".메뉴") {
            var menu = "🎮 [ 매일 메뉴 ]\n" + "━".repeat(12) + "\n1. .정보\n2. .캐릭터\n3. .출석\n" + (isAdmin ? "🛠️ .관리자명령어\n" : "") + "━".repeat(12);
            return replier.reply(menu);
        }

        if (msg === ".정보") {
            var expP = Math.floor((user.exp / user.maxExp) * 100);
            return replier.reply("📜 [ " + senderName + " 정보 ]\n⭐ Lv." + user.level + "\n💰 골드: " + user.money.toLocaleString() + "G");
        }

        if (msg === ".캐릭터") {
            return replier.reply("⚔️ [ 캐릭터 ]\n보유 캐릭터 목록을 불러오는 중...");
        }

        if (msg === ".출석") {
            var today = new Date().toLocaleDateString();
            if (user.lastAttendance === today) return replier.reply("🔔 오늘 이미 출석했습니다.");
            user.money += 100; user.lastAttendance = today;
            UserDB.save(senderName, user);
            return replier.reply("🎁 출석 보상 100G 획득!");
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // SECTION 3. 관리자 시스템
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (isAdmin && msg === ".관리자명령어") {
            return replier.reply("🛠️ [ 관리자 도구 ]\n.백업\n.복구 확인\n.유저체크 [이름]");
        }
    }
};

module.exports = Handler; // 절대 잊으면 안 되는 줄!
