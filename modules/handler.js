const UserDB = require("./user");
const AdminDB = require("./admin");

var Handler = {};

Handler.process = function(room, msg, sender, isGroupChat, replier) {
    // [기본 설정] 발신자 이름 정제 및 권한 확인
    var senderName = sender.toString().trim();
    var admins = AdminDB.getAdmins() || ["관리자"];
    var isAdmin = (senderName === "관리자" || admins.indexOf(senderName) > -1);
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + senderName + ".json").exists();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SECTION 1. 가입 및 초기 가이드
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (msg === ".가입") {
        if (isRegistered) {
            return replier.reply("🔔 [" + senderName + "]님은 이미 가입되어 있습니다.");
        }
        var newUser = UserDB.get(senderName);
        UserDB.save(senderName, newUser);
        return replier.reply("🎊 [ 가입 완료 ]\n" + senderName + "님 환영합니다!\n[.메뉴]를 입력하여 시작해보세요.");
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
    
    // [2-1] 메뉴 호출
    if (msg === ".메뉴") {
        var menu = "🎮 [ 매일 메뉴 ]\n" + "━".repeat(12) + "\n1️⃣ .정보\n2️⃣ .캐릭터\n3️⃣ .출석\n" + (isAdmin ? "🛠️ .관리자명령어\n" : "") + "━".repeat(12);
        return replier.reply(menu);
    } 

    // [2-2] 정보 확인
    if (msg === ".정보") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        var info = "📜 [ " + senderName + " 정보 ]\n" + "━".repeat(12) + "\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n" + "━".repeat(12);
        return replier.reply(info);
    }

    // [2-3] 매일 출석
    if (msg === ".출석") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) {
            return replier.reply("🔔 오늘 이미 보상을 받았습니다.");
        } else {
            user.money += 100; user.exp += 50; user.lastAttendance = today;
            UserDB.checkLevelUp(user);
            UserDB.save(senderName, user);
            return replier.reply("🎁 [ 매일 출석 완료 ]\n보상: 100G / 50EXP를 받았습니다!");
        }
    }

    // [2-4] 캐릭터 메뉴
    if (msg === ".캐릭터") {
        return replier.reply("⚔️ [ 캐릭터 ]\n보유 중인 캐릭터 목록을 불러오는 중입니다...");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SECTION 3. 관리자 전용 명령어 (ADMIN ONLY)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isAdmin) {
        
        if (msg === ".관리자명령어") {
            var adminMenu = "🛠️ [ 관리자 시스템 ]\n• .관리자추가 [이름]\n• .관리자제거 [이름]\n• .백업\n• .복구 확인\n• .초기화 [이름]\n• .닉네임변경 [기존]>[신규]\n• .유저체크 [이름]";
            return replier.reply(adminMenu);
        }

        if (msg.startsWith(".관리자추가 ")) {
            var target = msg.replace(".관리자추가 ", "").trim();
            if (AdminDB.add(target)) return replier.reply("✅ [" + target + "]님을 관리자로 임명했습니다.");
            return replier.reply("⚠️ 이미 관리자이거나 추가할 수 없습니다.");
        }

        if (msg.startsWith(".관리자제거 ")) {
            var target = msg.replace(".관리자제거 ", "").trim();
            if (AdminDB.remove(target)) return replier.reply("✅ [" + target + "]님을 관리자에서 제외했습니다.");
            return replier.reply("⚠️ 관리자가 아니거나 기본 관리자는 제거할 수 없습니다.");
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
                return replier.reply("💾 [백업] 모든 데이터 저장 완료.");
            } catch (e) { return replier.reply("❌ 백업 실패: " + e.message); }
        }
    }
};

// [Final] 모듈 내보내기 (이 부분이 있어야 main.js에서 작동합니다)
module.exports = Handler;
