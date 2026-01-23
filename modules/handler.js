const UserDB = require("./user");
const AdminDB = require("./admin");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    if (!msg) return; // 빈 메시지 보호
    
    var admins = AdminDB.getAdmins() || [];
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();

    // [ 1. 가입 제어 ]
    // 미가입자라면 어떤 채팅을 쳐도 가입 안내를 반복합니다.
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender);
            replier.reply("🎊 [ 가입 성공 ]\n" + sender + "님 환영합니다!\n\n📜 '.메뉴'를 입력하세요.");
            return;
        }
        // 미가입자가 보낸 모든 메시지에 대해 반복 알림
        replier.reply("⚔️ [ 소환사의 협곡 ]\n━━━━━━━━━━━━━━\n등록되지 않은 소환사입니다.\n\n👉 참여를 위해 [.가입] 입력!");
        return;
    }
    
    // 이미 가입된 유저가 다시 가입을 시도할 때
    if (msg === ".가입") {
        replier.reply("🔔 [ 알림 ]\n이미 리그에 등록된 소환사입니다.\n명령어 확인은 [.메뉴]를 입력하세요.");
        return;
    }

    // 가입 확인 후 유저 데이터 로드
    var user = UserDB.get(sender);
    if (!user) return; 

    // [ 2. 메인 메뉴 ]
    if (msg === ".메뉴" || msg === ".돌아가기") {
        var menu = "🎮 [ 메인 메뉴 ]\n━━━━━━━━━━━━━━\n1️⃣ 소환사 정보\n2️⃣ 캐릭터\n3️⃣ 일일 출석\n";
        if (isAdmin) menu += "🛠️ 관리자 제어 콘솔\n";
        menu += "━━━━━━━━━━━━━━\n [ 📜 명령어 안내 ]\n • 정보 확인 ➔ .정보\n • 캐릭터 관리 ➔ .캐릭터\n • 매일 출석 ➔ .출석";
        if (isAdmin) menu += "\n • 관리 도구 ➔ .관리자명령어";
        replier.reply(menu);
        return;
    }

    // [ 3. 유저 명령어 ]
    if (msg === ".정보") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        replier.reply("📜 [ 소환사 정보 ]\n━━━━━━━━━━━━━━\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ 레벨: Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n⚔️ 전적: " + user.win + "승 " + user.loss + "패\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    if (msg === ".출석") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) return replier.reply("🔔 [ 출석 알림 ]\n이미 보상을 받으셨습니다.");
        
        user.money += 100; user.exp += 50; user.lastAttendance = today;
        var up = UserDB.checkLevelUp(user);
        UserDB.save(sender, user);
        
        replier.reply("🎁 [ 출석 완료 ]\n+100G / +50EXP 獲得!" + (up ? "\n🎊 레벨업! Lv." + user.level : "") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    if (msg === ".캐릭터") {
        replier.reply("⚔️ [ 캐릭터 ]\n━━━━━━━━━━━━━━\n보유 캐릭터: " + (user.ownedChars ? user.ownedChars.join(", ") : "101") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    // [ 4. 관리자 명령어 ]
    if (isAdmin) {
        if (msg === ".관리자명령어") {
            var adm = "🛠️ [ 관리자 시스템 ]\n━━━━━━━━━━━━━━\n1. 권한: .관리자추가 / .관리자제거\n2. 데이터: .백업 / .복구 확인\n3. 유저: .닉네임변경 / .초기화\n━━━━━━━━━━━━━━\n🔙 [.메뉴]";
            replier.reply(adm);
            return;
        }
        
        if (msg.startsWith(".관리자추가 ")) {
            var t = msg.replace(".관리자추가 ", "").trim();
            if (AdminDB.add(t)) replier.reply("✅ " + t + " 관리자 임명.");
            else replier.reply("❌ 실패: 권한이 없거나 유저가 없습니다.");
            return;
        }

        if (msg.startsWith(".관리자제거 ")) {
            var t = msg.replace(".관리자제거 ", "").trim();
            if (AdminDB.remove(t)) replier.reply("✅ " + t + " 관리자 해제.");
            else replier.reply("❌ 실패.");
            return;
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
                replier.reply("💾 [백업 완료]");
            } catch (e) { replier.reply("❌ 에러: " + e.message); }
            return;
        }
        
        if (msg === ".복구 확인") {
            try {
                var bakDir = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                var files = bakDir.listFiles();
                for (var i = 0; i < files.length; i++) {
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                UserDB.clearCache();
                replier.reply("✅ [복구 완료]");
            } catch (e) { replier.reply("❌ 에러: " + e.message); }
            return;
        }

        if (msg.startsWith(".닉네임변경 ")) {
            try {
                var p = msg.replace(".닉네임변경 ", "").split(">");
                var o = p[0].trim(), n = p[1].trim();
                FileStream.write("sdcard/msgbot/Bots/sub/data/" + n + ".json", FileStream.read("sdcard/msgbot/Bots/sub/data/" + o + ".json"));
                replier.reply("🔄 [이전 완료] " + o + " ➔ " + n);
            } catch (e) { replier.reply("❌ 에러: " + e.message); }
            return;
        }

        if (msg.startsWith(".초기화 ")) {
            var t = msg.replace(".초기화 ", "").trim();
            UserDB.save(t, { name: t, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" });
            replier.reply("⚠️ [" + t + "] 초기화 완료.");
            return;
        }
    }
};

module.exports = Handler;
