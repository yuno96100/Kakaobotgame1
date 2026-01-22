const UserDB = require("./user");
const AdminDB = require("./admin");
const Champions = require("./champions");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    
    // ==========================================
    // [ 1. 초기 권한 및 데이터 체크 ]
    // ==========================================
    var admins = AdminDB.getAdmins(); 
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var userPath = "sdcard/msgbot/Bots/sub/data/" + sender + ".json";
    var isRegistered = java.io.File(userPath).exists();


    // ==========================================
    // [ 2. 가입 처리 섹션 ]
    // ==========================================
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender); // UserDB 내부에서 캐싱 및 파일 생성 처리
            var success = "🎊 [ 소환사 등록 성공 ]\n";
            success += "━━━━━━━━━━━━━━\n";
            success += sender + "님, 소환사의 리그에 오신 것을 환영합니다!\n\n";
            success += "📜 '.메뉴'를 입력하여 모험을 시작하세요.";
            replier.reply(success);
            return;
        }

        var guide = "⚔️ [ 소환사의 협곡 ]\n";
        guide += "━━━━━━━━━━━━━━\n";
        guide += "아직 등록되지 않은 소환사입니다.\n\n";
        guide += "👉 참여를 위해 [.가입]을 입력해주세요!";
        replier.reply(guide);
        return;
    } 
    
    // 중복 가입 방지
    if (msg === ".가입") return;

    // 가입된 유저 데이터 로드 (메모리 캐시 우선 참조)
    var user = UserDB.get(sender);


    // ==========================================
    // [ 3. 메인 메뉴 (하단 도움말 디자인) ]
    // ==========================================
    if (msg === ".메뉴" || msg === ".돌아가기" || msg === "돌아가기") {
        var menu = "🎮 [ 메인 메뉴 ]\n";
        menu += "━━━━━━━━━━━━━━\n";
        menu += "1️⃣ 소환사 정보\n";
        menu += "2️⃣ 캐릭터\n";
        menu += "3️⃣ 일일 출석\n";
        if (isAdmin) {
            menu += "🛠️ 관리자 제어 콘솔\n";
        }
        menu += "━━━━━━━━━━━━━━\n";
        menu += " [ 📜 명령어 안내 ]\n";
        menu += " • 정보 확인 ➔ .정보\n";
        menu += " • 캐릭터 목록 ➔ .캐릭터\n";
        menu += " • 매일 출석 ➔ .출석\n";
        if (isAdmin) {
            menu += " • 관리자 도구 ➔ .관리자명령어\n";
        }
        replier.reply(menu);
        return;
    }


    // ==========================================
    // [ 4. 유저 활동 섹션 ]
    // ==========================================

    // [ .정보 ]
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
        info += "🔙 돌아가기 ➔ [.메뉴]";
        replier.reply(info);
        return;
    }

    // [ .캐릭터 ]
    if (msg === ".캐릭터") {
        var charMsg = "⚔️ [ 캐릭터 ]\n";
        charMsg += "━━━━━━━━━━━━━━\n";
        charMsg += "(보유 캐릭터 목록 표시 준비중)\n";
        charMsg += "━━━━━━━━━━━━━━\n";
        charMsg += "🔙 돌아가기 ➔ [.메뉴]";
        replier.reply(charMsg);
        return;
    }

    // [ .출석 ]
    if (msg === ".출석") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) {
            replier.reply("🔔 [ 출석 알림 ]\n이미 오늘의 보상을 받으셨습니다.\n내일 다시 찾아주세요!");
            return;
        }

        user.money += 100;
        user.exp += 50;
        user.lastAttendance = today;
        
        var isLvUp = UserDB.checkLevelUp(user);
        UserDB.save(sender, user); // 메모리 및 파일 동시 저장
        
        var att = "🎁 [ 출석 체크 완료 ]\n";
        att += "━━━━━━━━━━━━━━\n";
        att += "💰 보상: +100G\n";
        att += "✨ 보상: +50 EXP\n";
        if (isLvUp) att += "🎊 레벨업! Lv." + user.level + " 달성!\n";
        att += "━━━━━━━━━━━━━━\n";
        att += "🔙 돌아가기 ➔ [.메뉴]";
        replier.reply(att);
        return;
    }


    // ==========================================
    // [ 5. 관리자 전용 섹션 ]
    // ==========================================
    if (isAdmin) {
        
        // [ .관리자명령어 ]
        if (msg === ".관리자명령어") {
            var adm = "🛠️ [ 관리자 시스템 ]\n";
            adm += "━━━━━━━━━━━━━━\n";
            adm += "1. 시스템 업데이트\n";
            adm += "2. 데이터 백업 및 복구\n";
            adm += "3. 유저 제어 및 이전\n";
            adm += "━━━━━━━━━━━━━━\n";
            adm += " [ 📜 명령어 안내 ]\n";
            adm += " • 코드 업데이트 ➔ .업데이트\n";
            adm += " • 전체 데이터 백업 ➔ .백업\n";
            adm += " • 데이터 복구 ➔ .복구 확인\n";
            adm += " • 닉네임 변경 ➔ .닉네임변경 A > B\n";
            adm += " • 유저 초기화 ➔ .초기화 이름\n";
            adm += "━━━━━━━━━━━━━━\n";
            adm += "🔙 돌아가기 ➔ [.메뉴]";
            replier.reply(adm);
            return;
        }

        // [ .닉네임변경 ]
        if (msg.startsWith(".닉네임변경 ")) {
            try {
                var names = msg.replace(".닉네임변경 ", "").split(">");
                if (names.length !== 2) return replier.reply("❌ 사용법: .닉네임변경 이전닉네임 > 새닉네임");
                var oldName = names[0].trim(), newName = names[1].trim();
                var oldPath = "sdcard/msgbot/Bots/sub/data/" + oldName + ".json";
                if (java.io.File(oldPath).exists()) {
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + newName + ".json", FileStream.read(oldPath));
                    replier.reply("✅ [데이터 이전 완료]\n" + oldName + " ➔ " + newName);
                } else {
                    replier.reply("❌ [" + oldName + "] 데이터를 찾을 수 없습니다.");
                }
            } catch (e) { replier.reply("❌ 에러: " + e.message); }
            return;
        }

        // [ .백업 ]
        if (msg === ".백업") {
            try {
                var source = new java.io.File("sdcard/msgbot/Bots/sub/data/");
                var backup = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                if (!backup.exists()) backup.mkdirs();
                var files = source.listFiles();
                for (var i = 0; i < files.length; i++) {
                    if (files[i].isFile()) {
                        FileStream.write("sdcard/msgbot/Bots/sub/backup/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                    }
                }
                replier.reply("💾 [백업 완료] 현재 모든 데이터를 안전하게 복사했습니다.");
            } catch (e) { replier.reply("❌ 백업 실패: " + e.message); }
            return;
        }

        // [ .복구 확인 ]
        if (msg === ".복구 확인") {
            try {
                var backupFolder = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                var files = backupFolder.listFiles();
                if (!files || files.length === 0) return replier.reply("❌ 백업된 데이터가 없습니다.");
                for (var i = 0; i < files.length; i++) {
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                UserDB.clearCache(); // 데이터가 바뀌었으므로 메모리 캐시 초기화 필수
                replier.reply("✅ [복구 완료] 백업 데이터로 덮어쓰기 되었습니다.");
            } catch (e) { replier.reply("❌ 복구 실패: " + e.message); }
            return;
        }

        // [ .초기화 ]
        if (msg.startsWith(".초기화 ")) {
            var target = msg.replace(".초기화 ", "").trim();
            var resetData = { name: target, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" };
            UserDB.save(target, resetData);
            replier.reply("⚠️ [" + target + "] 소환사의 데이터가 초기화되었습니다.");
            return;
        }
    }
};

module.exports = Handler;
