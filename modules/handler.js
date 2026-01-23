const UserDB = require("./user");
const AdminDB = require("./admin");

const Handler = {};
const MenuSession = {}; // 숫자 메뉴 세션 관리용 객체

Handler.process = function(msg, sender, replier) {
    // 관리자 여부 및 가입 여부 확인
    var admins = AdminDB.getAdmins();
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();

    // [ 1. 가입 및 중복 가입 제어 ]
    if (msg === ".가입") {
        if (isRegistered) {
            MenuSession[sender] = "OPEN";
            replier.reply("시스템", "🔔 [ 알림 ]\n이미 리그에 등록된 소환사입니다.\n\n현재 바로 이용 가능한 메뉴입니다.\n번호(1~3)를 입력하세요.\n━━━━━━━━━━━━━━\n1️⃣ 정보  2️⃣ 캐릭터  3️⃣ 출석");
        } else {
            UserDB.get(sender); // 신규 유저 데이터 생성 및 저장
            MenuSession[sender] = "OPEN";
            replier.reply("시스템", "🎊 [ 가입 성공 ]\n" + sender + "님 환영합니다!\n\n매일 성장을 즐기는 이곳에서 모험을 시작하세요.\n📜 지금 바로 번호(1~3)를 입력해 보세요.");
        }
        return;
    }

    // 미가입 유저 차단 및 안내
    if (!isRegistered) {
        if (msg.startsWith(".")) {
            replier.reply("시스템", "⚔️ [ 소환사의 협곡 ]\n━━━━━━━━━━━━━━\n매일 성장을 즐기는 채팅방입니다.\n등록되지 않은 소환사입니다.\n\n👉 참여를 위해 [.가입] 입력!");
        }
        return;
    }

    // [ 2. 숫자 메뉴 세션 처리 ]
    var user = UserDB.get(sender);
    let cleanMsg = msg.trim();

    if (MenuSession[sender] === "OPEN") {
        if (cleanMsg === "1") msg = ".정보";
        else if (cleanMsg === "2") msg = ".캐릭터";
        else if (cleanMsg === "3") msg = ".출석";
        
        // 숫자가 입력되었다면 세션 종료 (일반 대화 간섭 방지)
        if (["1", "2", "3"].indexOf(cleanMsg) > -1) {
            delete MenuSession[sender];
        }
    }

    // [ 3. 메인 메뉴 및 유저 명령어 ]
    if (msg === ".메뉴" || msg === ".돌아가기") {
        MenuSession[sender] = "OPEN";
        var menu = "🎮 [ 메인 메뉴 ]\n━━━━━━━━━━━━━━\n1️⃣ 소환사 정보 (.정보)\n2️⃣ 캐릭터 (.캐릭터)\n3️⃣ 일일 출석 (.출석)\n";
        if (isAdmin) menu += "🛠️ 관리자 제어 콘솔\n";
        menu += "━━━━━━━━━━━━━━\n [ 📜 이용 안내 ]\n • 번호(1, 2, 3)를 입력하면 즉시 이동합니다.";
        replier.reply("시스템", menu);
        return;
    }

    if (msg === ".정보") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        var info = "📜 [ 소환사 정보 ]\n━━━━━━━━━━━━━━\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + 
                   "\n⭐ 레벨: Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%" +
                   "\n💰 골드: " + user.money.toLocaleString() + "G\n⚔️ 전적: " + user.win + "승 " + user.loss + "패\n━━━━━━━━━━━━━━\n🔙 [.메뉴]";
        replier.reply("시스템", info);
        return;
    }

    if (msg === ".출석") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) {
            replier.reply("시스템", "🔔 [ 출석 알림 ]\n이미 오늘의 보상을 받으셨습니다.\n내일 다시 시도해주세요!");
            return;
        }
        user.money += 100; user.exp += 50; user.lastAttendance = today;
        var up = UserDB.checkLevelUp(user);
        UserDB.save(sender, user);
        replier.reply("시스템", "🎁 [ 출석 완료 ]\n보상: +100G / +50EXP\n" + (up ? "🎊 축하합니다! 레벨업! Lv." + user.level : "") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    if (msg === ".캐릭터") {
        replier.reply("시스템", "⚔️ [ 캐릭터 창 ]\n━━━━━━━━━━━━━━\n보유 캐릭터: " + user.ownedChars.join(", ") + "\n(현재 상세 도감 기능 업데이트 중입니다)\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    // [ 4. 관리자 전용 명령어 ]
    if (isAdmin) {
        if (msg === ".관리자명령어") {
            var admHelp = "🛠️ [ 관리자 시스템 ]\n━━━━━━━━━━━━━━\n• .관리자추가 [이름]\n• .관리자제거 [이름]\n• .백업 / .복구 확인\n• .닉네임변경 [기존] > [신규]\n• .초기화 [이름]\n━━━━━━━━━━━━━━\n🔙 [.메뉴]";
            replier.reply("관리자", admHelp);
            return;
        }

        if (msg.startsWith(".관리자추가 ")) {
            var target = msg.replace(".관리자추가 ", "").trim();
            if (AdminDB.add(target)) replier.reply("관리자", "✅ " + target + "님을 관리자로 임명했습니다.");
            else replier.reply("관리자", "❌ 실패: 이미 관리자이거나 대상을 찾을 수 없습니다.");
            return;
        }

        if (msg.startsWith(".관리자제거 ")) {
            var target = msg.replace(".관리자제거 ", "").trim();
            if (AdminDB.remove(target)) replier.reply("관리자", "✅ " + target + "님의 관리자 권한을 해제했습니다.");
            else replier.reply("관리자", "❌ 실패: 마스터 계정이거나 목록에 없습니다.");
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
                replier.reply("관리자", "💾 [백업 성공] 모든 유저 데이터가 안전하게 복사되었습니다.");
            } catch (e) { replier.reply("관리자", "❌ 백업 중 에러 발생: " + e.message); }
            return;
        }

        if (msg === ".복구 확인") {
            try {
                var bakDir = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                if (!bakDir.exists()) return replier.reply("관리자", "❌ 백업 폴더가 존재하지 않습니다.");
                var files = bakDir.listFiles();
                for (var i = 0; i < files.length; i++) {
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                }
                UserDB.clearCache();
                replier.reply("관리자", "✅ [복구 완료] 데이터 복구 및 캐시 갱신이 완료되었습니다.");
            } catch (e) { replier.reply("관리자", "❌ 복구 중 에러 발생: " + e.message); }
            return;
        }

        if (msg.startsWith(".닉네임변경 ")) {
            try {
                var parts = msg.replace(".닉네임변경 ", "").split(">");
                var oldName = parts[0].trim(), newName = parts[1].trim();
                var oldFile = "sdcard/msgbot/Bots/sub/data/" + oldName + ".json";
                if (java.io.File(oldFile).exists()) {
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + newName + ".json", FileStream.read(oldFile));
                    // 기존 파일 삭제 로직을 넣을 수 있으나 데이터 안전을 위해 복사로 처리
                    replier.reply("관리자", "🔄 [이전 완료] " + oldName + " ➔ " + newName);
                } else {
                    replier.reply("관리자", "❌ 대상을 찾을 수 없습니다.");
                }
            } catch (e) { replier.reply("관리자", "❌ 형식 오류: .닉네임변경 [A] > [B] 로 입력하세요."); }
            return;
        }

        if (msg.startsWith(".초기화 ")) {
            var target = msg.replace(".초기화 ", "").trim();
            UserDB.save(target, { name: target, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" });
            replier.reply("관리자", "⚠️ [" + target + "] 유저 데이터 초기화 완료.");
            return;
        }
    }
};

module.exports = Handler;
