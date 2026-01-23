const UserDB = require("./user.js");
const AdminDB = require("./admin.js");

const Handler = {};
const MenuSession = {}; 
const DATA_PATH = "sdcard/msgbot/Bots/sub/data/";

Handler.process = function(msg, sender, replier) {
    if (!msg) return;
    var cleanMsg = msg.trim();
    
    // 관리자 여부 및 가입 여부 확인
    var admins = AdminDB.getAdmins();
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var userFile = new java.io.File(DATA_PATH + sender + ".json");
    var isRegistered = userFile.exists();

    // [ 1. 메인 메뉴 - 가입 여부 상관없이 최우선 응답 ]
    if (cleanMsg === ".메뉴" || cleanMsg === ".돌아가기") {
        MenuSession[sender] = "OPEN";
        var menu = "🎮 [ 메인 메뉴 ]\n━━━━━━━━━━━━━━\n1️⃣ 소환사 정보 (.정보)\n2️⃣ 캐릭터 (.캐릭터)\n3️⃣ 일일 출석 (.출석)\n";
        if (isAdmin) menu += "🛠️ 관리자 제어 콘솔\n";
        menu += "━━━━━━━━━━━━━━\n [ 📜 이용 안내 ]\n • 번호(1, 2, 3)를 입력하세요.";
        replier.reply("시스템", menu);
        return;
    }

    // [ 2. 가입 제어 ]
    if (cleanMsg === ".가입") {
        if (isRegistered) {
            MenuSession[sender] = "OPEN";
            replier.reply("시스템", "🔔 [ 알림 ]\n이미 등록된 소환사입니다.\n\n현재 바로 이용 가능한 메뉴입니다.\n번호(1~3)를 입력하세요.\n━━━━━━━━━━━━━━\n1️⃣ 정보  2️⃣ 캐릭터  3️⃣ 출석");
        } else {
            UserDB.get(sender); 
            MenuSession[sender] = "OPEN";
            replier.reply("시스템", "🎊 [ 가입 성공 ]\n" + sender + "님 환영합니다!\n\n📜 지금 바로 번호(1~3)를 입력해 보세요.");
        }
        return;
    }

    // 미가입 유저 차단
    if (!isRegistered) {
        if (cleanMsg.startsWith(".")) {
            replier.reply("시스템", "⚔️ [ 소환사의 협곡 ]\n━━━━━━━━━━━━━━\n매일 성장을 즐기는 채팅방입니다.\n등록되지 않은 소환사입니다.\n\n👉 참여를 위해 [.가입] 입력!");
        }
        return;
    }

    // [ 3. 숫자 메뉴 세션 처리 ]
    var user = UserDB.get(sender);
    if (MenuSession[sender] === "OPEN") {
        if (cleanMsg === "1") cleanMsg = ".정보";
        else if (cleanMsg === "2") cleanMsg = ".캐릭터";
        else if (cleanMsg === "3") cleanMsg = ".출석";
        
        if (["1", "2", "3"].indexOf(msg.trim()) > -1) {
            delete MenuSession[sender];
        }
    }

    // [ 4. 유저 명령어 로직 ]
    if (cleanMsg === ".정보") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        var info = "📜 [ 소환사 정보 ]\n━━━━━━━━━━━━━━\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + 
                   "\n⭐ 레벨: Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%" +
                   "\n💰 골드: " + user.money.toLocaleString() + "G\n⚔️ 전적: " + user.win + "승 " + user.loss + "패\n━━━━━━━━━━━━━━\n🔙 [.메뉴]";
        replier.reply("시스템", info);
        return;
    }

    if (cleanMsg === ".출석") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) {
            replier.reply("시스템", "🔔 [ 출석 알림 ]\n이미 오늘의 보상을 받으셨습니다.");
            return;
        }
        user.money += 100; user.exp += 50; user.lastAttendance = today;
        var up = UserDB.checkLevelUp(user);
        UserDB.save(sender, user);
        replier.reply("시스템", "🎁 [ 출석 완료 ]\n+100G / +50EXP 획득!" + (up ? "\n🎊 레벨업! Lv." + user.level : "") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    if (cleanMsg === ".캐릭터") {
        replier.reply("시스템", "⚔️ [ 캐릭터 창 ]\n━━━━━━━━━━━━━━\n보유 캐릭터: " + user.ownedChars.join(", ") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    // [ 5. 관리자 전용 명령어 ]
    if (isAdmin) {
        if (cleanMsg === ".관리자명령어") {
            var admHelp = "🛠️ [ 관리자 시스템 ]\n━━━━━━━━━━━━━━\n• .관리자추가 [이름]\n• .관리자제거 [이름]\n• .백업\n• .복구 확인\n• .닉네임변경 [기존] > [신규]\n• .초기화 [이름]\n━━━━━━━━━━━━━━\n🔙 [.메뉴]";
            replier.reply("관리자", admHelp);
            return;
        }

        if (cleanMsg.startsWith(".관리자추가 ")) {
            var target = cleanMsg.replace(".관리자추가 ", "").trim();
            if (AdminDB.add(target)) replier.reply("관리자", "✅ " + target + "님 관리자 임명.");
            else replier.reply("관리자", "❌ 실패: 이미 관리자이거나 오류.");
            return;
        }

        if (cleanMsg.startsWith(".관리자제거 ")) {
            var target = cleanMsg.replace(".관리자제거 ", "").trim();
            if (AdminDB.remove(target)) replier.reply("관리자", "✅ " + target + "님 권한 해제.");
            else replier.reply("관리자", "❌ 실패: 마스터 계정이거나 목록에 없음.");
            return;
        }

        if (cleanMsg === ".백업") {
            try {
                var src = new java.io.File(DATA_PATH);
                var bak = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                if (!bak.exists()) bak.mkdirs();
                var files = src.listFiles();
                for (var i = 0; i < files.length; i++) {
                    if (files[i].isFile()) FileStream.write("sdcard/msgbot/Bots/sub/backup/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                replier.reply("관리자", "💾 [백업 완료] 데이터 보관 성공.");
            } catch (e) { replier.reply("관리자", "❌ 에러: " + e.message); }
            return;
        }

        if (cleanMsg === ".복구 확인") {
            try {
                var bakDir = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                var files = bakDir.listFiles();
                for (var i = 0; i < files.length; i++) {
                    FileStream.write(DATA_PATH + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                UserDB.clearCache();
                replier.reply("관리자", "✅ [복구 완료] 데이터 및 캐시 갱신.");
            } catch (e) { replier.reply("관리자", "❌ 에러: " + e.message); }
            return;
        }

        if (cleanMsg.startsWith(".닉네임변경 ")) {
            try {
                var p = cleanMsg.replace(".닉네임변경 ", "").split(">");
                var o = p[0].trim(), n = p[1].trim();
                FileStream.write(DATA_PATH + n + ".json", FileStream.read(DATA_PATH + o + ".json"));
                replier.reply("관리자", "🔄 [이전 완료] " + o + " ➔ " + n);
            } catch (e) { replier.reply("관리자", "❌ 에러: " + e.message); }
            return;
        }

        if (cleanMsg.startsWith(".초기화 ")) {
            var t = cleanMsg.replace(".초기화 ", "").trim();
            UserDB.save(t, { name: t, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" });
            replier.reply("관리자", "⚠️ [" + t + "] 초기화 완료.");
            return;
        }
    }
};

module.exports = Handler;
