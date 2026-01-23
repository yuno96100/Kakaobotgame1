const UserDB = require("./user.js");
const AdminDB = require("./admin.js");

const Handler = {};
const MenuSession = {}; // 메뉴 상태 저장소
const DATA_PATH = "sdcard/msgbot/Bots/sub/data/";

Handler.process = function(msg, sender, replier) {
    if (!msg) return;
    var cleanMsg = msg.trim();
    
    // 관리자 및 가입 여부 확인
    var admins = AdminDB.getAdmins();
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isRegistered = java.io.File(DATA_PATH + sender + ".json").exists();

    // [1] 메뉴 세션 처리: 1, 2, 3을 실제 명령어로 치환
    if (MenuSession[sender] === "OPEN") {
        if (cleanMsg === "1") cleanMsg = ".정보";
        else if (cleanMsg === "2") cleanMsg = ".캐릭터";
        else if (cleanMsg === "3") cleanMsg = ".출석";
        
        // 치환이 일어났든 아니든 메뉴 세션은 1회성으로 종료
        delete MenuSession[sender];
    }

    // [2] 명령어 통합 실행부 (치환된 cleanMsg로 판단)
    switch (cleanMsg) {
        case ".가입":
            if (isRegistered) {
                MenuSession[sender] = "OPEN";
                replier.reply("시스템", "🔔 이미 가입된 소환사입니다.\n\n1️⃣ 정보  2️⃣ 캐릭터  3️⃣ 출석");
            } else {
                UserDB.get(sender);
                MenuSession[sender] = "OPEN";
                replier.reply("시스템", "🎊 [ 가입 성공 ]\n" + sender + "님 환영합니다!\n\n📜 번호(1~3)를 입력해 보세요.");
            }
            break;

        case ".메뉴":
        case ".돌아가기":
            MenuSession[sender] = "OPEN"; // 메뉴를 열 때 세션 활성화
            var menu = "🎮 [ 메인 메뉴 ]\n━━━━━━━━━━━━━━\n1️⃣ 소환사 정보 (.정보)\n2️⃣ 캐릭터 (.캐릭터)\n3️⃣ 일일 출석 (.출석)\n";
            if (isAdmin) menu += "🛠️ 관리자 제어 콘솔\n";
            menu += "━━━━━━━━━━━━━━\n • 번호(1, 2, 3) 또는 명령어를 입력하세요.";
            replier.reply("시스템", menu);
            break;

        case ".정보":
            if (!isRegistered) return;
            var user = UserDB.get(sender);
            var expP = Math.floor((user.exp / user.maxExp) * 100);
            var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
            replier.reply("시스템", "📜 [ 소환사 정보 ]\n━━━━━━━━━━━━━━\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ 레벨: Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n⚔️ 전적: " + user.win + "승 " + user.loss + "패\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
            break;

        case ".출석":
            if (!isRegistered) return;
            var user = UserDB.get(sender);
            var today = new Date().toLocaleDateString();
            if (user.lastAttendance === today) return replier.reply("시스템", "🔔 이미 오늘 보상을 받았습니다.");
            user.money += 100; user.exp += 50; user.lastAttendance = today;
            var up = UserDB.checkLevelUp(user);
            UserDB.save(sender, user);
            replier.reply("시스템", "🎁 [ 출석 완료 ]\n+100G / +50EXP 획득!" + (up ? "\n🎊 레벨업! Lv." + user.level : "") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
            break;

        case ".캐릭터":
            if (!isRegistered) return;
            var user = UserDB.get(sender);
            replier.reply("시스템", "⚔️ [ 캐릭터 창 ]\n━━━━━━━━━━━━━━\n보유 캐릭터: " + user.ownedChars.join(", ") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
            break;

        case ".관리자명령어":
            if (isAdmin) {
                var admHelp = "🛠️ [ 관리자 시스템 ]\n━━━━━━━━━━━━━━\n• .관리자추가 [이름]\n• .관리자제거 [이름]\n• .백업\n• .복구 확인\n• .닉네임변경 [기존] > [신규]\n• .초기화 [이름]";
                replier.reply("관리자", admHelp);
            }
            break;

        case ".백업":
            if (!isAdmin) return;
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
            break;

        case ".복구 확인":
            if (!isAdmin) return;
            try {
                var bakDir = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                var files = bakDir.listFiles();
                for (var i = 0; i < files.length; i++) {
                    FileStream.write(DATA_PATH + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                UserDB.clearCache();
                replier.reply("관리자", "✅ [복구 완료] 캐시 갱신 완료.");
            } catch (e) { replier.reply("관리자", "❌ 에러: " + e.message); }
            break;
    }

    // [3] 인자값이 필요한 관리자 명령어 (Prefix 방식)
    if (isAdmin) {
        if (cleanMsg.startsWith(".관리자추가 ")) {
            var t = cleanMsg.replace(".관리자추가 ", "").trim();
            if (AdminDB.add(t)) replier.reply("관리자", "✅ " + t + "님 관리자 임명.");
        }
        else if (cleanMsg.startsWith(".관리자제거 ")) {
            var t = cleanMsg.replace(".관리자제거 ", "").trim();
            if (AdminDB.remove(t)) replier.reply("관리자", "✅ " + t + "님 권한 해제.");
        }
        else if (cleanMsg.startsWith(".닉네임변경 ")) {
            try {
                var p = cleanMsg.replace(".닉네임변경 ", "").split(">");
                var o = p[0].trim(), n = p[1].trim();
                FileStream.write(DATA_PATH + n + ".json", FileStream.read(DATA_PATH + o + ".json"));
                replier.reply("관리자", "🔄 이전 완료: " + o + " ➔ " + n);
            } catch (e) { replier.reply("관리자", "❌ 형식 오류 ([A] > [B])"); }
        }
        else if (cleanMsg.startsWith(".초기화 ")) {
            var t = cleanMsg.replace(".초기화 ", "").trim();
            UserDB.save(t, { name: t, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" });
            replier.reply("관리자", "⚠️ [" + t + "] 초기화 완료.");
        }
    }

    // 미가입자 안내
    if (!isRegistered && cleanMsg.startsWith(".") && cleanMsg !== ".가입") {
        replier.reply("시스템", "⚔️ [ 소환사의 협곡 ]\n등록되지 않은 소환사입니다.\n👉 [.가입] 입력!");
    }
};

module.exports = Handler;
