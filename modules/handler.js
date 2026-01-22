const UserDB = require("./user");
const AdminDB = require("./admin");

const Handler = {};

Handler.process = function(room, msg, sender, isGroupChat, replier) {
    // 관리자 판정: 이름이 '관리자'이거나 admin_list에 등록된 경우
    var admins = AdminDB.getAdmins();
    var isAdmin = (sender === "관리자" || admins.indexOf(sender) > -1);
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 1. 가입 로직 ] - 즉시 가입
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (msg === ".가입") {
        if (isRegistered) {
            replier.reply("🔔 [" + sender + "]님은 이미 가입된 상태입니다.");
        } else {
            var newUser = UserDB.get(sender);
            UserDB.save(sender, newUser);
            replier.reply("🎊 [ 가입 완료 ]\n" + sender + " 소환사님 환영합니다!\n이제 모든 명령어를 사용하실 수 있습니다.");
        }
        return;
    }

    // 미가입자 차단
    if (!isRegistered) {
        if (msg.startsWith(".")) replier.reply("⚠️ [.가입]을 먼저 입력하여 소환사 등록을 해주세요.");
        return;
    }

    var user = UserDB.get(sender);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 2. 유저 공통 메뉴 ]
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (msg === ".메뉴") {
        var menu = "🎮 [ 매일 메뉴 ]\n" + "━".repeat(12) + "\n1️⃣ .정보\n2️⃣ .캐릭터\n3️⃣ .출석\n" + (isAdmin ? "🛠️ .관리자명령어\n" : "") + "━".repeat(12);
        replier.reply(menu);
    } 

    else if (msg === ".정보") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        replier.reply("📜 [ " + sender + " 정보 ]\n" + "━".repeat(12) + "\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n" + "━".repeat(12));
    }

    else if (msg === ".출석") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) {
            replier.reply("🔔 오늘 이미 보상을 받았습니다.");
        } else {
            user.money += 100; user.exp += 50; user.lastAttendance = today;
            UserDB.checkLevelUp(user);
            UserDB.save(sender, user);
            replier.reply("🎁 [ 매일 출석 완료 ]\n100G와 50EXP를 획득했습니다!");
        }
    }

    else if (msg === ".캐릭터") {
        replier.reply("⚔️ [ 캐릭터 ]\n" + "━".repeat(12) + "\n보유 캐릭터 목록을 불러오는 중입니다...\n" + "━".repeat(12));
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 3. 관리자 전용 명령어 ]
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isAdmin) {
        if (msg === ".관리자명령어") {
            replier.reply("🛠️ [ 관리자 시스템 ]\n" + "━".repeat(12) + "\n• .관리자추가 [이름]\n• .관리자제거 [이름]\n• .백업\n• .복구 확인\n• .초기화 [이름]\n• .닉네임변경 [A]>[B]\n• .유저체크 [이름]\n" + "━".repeat(12));
        }
        else if (msg.startsWith(".유저체크 ")) {
            var target = msg.replace(".유저체크 ", "").trim();
            var tData = UserDB.get(target);
            replier.reply("🔍 [유저정보: " + target + "]\nLv." + tData.level + " / " + tData.money.toLocaleString() + "G");
        }
        else if (msg === ".백업") {
            try {
                var src = new java.io.File("sdcard/msgbot/Bots/sub/data/");
                var bak = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                if (!bak.exists()) bak.mkdirs();
                var files = src.listFiles();
                for (var i = 0; i < files.length; i++) {
                    if (files[i].isFile()) FileStream.write("sdcard/msgbot/Bots/sub/backup/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                replier.reply("💾 [백업] 전체 데이터 저장 완료");
            } catch (e) { replier.reply("❌ 백업 실패: " + e); }
        }
        else if (msg === ".복구 확인") {
            try {
                var bakDir = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                var files = bakDir.listFiles();
                if (!files || files.length == 0) return replier.reply("❌ 백업 파일이 없습니다.");
                for (var i = 0; i < files.length; i++) {
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                UserDB.clearCache();
                replier.reply("✅ [복구] 데이터 복원 완료");
            } catch (e) { replier.reply("❌ 복구 실패: " + e); }
        }
        else if (msg.startsWith(".닉네임변경 ")) {
            var parts = msg.replace(".닉네임변경 ", "").split(">");
            var oldN = parts[0].trim(), newN = parts[1].trim();
            var oldPath = "sdcard/msgbot/Bots/sub/data/" + oldN + ".json";
            if (java.io.File(oldPath).exists()) {
                FileStream.write("sdcard/msgbot/Bots/sub/data/" + newN + ".json", FileStream.read(oldPath));
                replier.reply("🔄 " + oldN + " ➔ " + newN + " 변경 완료.");
            } else {
                replier.reply("❌ 대상 유저가 없습니다.");
            }
        }
        else if (msg.startsWith(".초기화 ")) {
            var target = msg.replace(".초기화 ", "").trim();
            UserDB.save(target, { name: target, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, roomName: "", lastAttendance: "" });
            replier.reply("⚠️ " + target + " 초기화 완료.");
        }
    }
};

module.exports = Handler;
