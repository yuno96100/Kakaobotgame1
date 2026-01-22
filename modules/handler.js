const UserDB = require("./user");
const AdminDB = require("./admin");
const Champions = require("./champions");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    
    // [ 1. 권한 및 데이터 확인 ]
    var admins = AdminDB.getAdmins(); 
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var userPath = "sdcard/msgbot/Bots/sub/data/" + sender + ".json";
    var isRegistered = java.io.File(userPath).exists();


    // [ 2. 가입 및 환영 인사 ]
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender);
            var success = "🎊 [ 소환사 등록 성공 ]\n";
            success += "━━━━━━━━━━━━━━\n";
            success += sender + "님, 소환사의 리그에 합류하신 것을 환영합니다!\n\n";
            success += "⚠️ 주의: 닉네임 변경 시 데이터 보존을 위해 반드시 관리자에게 문의하세요.\n\n";
            success += "📜 '.메뉴'를 입력하여 모험을 시작하세요.";
            replier.reply(success);
            return;
        }

        var guide = "⚔️ [ 소환사의 협곡에 오신것을 환영합니다 ]\n";
        guide += "━━━━━━━━━━━━━━\n";
        guide += "아직 등록되지 않은 소환사입니다.\n";
        guide += "이곳은 매일 결투가 진행되는 소환사의 리그입니다.\n\n";
        guide += "👉 참여를 위해 [.가입]을 입력해주세요!";
        replier.reply(guide);
        return;
    } 
    if (msg === ".가입") return;

    var user = UserDB.get(sender);


    // [ 3. 메인 메뉴 ]
    if (msg === ".메뉴" || msg === ".돌아가기" || msg === "돌아가기") {
        var menu = "🎮 [ 메인 메뉴 ]\n";
        menu += "━━━━━━━━━━━━━━\n";
        menu += "1️⃣ 내 정보 확인\n";
        menu += "2️⃣ 캐릭터\n";
        menu += "3️⃣ 일일 출석\n";
        menu += "━━━━━━━━━━━━━━\n";
        menu += "💡 상세 도움말은 [.도움말] 입력";
        replier.reply(menu);
        return;
    }


    // [ 4. 도움말 ]
    if (msg === ".도움말") {
        var help = "📜 [ 소환사 가이드 ]\n";
        help += "━━━━━━━━━━━━━━\n";
        help += "✅ [ 주요 기능 ]\n";
        help += "• .정보 - 레벨, 경험치, 자산 확인\n";
        help += "• .캐릭터 - 보유 캐릭터 목록 확인\n";
        help += "• .출석 - 매일 보상 획득\n\n";
        help += "⚙️ [ 시스템 ]\n";
        help += "• .메뉴 - 메인 화면 이동\n";
        help += "• .돌아가기 - 이전 단계 이동\n";
        help += "━━━━━━━━━━━━━━";
        replier.reply(help);
        return;
    }


    // [ 5. 소환사 정보 ]
    if (msg === ".정보") {
        var total = user.win + user.loss;
        var rate = total === 0 ? 0 : ((user.win / total) * 100).toFixed(1);
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        
        var info = "📜 [ 소환사 정보 ]\n";
        info += "━━━━━━━━━━━━━━\n";
        info += "👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n";
        info += "⭐ 레벨: Lv." + user.level + "\n";
        info += "📊 경험치: [" + bar + "] " + expP + "%\n";
        info += "💰 보유 골드: " + user.money.toLocaleString() + " G\n";
        info += "⚔️ 전적: " + user.win + "승 " + user.loss + "패 (" + rate + "%)\n";
        info += "━━━━━━━━━━━━━━\n";
        info += "🔙 [.돌아가기]";
        replier.reply(info);
        return;
    }


    // [ 6. 캐릭터 및 출석 ]
    if (msg === ".캐릭터") {
        var charMsg = "⚔️ [ 캐릭터 인벤토리 ]\n";
        charMsg += "━━━━━━━━━━━━━━\n";
        charMsg += "(보유 캐릭터 목록 표시 준비중)\n";
        charMsg += "━━━━━━━━━━━━━━\n";
        charMsg += "🔙 [.돌아가기]";
        replier.reply(charMsg);
        return;
    }

    if (msg === ".출석") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) {
            replier.reply("🔔 [ 출석 알림 ]\n이미 오늘의 보상을 받으셨습니다.");
            return;
        }

        user.money += 100;
        user.exp += 50;
        user.lastAttendance = today;
        
        var isLvUp = UserDB.checkLevelUp(user);
        UserDB.save(sender, user);
        
        var att = "🎁 [ 출석 체크 완료 ]\n";
        att += "━━━━━━━━━━━━━━\n";
        att += "💰 보상: +100G\n";
        att += "✨ 보상: +50 EXP\n";
        if (isLvUp) att += "🎊 레벨업! Lv." + user.level + " 달성!\n";
        att += "━━━━━━━━━━━━━━\n";
        att += "🔙 [.돌아가기]";
        replier.reply(att);
        return;
    }


    // [ 7. 관리자 전용 기능 ]
    if (isAdmin) {
        if (msg === ".관리자명령어") {
            var adm = "🛠️ [ 관리자 시스템 ]\n";
            adm += "━━━━━━━━━━━━━━\n";
            adm += "1️⃣ 시스템: .업데이트 / .시스템\n";
            adm += "2️⃣ 데이터: .백업 / .복구 확인\n";
            adm += "3️⃣ 유저 제어: .초기화 [이름]\n";
            adm += "4️⃣ 데이터 이전: .닉네임변경 [이전] > [이후]\n";
            adm += "━━━━━━━━━━━━━━\n";
            adm += "🔙 [.돌아가기]";
            replier.reply(adm);
            return;
        }

        if (msg.startsWith(".닉네임변경 ")) {
            try {
                var names = msg.replace(".닉네임변경 ", "").split(">");
                if (names.length !== 2) return replier.reply("❌ 사용법: .닉네임변경 이전 > 이후");
                var oldN = names[0].trim(), newN = names[1].trim();
                var oldP = "sdcard/msgbot/Bots/sub/data/" + oldN + ".json";
                if (java.io.File(oldP).exists()) {
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + newN + ".json", FileStream.read(oldP));
                    replier.reply("✅ 데이터 이전 완료: " + oldN + " ➔ " + newN);
                } else { replier.reply("❌ [" + oldN + "] 데이터 없음"); }
            } catch (e) { replier.reply("❌ 에러: " + e.message); }
            return;
        }

        if (msg === ".백업") {
            try {
                var source = new java.io.File("sdcard/msgbot/Bots/sub/data/");
                var backup = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                if (!backup.exists()) backup.mkdirs();
                var files = source.listFiles();
                for (var i = 0; i < files.length; i++) {
                    if (files[i].isFile()) FileStream.write("sdcard/msgbot/Bots/sub/backup/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                replier.reply("💾 [백업 완료] 모든 데이터를 보존했습니다.");
            } catch (e) { replier.reply("❌ 실패: " + e.message); }
            return;
        }

        if (msg === ".복구 확인") {
            try {
                var backupFolder = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                var files = backupFolder.listFiles();
                for (var i = 0; i < files.length; i++) {
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                replier.reply("✅ [복구 완료] 백업 시점으로 복구되었습니다.");
            } catch (e) { replier.reply("❌ 실패: " + e.message); }
            return;
        }

        if (msg.startsWith(".초기화 ")) {
            var target = msg.replace(".초기화 ", "").trim();
            var resetData = { name: target, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" };
            UserDB.save(target, resetData);
            replier.reply("⚠️ [" + target + "] 유저 데이터 초기화 완료.");
            return;
        }
    }
};

module.exports = Handler;
