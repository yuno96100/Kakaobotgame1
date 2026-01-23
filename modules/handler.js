const UserDB = require("./user");
const AdminDB = require("./admin");

const Handler = {};
const PRIVATE_CHAT_LINK = "https://open.kakao.com/o/sXXXXXX"; 

Handler.process = function(msg, sender, replier, room) {
    if (!msg || !msg.startsWith(".")) return; 

    // [1] 기본 권한 및 데이터 로드 (관리자도 유저 데이터가 있어야 함)
    var admins = AdminDB.getAdmins() || [];
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isPrivate = (room === sender || !room || room.trim() === "");
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();

    // ────────────────────────────────────────────────────────────────
    // [ CASE A ] 단체방(중계방) 로직
    // ────────────────────────────────────────────────────────────────
    if (!isPrivate) {
        // [A-1] 관리자 전용 명령어 (관리자 권한이 있는 유저만 사용 가능)
        if (isAdmin) {
            if (msg === ".관리자명령어") {
                var adm = "🛠️ [ 관리자 시스템 - 단체방 ]\n━━━━━━━━━━━━━━\n• .관리자추가 [이름]\n• .관리자제거 [이름]\n• .백업\n• .복구 확인\n• .닉네임변경 [기존]>[신규]\n• .초기화 [이름]\n━━━━━━━━━━━━━━";
                replier.reply(room, adm);
                return;
            }
            // 관리자 세부 기능 (생략 없이 포함)
            if (msg.indexOf(".관리자추가 ") === 0) {
                var t = msg.replace(".관리자추가 ", "").trim();
                if (AdminDB.add(t)) replier.reply(room, "✅ [" + t + "] 님을 관리자로 임명했습니다.");
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
                    replier.reply(room, "💾 시스템 데이터 백업 완료.");
                } catch (e) { replier.reply(room, "❌ 백업 실패"); }
                return;
            }
            if (msg === ".복구 확인") {
                try {
                    var bakDir = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                    var filesB = bakDir.listFiles();
                    for (var j = 0; j < filesB.length; j++) {
                        FileStream.write("sdcard/msgbot/Bots/sub/data/" + filesB[j].getName(), FileStream.read(filesB[j].getAbsolutePath()));
                    }
                    UserDB.clearCache();
                    replier.reply(room, "✅ 데이터 복구 완료.");
                } catch (e) { replier.reply(room, "❌ 복구 실패"); }
                return;
            }
            if (msg.startsWith(".닉네임변경 ")) {
                var p = msg.replace(".닉네임변경 ", "").split(">");
                if (p.length === 2) {
                    var oldN = p[0].trim(), newN = p[1].trim();
                    var oldF = new java.io.File("sdcard/msgbot/Bots/sub/data/" + oldN + ".json");
                    if (oldF.exists()) {
                        FileStream.write("sdcard/msgbot/Bots/sub/data/" + newN + ".json", FileStream.read(oldF.getAbsolutePath()));
                        oldF.delete();
                        replier.reply(room, "🔄 닉네임 변경 완료: " + oldN + " -> " + newN);
                    }
                }
                return;
            }
            if (msg.indexOf(".초기화 ") === 0) {
                var t = msg.replace(".초기화 ", "").trim();
                UserDB.save(t, { name: t, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" });
                replier.reply(room, "⚠️ [" + t + "] 데이터 초기화 완료.");
                return;
            }
        }

        // [A-2] 일반 유저 및 관리자의 '플레이어용' 명령어 차단
        var userCommands = [".가입", ".메뉴", ".시작", ".정보", ".캐릭터", ".출석", "1", "2", "3", ".돌아가기"];
        if (userCommands.indexOf(msg) > -1 || !isNaN(msg.replace(".",""))) {
            replier.reply(room, "📢 [" + sender + "] 소환사님!\n단체방 내 조작은 차단되었습니다.\n플레이는 **시스템 개인톡**에서 가능합니다!\n\n🔗 개인톡 바로가기:\n" + PRIVATE_CHAT_LINK);
            return;
        }
        return; 
    }

    // ────────────────────────────────────────────────────────────────
    // [ CASE B ] 개인톡(시스템) 로직 - 관리자 포함 모든 소환사 공용
    // ────────────────────────────────────────────────────────────────
    
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender);
            replier.reply("🎊 [ 소환사 등록 완료 ]\n" + sender + "님, 환영합니다!\n이제 개인 컨트롤러를 사용할 수 있습니다.\n\n📜 '.메뉴'를 입력하세요.");
            return;
        }
        replier.reply("⚔️ 개인 컨트롤러입니다. [.가입]을 입력해 주세요!");
        return;
    }

    var user = UserDB.get(sender);

    // 메뉴 및 돌아가기 (관리자도 유저와 동일한 메뉴 사용)
    if (msg === ".메뉴" || msg === ".돌아가기") {
        var menu = "🎮 [ 개인 컨트롤러 ]\n━━━━━━━━━━━━━━\n1️⃣ 소환사 정보 (.정보)\n2️⃣ 캐릭터 확인 (.캐릭터)\n3️⃣ 매일 출석 (.출석)\n━━━━━━━━━━━━━━\n🔙 [.메뉴]";
        replier.reply(menu);
        return;
    }

    if (msg === ".정보" || msg === "1") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        replier.reply("📜 [ 정보 ]\n👤: " + user.name + (isAdmin ? " (Admin)" : "") + "\n⭐: Lv." + user.level + "\n📊: [" + bar + "] " + expP + "%\n💰: " + user.money.toLocaleString() + "G\n⚔️: " + user.win + "승 " + user.loss + "패\n━━━━━━━━━━━━━━\n🔙 [.돌아가기]");
        return;
    }

    if (msg === ".캐릭터" || msg === "2") {
        replier.reply("⚔️ [ 보유 캐릭터 ]\n" + (user.ownedChars ? user.ownedChars.join(", ") : "101") + "\n━━━━━━━━━━━━━━\n🔙 [.돌아가기]");
        return;
    }

    if (msg === ".출석" || msg === "3") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) return replier.reply("🔔 오늘 이미 출석하셨습니다.");
        user.money += 100; user.exp += 50; user.lastAttendance = today;
        var up = UserDB.checkLevelUp(user);
        UserDB.save(sender, user);
        replier.reply("🎁 출석 완료! +100G / +50EXP" + (up ? "\n🎊 레벨업! Lv." + user.level : "") + "\n━━━━━━━━━━━━━━\n🔙 [.돌아가기]");
        return;
    }
};

module.exports = Handler;
