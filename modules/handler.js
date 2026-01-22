const UserDB = require("./user");
const AdminDB = require("./admin");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    // 1. 권한 판정
    var admins = AdminDB.getAdmins();
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();

    // 2. 미가입 유저 제어
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender);
            replier.reply("🎊 [ 가입 성공 ]\n" + sender + "님 환영합니다!\n\n📜 '.메뉴'를 입력하여 시작하세요.");
            return;
        }
        replier.reply("⚔️ [ 소환사의 협곡 ]\n━━━━━━━━━━━━━━\n등록되지 않은 소환사입니다.\n\n👉 참여를 위해 [.가입]을 입력해주세요!");
        return;
    }
    
    // [ 추가된 부분 ] 이미 가입된 유저가 .가입을 칠 경우
    if (msg === ".가입") {
        replier.reply("🔔 [ 알림 ]\n이미 리그에 등록된 소환사입니다.\n명령어 확인은 [.메뉴]를 입력하세요.");
        return;
    }

    // 가입된 유저 데이터 로드 (캐시 참조)
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

    // 4. 일반 명령어 (정보/출석/캐릭터)
    if (msg === ".정보") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        replier.reply("📜 [ 소환사 정보 ]\n━━━━━━━━━━━━━━\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ 레벨: Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n⚔️ 전적: " + user.win + "승 " + user.loss + "패\n━━━━━━━━━━━━━━\n🔙 돌아가기 ➔ [.메뉴]");
        return;
    }

    if (msg === ".출석") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) return replier.reply("🔔 [ 출석 알림 ]\n이미 오늘의 보상을 받으셨습니다.");
        user.money += 100; user.exp += 50; user.lastAttendance = today;
        var up = UserDB.checkLevelUp(user);
        UserDB.save(sender, user);
        replier.reply("🎁 [ 출석 완료 ]\n보상으로 100G와 50EXP를 획득했습니다!" + (up ? "\n🎊 레벨업! Lv." + user.level : "") + "\n━━━━━━━━━━━━━━\n🔙 돌아가기 ➔ [.메뉴]");
        return;
    }

    if (msg === ".캐릭터") {
        replier.reply("⚔️ [ 캐릭터 인벤토리 ]\n━━━━━━━━━━━━━━\n보유 중인 캐릭터 목록을 불러오고 있습니다...\n(현재 개발 중인 기능입니다)\n━━━━━━━━━━━━━━\n🔙 돌아가기 ➔ [.메뉴]");
        return;
    }

    // 5. 관리자 전용 로직
    if (isAdmin) {
        if (msg === ".관리자명령어") {
            var adm = "🛠️ [ 관리자 시스템 ]\n━━━━━━━━━━━━━━\n1. 권한: .관리자추가 / .관리자제거\n2. 데이터: .백업 / .복구 확인\n3. 유저: .닉네임변경 / .초기화\n━━━━━━━━━━━━━━\n [ 📜 명령어 안내 ]\n • 추가 ➔ .관리자추가 [이름]\n • 이전 ➔ .닉네임변경 [A] > [B]\n • 백업 ➔ .백업 / 복구 ➔ .복구 확인\n━━━━━━━━━━━━━━\n🔙 돌아가기 ➔ [.메뉴]";
            replier.reply(adm);
            return;
        }

        if (msg.startsWith(".관리자추가 ")) {
            var target = msg.replace(".관리자추가 ", "").trim();
            if (AdminDB.add(target)) replier.reply("✅ " + target + " 님을 관리자로 임명했습니다.");
            else replier.reply("❌ 실패: 이미 관리자이거나 데이터가 없습니다.");
            return;
        }

        if (msg.startsWith(".관리자제거 ")) {
            var target = msg.replace(".관리자제거 ", "").trim();
            if (AdminDB.remove(target)) replier.reply("✅ " + target + " 님을 관리자에서 해제했습니다.");
            else replier.reply("❌ 실패: 목록에 없거나 마스터 계정입니다.");
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
                replier.reply("💾 [백업 완료] 전체 데이터 백업 성공.");
            } catch (e) { replier.reply("❌ 백업 실패: " + e.message); }
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
                replier.reply("✅ [복구 완료] 백업 데이터 적용 및 캐시 갱신 완료.");
            } catch (e) { replier.reply("❌ 복구 실패: " + e.message); }
            return;
        }

        if (msg.startsWith(".닉네임변경 ")) {
            try {
                var parts = msg.replace(".닉네임변경 ", "").split(">");
                var oldN = parts[0].trim(), newN = parts[1].trim();
                FileStream.write("sdcard/msgbot/Bots/sub/data/" + newN + ".json", FileStream.read("sdcard/msgbot/Bots/sub/data/" + oldN + ".json"));
                replier.reply("🔄 [이전 완료] " + oldN + " ➔ " + newN);
            } catch (e) { replier.reply("❌ 이전 실패: " + e.message); }
            return;
        }

        if (msg.startsWith(".초기화 ")) {
            var target = msg.replace(".초기화 ", "").trim();
            UserDB.save(target, { name: target, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" });
            replier.reply("⚠️ [" + target + "] 데이터 초기화 완료.");
            return;
        }
    }
};

module.exports = Handler;
