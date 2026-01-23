const UserDB = require("./user");
const AdminDB = require("./admin");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    if (!msg) return; // [방어] 빈 메시지 무시
    
    var admins = AdminDB.getAdmins() || []; // [방어] null 에러 방지
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();

    // [ 1. 가입 제어 ]
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender);
            replier.reply("🎊 [ 가입 성공 ]\n" + sender + "님 환영합니다!\n\n📜 '.메뉴'를 입력하세요.");
            return;
        }
        if (msg.startsWith(".")) {
            replier.reply("⚔️ [ 소환사의 협곡 ]\n━━━━━━━━━━━━━━\n등록되지 않은 소환사입니다.\n\n👉 참여를 위해 [.가입] 입력!");
        }
        return;
    }
    
    if (msg === ".가입") {
        replier.reply("🔔 [ 알림 ]\n이미 리그에 등록된 소환사입니다.\n명령어 확인은 [.메뉴]를 입력하세요.");
        return;
    }

    // [최적화] 가입 확인 후 한 번만 데이터 로드
    var user = UserDB.get(sender);
    if (!user) return; 

    // [ 2. 메인 메뉴 ]
    if (msg === ".메뉴" || msg === ".돌아가기") {
        var menu = "🎮 [ 메인 메뉴 ]\n━━━━━━━━━━━━━━\n1️⃣ 소환사 정보 (.정보)\n2️⃣ 캐릭터 (.캐릭터)\n3️⃣ 일일 출석 (.출석)\n";
        if (isAdmin) menu += "🛠️ 관리자 제어 콘솔\n";
        menu += "━━━━━━━━━━━━━━\n [ 📜 명령어 안내 ]\n • 정보 확인 ➔ .정보 (또는 1)\n • 캐릭터 관리 ➔ .캐릭터 (또는 2)\n • 매일 출석 ➔ .출석 (또는 3)";
        if (isAdmin) menu += "\n • 관리 도구 ➔ .관리자명령어";
        replier.reply(menu);
        return;
    }

    // [ 3. 유저 명령어 ]
    // 숫자 트리거 및 정식 명령어 통합 처리
    if (msg === ".정보" || msg === "1") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        replier.reply("📜 [ 소환사 정보 ]\n━━━━━━━━━━━━━━\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ 레벨: Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n⚔️ 전적: " + user.win + "승 " + user.loss + "패\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    if (msg === ".출석" || msg === "3") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) return replier.reply("🔔 [ 출석 알림 ]\n이미 보상을 받으셨습니다.");
        
        user.money += 100; user.exp += 50; user.lastAttendance = today;
        var up = UserDB.checkLevelUp(user);
        UserDB.save(sender, user);
        
        replier.reply("🎁 [ 출석 완료 ]\n+100G / +50EXP 획득!" + (up ? "\n🎊 레벨업! Lv." + user.level : "") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    if (msg === ".캐릭터" || msg === "2") {
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
        
        if (msg.indexOf(".관리자추가 ") === 0) {
            var t = msg.replace(".관리자추가 ", "").trim();
            if (AdminDB.add(t)) replier.reply("✅ " + t + " 관리자 임명.");
            else replier.reply("❌ 실패: 권한이 없거나 유저가 없습니다.");
            return;
        }
        
        if (msg.indexOf(".초기화 ") === 0) {
            var t = msg.replace(".초기화 ", "").trim();
            UserDB.save(t, { name: t, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" });
            replier.reply("⚠️ [" + t + "] 초기화 완료.");
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
    }
};

module.exports = Handler;
