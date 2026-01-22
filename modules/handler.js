const UserDB = require("./user");
const AdminDB = require("./admin");

module.exports = {
    process: function(room, msg, sender, isGroupChat, replier) {
        // 1. 발신자 및 관리자 체크
        var senderName = sender.toString().trim();
        var admins = AdminDB.getAdmins();
        var isAdmin = (senderName === "관리자" || admins.indexOf(senderName) > -1);
        
        // 2. 가입 여부 확인
        var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + senderName + ".json").exists();

        // [ 명령어 : .가입 ]
        if (msg === ".가입") {
            if (isRegistered) {
                return replier.reply("🔔 [" + senderName + "]님은 이미 가입되어 있습니다.");
            }
            var newUser = UserDB.get(senderName);
            UserDB.save(senderName, newUser);
            return replier.reply("🎊 [ 가입 완료 ]\n" + senderName + "님 환영합니다!\n[.메뉴]를 입력해보세요.");
        }

        // 미가입자 명령어 제한
        if (!isRegistered) {
            if (msg.startsWith(".")) return replier.reply("⚠️ [.가입]을 먼저 입력해주세요.");
            return;
        }

        var user = UserDB.get(senderName);

        // [ 명령어 : .메뉴 ]
        if (msg === ".메뉴") {
            var menu = "🎮 [ 매일 메뉴 ]\n" + "━".repeat(12) + "\n1. .정보\n2. .캐릭터\n3. .출석\n" + (isAdmin ? "🛠️ .관리자명령어\n" : "") + "━".repeat(12);
            return replier.reply(menu);
        } 

        // [ 명령어 : .정보 ]
        if (msg === ".정보") {
            var expP = Math.floor((user.exp / user.maxExp) * 100);
            var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
            var info = "📜 [ " + senderName + " 정보 ]\n" + "━".repeat(12) + "\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n" + "━".repeat(12);
            return replier.reply(info);
        }

        // [ 명령어 : .출석 ]
        if (msg === ".출석") {
            var today = new Date().toLocaleDateString();
            if (user.lastAttendance === today) return replier.reply("🔔 오늘 이미 출석 보상을 받았습니다.");
            user.money += 100; user.exp += 50; user.lastAttendance = today;
            UserDB.checkLevelUp(user);
            UserDB.save(senderName, user);
            return replier.reply("🎁 [ 매일 출석 완료 ]\n100G와 50EXP를 획득했습니다!");
        }

        // [ 명령어 : .캐릭터 ]
        if (msg === ".캐릭터") {
            return replier.reply("⚔️ [ 캐릭터 ]\n보유 캐릭터 목록을 준비 중입니다.");
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // [ 관리자 전용 명령어 ]
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (isAdmin) {
            if (msg === ".관리자명령어") {
                return replier.reply("🛠️ [ 관리자 도구 ]\n.관리자추가 [이름]\n.관리자제거 [이름]\n.백업\n.복구 확인\n.초기화 [이름]\n.닉네임변경 [기존]>[신규]\n.유저체크 [이름]");
            }
            if (msg.startsWith(".유저체크 ")) {
                var target = msg.replace(".유저체크 ", "").trim();
                var tData = UserDB.get(target);
                return replier.reply("🔍 [" + target + "] 정보\nLv." + tData.level + " / " + tData.money.toLocaleString() + "G");
            }
            if (msg === ".백업") {
                try {
                    var src = new java.io.File("sdcard/msgbot/Bots/sub/data/");
                    var bak = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                    if (!bak.exists()) bak.mkdirs();
                    var files = src.listFiles();
                    for (var i = 0; i < files.length; i++) {
                        if (files[i].isFile()) FileStream.write("sdcard/msgbot/Bots/sub/backup/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                    }
                    return replier.reply("💾 [백업] 저장 완료");
                } catch(e) { return replier.reply("❌ 백업 실패: " + e.message); }
            }
            if (msg === ".복구 확인") {
                try {
                    var bakDir = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                    var files = bakDir.listFiles();
                    for (var i = 0; i < files.length; i++) {
                        FileStream.write("sdcard/msgbot/Bots/sub/data/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                    }
                    UserDB.clearCache();
                    return replier.reply("✅ [복구] 완료");
                } catch(e) { return replier.reply("❌ 복구 실패"); }
            }
            if (msg.startsWith(".닉네임변경 ")) {
                var parts = msg.replace(".닉네임변경 ", "").split(">");
                var oldN = parts[0].trim(), newN = parts[1].trim();
                FileStream.write("sdcard/msgbot/Bots/sub/data/" + newN + ".json", FileStream.read("sdcard/msgbot/Bots/sub/data/" + oldN + ".json"));
                return replier.reply("🔄 " + oldN + " ➔ " + newN + " 변경 완료.");
            }
        }
    }
};
module.exports = Handler;
