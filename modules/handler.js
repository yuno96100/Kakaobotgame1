const UserDB = require("./user");
const AdminDB = require("./admin");

var Handler = {};

Handler.process = function(room, msg, sender, isGroupChat, replier) {
    
    // [기본 설정] 발신자 이름 정제 및 권한 확인
    var senderName = sender.toString().trim();
    var admins = AdminDB.getAdmins();
    var isAdmin = (senderName === "관리자" || admins.indexOf(senderName) > -1);
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + senderName + ".json").exists();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SECTION 1. 가입 및 초기화 (연동 없음)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (msg === ".가입") {
        if (isRegistered) {
            return replier.reply("🔔 [" + senderName + "]님은 이미 등록된 소환사입니다.");
        }
        var newUser = UserDB.get(senderName);
        UserDB.save(senderName, newUser);
        return replier.reply("🎊 [ 가입 완료 ]\n" + senderName + "님 환영합니다!\n이제 모든 명령어를 사용하실 수 있습니다.");
    }

    // 미가입 유저 가드
    if (!isRegistered) {
        if (msg.startsWith(".")) return replier.reply("⚠️ [.가입]을 먼저 입력하여 등록을 해주세요.");
        return;
    }

    var user = UserDB.get(senderName);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SECTION 2. 유저 공통 메뉴 (매일 시스템)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // [2-1] 메인 메뉴
    if (msg === ".메뉴") {
        var menu = "🎮 [ 매일 메뉴 ]\n" + "━".repeat(12) + "\n1️⃣ .정보\n2️⃣ .캐릭터\n3️⃣ .출석\n" + (isAdmin ? "🛠️ .관리자명령어\n" : "") + "━".repeat(12);
        return replier.reply(menu);
    } 

    // [2-2] 내 정보 확인
    if (msg === ".정보") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        var info = "📜 [ " + senderName + " 정보 ]\n" + "━".repeat(12) + "\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n" + "━".repeat(12);
        return replier.reply(info);
    }

    // [2-3] 매일 출석 보상
    if (msg === ".출석") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) {
            return replier.reply("🔔 오늘 이미 보상을 받았습니다.\n내일 다시 소환해 주세요!");
        } else {
            user.money += 100; user.exp += 50; user.lastAttendance = today;
            UserDB.checkLevelUp(user);
            UserDB.save(senderName, user);
            return replier.reply("🎁 [ 매일 출석 완료 ]\n보상: 100G / 50EXP를 획득했습니다!");
        }
    }

    // [2-4] 캐릭터 확인
    if (msg === ".캐릭터") {
        return replier.reply("⚔️ [ 캐릭터 ]\n" + "━".repeat(12) + "\n보유 캐릭터 목록을 구성 중입니다...\n" + "━".repeat(12));
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SECTION 3. 관리자 전용 명령어 (ADMIN ONLY)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isAdmin) {
        
        // [3-1] 관리자 명령어 도움말
        if (msg === ".관리자명령어") {
            var adminMenu = "🛠️ [ 관리자 시스템 ]\n" + "━".repeat(12) + "\n• .관리자추가 [이름]\n• .관리자제거 [이름]\n• .백업\n• .복구 확인\n• .초기화 [이름]\n• .닉네임변경 [기존]>[신규]\n• .유저체크 [이름]\n" + "━".repeat(12);
            return replier.reply(adminMenu);
        }

        // [3-2] 특정 유저 강제 체크
        if (msg.startsWith(".유저체크 ")) {
            var target = msg.replace(".유저체크 ", "").trim();
            var tData = UserDB.get(target);
            return replier.reply("🔍 [유저정보: " + target + "]\nLv." + tData.level + " / " + tData.money.toLocaleString() + "G");
        }

        // [3-3] 데이터 전체 백업
        if (msg === ".백업") {
            try {
                var src = new java.io.File("sdcard/msgbot/Bots/sub/data/");
                var bak = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                if (!bak.exists()) bak.mkdirs();
                var files = src.listFiles();
                for (var i = 0; i < files.length; i++) {
                    if (files[i].isFile()) FileStream.write("sdcard/msgbot/Bots/sub/backup/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                return replier.reply("💾 [백업] 모든 데이터 저장 완료.");
            } catch (e) { return replier.reply("❌ 백업 실패: " + e.message); }
        }

        // [3-4] 데이터 복구
        if (msg === ".복구 확인") {
            try {
                var bakDir = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                var files = bakDir.listFiles();
                if (!files || files.length == 0) return replier.reply("❌ 백업 파일이 없습니다.");
                for (var i = 0; i < files.length; i++) {
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                UserDB.clearCache();
                return replier.reply("✅ [복구] 데이터 복원 완료.");
            } catch (e) { return replier.reply("❌ 복구 실패: " + e.message); }
        }

        // [3-5] 닉네임 강제 변경 (파일명 변경 포함)
        if (msg.startsWith(".닉네임변경 ")) {
            var parts = msg.replace(".닉네임변경 ", "").split(">");
            if (parts.length < 2) return replier.reply("❌ 형식: .닉네임변경 기존>신규");
            var oldN = parts[0].trim(), newN = parts[1].trim();
            var oldP = "sdcard/msgbot/Bots/sub/data/" + oldN + ".json";
            if (java.io.File(oldP).exists()) {
                FileStream.write("sdcard/msgbot/Bots/sub/data/" + newN + ".json", FileStream.read(oldP));
                return replier.reply("🔄 [변경] " + oldN + " ➔ " + newN + " 완료.");
            } else {
                return replier.reply("❌ [" + oldN + "] 유저가 없습니다.");
            }
        }
    }
};

// [Final] 모듈 내보내기 고정
module.exports = Handler;
