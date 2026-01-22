const UserDB = require("./user");
const AdminDB = require("./admin");

const Handler = {};

Handler.process = function(room, msg, sender, isGroupChat, replier) {
    // 1. 관리자 명단 로드 (이름이 '관리자'면 무조건 pass)
    var admins = AdminDB.getAdmins();
    var isAdmin = (sender.trim() === "관리자" || admins.indexOf(sender.trim()) > -1);
    
    // 2. 가입 여부 확인 (경로 재검증)
    var dataPath = "sdcard/msgbot/Bots/sub/data/" + sender + ".json";
    var isRegistered = java.io.File(dataPath).exists();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 가입 로직 ] - .가입 입력 시 반응 확인용
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (msg === ".가입") {
        if (isRegistered) {
            return replier.reply("🔔 [" + sender + "]님은 이미 등록되어 있습니다.");
        }
        var newUser = UserDB.get(sender); 
        UserDB.save(sender, newUser);
        return replier.reply("🎊 [ 가입 완료 ]\n" + sender + "님 환영합니다!\n[.메뉴]를 입력해보세요.");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 비회원 차단 ]
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!isRegistered) {
        return replier.reply("⚠️ [.가입]을 먼저 입력해주세요.");
    }

    var user = UserDB.get(sender);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 유저 공통 메뉴 ]
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (msg === ".메뉴") {
        var menu = "🎮 [ 매일 메뉴 ]\n" + "━".repeat(12) + "\n1. .정보\n2. .캐릭터\n3. .출석\n" + (isAdmin ? "🛠️ .관리자명령어\n" : "") + "━".repeat(12);
        return replier.reply(menu);
    } 

    if (msg === ".정보") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        return replier.reply("📜 [ " + sender + " 정보 ]\n" + "━".repeat(12) + "\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n" + "━".repeat(12));
    }

    if (msg === ".출석") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) return replier.reply("🔔 오늘 이미 보상을 받았습니다.");
        user.money += 100; user.exp += 50; user.lastAttendance = today;
        UserDB.checkLevelUp(user);
        UserDB.save(sender, user);
        return replier.reply("🎁 [ 매일 출석 완료 ]\n보상: 100G / 50EXP");
    }

    if (msg === ".캐릭터") {
        return replier.reply("⚔️ [ 캐릭터 ]\n캐릭터 목록을 준비 중입니다.");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 관리자 전용 ]
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isAdmin) {
        if (msg === ".관리자명령어") {
            return replier.reply("🛠️ [ 관리자 도구 ]\n.관리자추가 [이름]\n.관리자제거 [이름]\n.백업\n.복구 확인\n.초기화 [이름]\n.닉네임변경 [A]>[B]\n.유저체크 [이름]");
        }
        if (msg.startsWith(".유저체크 ")) {
            var target = msg.replace(".유저체크 ", "").trim();
            var tData = UserDB.get(target);
            return replier.reply("🔍 [" + target + "] 정보\nLv." + tData.level + " / " + tData.money + "G");
        }
        if (msg === ".백업") {
            // 백업 로직 생략 없이 포함 (v1.2.2 원본)
            try {
                var src = new java.io.File("sdcard/msgbot/Bots/sub/data/");
                var bak = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                if (!bak.exists()) bak.mkdirs();
                var files = src.listFiles();
                for (var i = 0; i < files.length; i++) {
                    if (files[i].isFile()) FileStream.write("sdcard/msgbot/Bots/sub/backup/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                return replier.reply("💾 백업 완료");
            } catch(e) { return replier.reply("❌ 백업 실패"); }
        }
    }
};

module.exports = Handler;
