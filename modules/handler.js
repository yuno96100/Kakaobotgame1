const UserDB = require("./user");
const AdminDB = require("./admin");

var Handler = {
    process: function(room, msg, sender, isGroupChat, replier) {
        var senderName = sender.toString().trim();
        var admins = AdminDB.getAdmins() || ["관리자"];
        var isAdmin = (senderName === "관리자" || admins.indexOf(senderName) > -1);
        var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + senderName + ".json").exists();

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // SECTION 1. 가입 시스템
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (msg === ".가입") {
            if (isRegistered) return replier.reply("🔔 [" + senderName + "]님은 이미 등록되어 있습니다.");
            UserDB.save(senderName, UserDB.get(senderName));
            return replier.reply("🎊 [ 가입 완료 ]\n" + senderName + "님 환영합니다!\n[.메뉴]를 입력해보세요.");
        }

        if (!isRegistered) {
            if (msg.startsWith(".")) return replier.reply("⚠️ [.가입]을 먼저 입력해주세요.");
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
            var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
            return replier.reply("📜 [ " + senderName + " 정보 ]\n" + "━".repeat(12) + "\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n" + "━".repeat(12));
        }

        if (msg === ".출석") {
            var today = new Date().toLocaleDateString();
            if (user.lastAttendance === today) return replier.reply("🔔 오늘 이미 출석 보상을 받았습니다.");
            user.money += 100; user.exp += 50; user.lastAttendance = today;
            UserDB.checkLevelUp(user);
            UserDB.save(senderName, user);
            return replier.reply("🎁 [ 매일 출석 완료 ]\n100G와 50EXP 획득!");
        }

        if (msg === ".캐릭터") {
            return replier.reply("⚔️ [ 캐릭터 ]\n목록을 불러오는 중입니다.");
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // SECTION 3. 관리자 시스템
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (isAdmin) {
            if (msg === ".관리자명령어") {
                return replier.reply("🛠️ [ 관리자 도구 ]\n.관리자추가 [이름]\n.관리자제거 [이름]\n.백업\n.복구 확인\n.초기화 [이름]");
            }
            if (msg === ".백업") {
                // 백업 로직 생략(기존과 동일)
                return replier.reply("💾 백업을 시작합니다.");
            }
        }
    }
};

module.exports = Handler;
