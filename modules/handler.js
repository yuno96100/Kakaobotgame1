const UserDB = require("./user");
const AdminDB = require("./admin");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    // 1. 권한 판정
    var admins = AdminDB.getAdmins();
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();

    // 2. 가입 및 초기 접속 제어
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender);
            replier.reply("🎊 [ 가입 성공 ]\n" + sender + "님 환영합니다!\n\n.메뉴를 입력하세요.");
            return;
        }
        replier.reply("⚔️ [ 소환사의 협곡 ]\n━━━━━━━━━━━━━━\n미가입 유저입니다.\n\n👉 [.가입] 입력!");
        return;
    }
    if (msg === ".가입") return;

    var user = UserDB.get(sender);

    // 3. 메인 메뉴
    if (msg === ".메뉴" || msg === ".돌아가기") {
        var menu = "🎮 [ 메인 메뉴 ]\n━━━━━━━━━━━━━━\n1️⃣ 소환사 정보\n2️⃣ 캐릭터\n3️⃣ 일일 출석\n";
        if (isAdmin) menu += "🛠️ 관리자 제어 콘솔\n";
        menu += "━━━━━━━━━━━━━━\n [ 📜 명령어 안내 ]\n • 정보 확인 ➔ .정보\n • 캐릭터 관리 ➔ .캐릭터\n • 매일 출석 ➔ .출석";
        if (isAdmin) menu += "\n • 관리 도구 ➔ .관리자명령어";
        replier.reply(menu);
        return;
    }

    // 4. 일반 명령어
    if (msg === ".정보") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        replier.reply("📜 [ 소환사 정보 ]\n━━━━━━━━━━━━━━\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ 레벨: Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    if (msg === ".출석") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) return replier.reply("🔔 이미 출석하셨습니다.");
        user.money += 100; user.exp += 50; user.lastAttendance = today;
        var up = UserDB.checkLevelUp(user);
        UserDB.save(sender, user);
        replier.reply("🎁 출석 완료! (+100G / +50EXP)" + (up ? "\n🎊 레벨업! Lv." + user.level : "") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    // 5. 관리자 전용 로직 (isAdmin === true)
    if (isAdmin) {
        if (msg === ".관리자명령어") {
            var adm = "🛠️ [ 관리자 시스템 ]\n━━━━━━━━━━━━━━\n1. 권한: .관리자추가 / .관리자제거\n2. 데이터: .백업 / .복구 확인\n3. 유저: .닉네임변경 / .초기화\n━━━━━━━━━━━━━━\n [ 📜 상세 명령어 안내 ]\n • 추가 ➔ .관리자추가 [이름]\n • 제거 ➔ .관리자제거 [이름]\n • 백업 ➔ .백업\n • 복구 ➔ .복구 확인\n • 이전 ➔ .닉네임변경 [A] > [B]\n • 리셋 ➔ .초기화 [이름]\n━━━━━━━━━━━━━━\n🔙 [.메뉴]";
            replier.reply(adm);
            return;
        }

        // [권한 추가/제거]
        if (msg.startsWith(".관리자추가 ")) {
            var target = msg.replace(".관리자추가 ", "").trim();
            if (AdminDB.add(target)) replier.reply("✅ " + target + " 님을 관리자로 임명했습니다.");
            else replier.reply("❌ 실패: 이미 관리자이거나 데이터가 없습니다.");
            return;
        }
        if (msg.startsWith(".관리자제거 ")) {
            var target = msg.replace(".관리자제거 ", "").trim();
            if (AdminDB.remove(target)) replier.reply("✅ " + target + " 님을 관리자에서 해제했습니다.");
            else replier.reply("❌ 실패: 마스터(관리자)는 제거할 수 없거나 목록에 없습니다.");
            return;
        }

        // [데이터 백업]
        if (msg === ".백업") {
            try {
                var src = new java.io.File("sdcard/msgbot/Bots/sub/data/");
                var bak = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                if (!bak.exists()) bak.mkdirs();
                var files = src.listFiles();
                for (var i = 0; i < files.length; i++) {
                    if (files[i].isFile()) FileStream.write("sdcard/msgbot/Bots/sub/backup/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                replier.reply("💾 [백업 완료] 모든 데이터가 backup 폴더에 저장되었습니다.");
            } catch (e) { replier.reply("❌ 백업 실패: " + e.message); }
            return;
        }

        // [데이터 복구]
        if (msg === ".복구 확인") {
            try {
                var bakDir = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                var files = bakDir.listFiles();
                if (!files || files.length === 0) return replier.reply("❌ 백업 데이터가 없습니다.");
                for (var i = 0; i < files.length; i++) {
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                UserDB.clearCache();
                replier.reply("✅ [복구 완료] 백업본으로 데이터를 교체했습니다. (캐시 초기화 포함)");
            } catch (e) { replier.reply("❌ 복구 실패: " + e.message); }
            return;
        }

        // [닉네임 변경/데이터 이전]
        if (msg.startsWith(".닉네임변경 ")) {
            try {
                var names = msg.replace(".닉네임변경 ", "").split(">");
                if (names.length !== 2) return replier.reply("❌ 형식: .닉네임변경 이전닉네임 > 새닉네임");
                var oldN = names[0].trim(), newN = names[1].trim();
                var oldF = new java.io.File("sdcard/msgbot/Bots/sub/data/" + oldN + ".json");
                if (oldF.exists()) {
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + newN + ".json", FileStream.read(oldF.getAbsolutePath()));
                    replier.reply("🔄 [이전 완료] " + oldN + " ➔ " + newN);
                } else replier.reply("❌ 원본 데이터 [" + oldN + "]를 찾을 수 없습니다.");
            } catch (e) { replier.reply("❌ 에러: " + e.message); }
            return;
        }

        // [유저 초기화]
        if (msg.startsWith(".초기화 ")) {
            var target = msg.replace(".초기화 ", "").trim();
            var newData = { name: target, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" };
            UserDB.save(target, newData);
            replier.reply("⚠️ [" + target + "] 소환사 데이터 초기화 완료.");
            return;
        }
    }
};

module.exports = Handler;
