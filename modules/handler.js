const UserDB = require("./user");
const AdminDB = require("./admin");

const Handler = {};

Handler.process = function(room, msg, sender, isGroupChat, replier) {
    var admins = AdminDB.getAdmins();
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 1. 가입 로직 ] - 연동 없이 즉시 가입
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (msg === ".가입") {
        if (isRegistered) {
            return replier.reply("🔔 [" + sender + "]님은 이미 가입된 상태입니다.");
        }
        var newUser = UserDB.get(sender); // 기본 데이터 생성
        UserDB.save(sender, newUser);
        return replier.reply("🎊 [ 가입 완료 ]\n" + sender + " 소환사님 환영합니다!\n이제 바로 명령어를 사용하실 수 있습니다.");
    }

    // 미가입자 차단 (가입 명령어 제외)
    if (!isRegistered) {
        if (msg.startsWith(".")) return replier.reply("⚠️ [.가입]을 먼저 입력하여 소환사 등록을 해주세요.");
        return;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 2. 유저 공통 메뉴 ]
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    var user = UserDB.get(sender);

    if (msg === ".메뉴") {
        var menu = "🎮 [ 매일 메뉴 ]\n" + "━".repeat(12) + "\n1️⃣ .정보\n2️⃣ .캐릭터\n3️⃣ .출석\n" + (isAdmin ? "🛠️ .관리자명령어\n" : "") + "━".repeat(12);
        replier.reply(menu);
    } 

    else if (msg === ".정보") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        var info = "📜 [ " + sender + " 정보 ]\n" + "━".repeat(12) + "\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n" + "━".repeat(12);
        replier.reply(info);
    }

    else if (msg === ".출석") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) {
            replier.reply("🔔 이미 오늘의 보상을 받으셨습니다.");
        } else {
            user.money += 100; user.exp += 50; user.lastAttendance = today;
            UserDB.checkLevelUp(user);
            UserDB.save(sender, user);
            replier.reply("🎁 [ 매일 출석 완료 ]\n보상: 100G / 50EXP 획득!");
        }
    }

    else if (msg === ".캐릭터") {
        replier.reply("⚔️ [ 캐릭터 ]\n" + "━".repeat(12) + "\n보유 캐릭터를 불러오는 중입니다...\n" + "━".repeat(12));
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 3. 관리자 기능 ]
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isAdmin) {
        if (msg === ".관리자명령어") {
            replier.reply("🛠️ [ 관리자 시스템 ]\n• .관리자추가 [이름]\n• .관리자제거 [이름]\n• .백업\n• .복구 확인\n• .초기화 [이름]\n• .닉네임변경 [A]>[B]\n• .유저체크 [이름]");
        }
        else if (msg.startsWith(".유저체크 ")) {
            var target = msg.replace(".유저체크 ", "").trim();
            var tData = UserDB.get(target);
            replier.reply("🔍 유저정보: " + target + "\nLv." + tData.level + " / " + tData.money + "G");
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
                replier.reply("💾 백업 완료");
            } catch (e) { replier.reply("❌ 실패: " + e); }
        }
        else if (msg === ".복구 확인") {
            try {
                var bakDir = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                var files = bakDir.listFiles();
                for (var i = 0; i < files.length; i++) {
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                UserDB.clearCache();
                replier.reply("✅ 복구 완료");
            } catch (e) { replier.reply("❌ 실패: " + e); }
        }
        else if (msg.startsWith(".닉네임변경 ")) {
            var parts = msg.replace(".닉네임변경 ", "").split(">");
            var oldN = parts[0].trim(), newN = parts[1].trim();
            FileStream.write("sdcard/msgbot/Bots/sub/data/" + newN + ".json", FileStream.read("sdcard/msgbot/Bots/sub/data/" + oldN + ".json"));
            replier.reply("🔄 " + oldN + " ➔ " + newN + " 변경 완료.");
        }
        else if (msg.startsWith(".초기화 ")) {
            var target = msg.replace(".초기화 ", "").trim();
            UserDB.save(target, { name: target, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, roomName: "", lastAttendance: "" });
            replier.reply("⚠️ " + target + " 초기화 완료.");
        }
    }
};

module.exports = Handler;
