const UserDB = require("./user");
const AdminDB = require("./admin");
const Champions = require("./champions");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    
    // ------ [ 1. 데이터 및 권한 확인 섹션 ] ------
    var admins = AdminDB.getAdmins();
    var isMaster = (sender === "관리자");
    var isAdmin = (admins.indexOf(sender) > -1 || isMaster);

    var path = "sdcard/msgbot/Bots/sub/data/" + sender + ".json";
    var isRegistered = java.io.File(path).exists();


    // ------ [ 2. 가입 처리 섹션 ] ------
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender); 
            var success = "🎊 [ 소환사 등록 성공 ]\n";
            success += "━━━━━━━━━━━━━━\n";
            success += sender + "님, 소환사의 리그에 합류하신 것을 환영합니다!\n\n";
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

    // 가입된 유저의 데이터 로드
    var user = UserDB.get(sender);


    // ------ [ 3. 시스템 및 도움말 섹션 ] ------
    // '돌아가기' 입력 시에도 메인메뉴 출력
    if (msg === ".메뉴" || msg === ".돌아가기" || msg === "돌아가기") {
        var menu = "🎮 [ 메인 메뉴 ]\n";
        menu += "━━━━━━━━━━━━━━\n";
        menu += "1️⃣ 내 정보 확인 ➔ .정보\n";
        menu += "2️⃣ 캐릭터 인벤토리 ➔ .캐릭터\n";
        menu += "3️⃣ 일일 출석 보상 ➔ .출석\n";
        menu += "━━━━━━━━━━━━━━\n";
        menu += "💡 상세 도움말은 [.도움말] 입력";
        replier.reply(menu);
        return;
    }

    if (msg === ".도움말") {
        var help = "📜 [ 전체 도움말 안내 ]\n";
        help += "━━━━━━━━━━━━━━\n";
        help += "👤 [.정보] - 나의 레벨, 전적, 자산 확인\n";
        help += "⚔️ [.캐릭터] - 내가 보유한 캐릭터 목록\n";
        help += "🎁 [.출석] - 매일 100G와 경험치 획득\n";
        help += "🔙 [.돌아가기] - 메인 메뉴로 이동\n";
        help += "━━━━━━━━━━━━━━\n";
        if (isAdmin) {
            help += "🛠️ [ 관리자 명령어 ]\n";
            help += "• .업데이트 - 최신 코드 동기화\n";
            help += "• .전체초기화 확인 - 모든 유저 데이터 삭제\n";
            help += "━━━━━━━━━━━━━━";
        }
        replier.reply(help);
        return;
    }


    // ------ [ 4. 유저 정보 및 인벤토리 섹션 ] ------
    if (msg === ".정보") {
        var total = user.win + user.loss;
        var rate = total === 0 ? 0 : ((user.win / total) * 100).toFixed(1);
        
        var maxExp = user.maxExp || 100;
        var currentExp = user.exp || 0;
        var expPercent = Math.floor((currentExp / maxExp) * 100);
        var barCount = Math.floor(expPercent / 10);
        var expBar = "■".repeat(barCount) + "□".repeat(10 - barCount);
        
        var info = "📜 [ 소환사 정보 ]\n";
        info += "━━━━━━━━━━━━━━\n";
        info += "👤 닉네임: " + user.name + "\n";
        if (isAdmin) info += "🎖️ 권한: 관리자\n";
        info += "⭐ 레벨: Lv." + user.level + "\n";
        info += "📊 경험치: [" + expBar + "] " + expPercent + "%\n";
        info += "💰 보유 골드: " + user.money.toLocaleString() + " G\n";
        info += "⚔️ 전적: " + user.win + "승 " + user.loss + "패 (" + rate + "%)\n";
        info += "━━━━━━━━━━━━━━\n";
        info += "🔙 메인 메뉴로 가려면 [.돌아가기]";
        
        replier.reply(info);
        return;
    }

    if (msg === ".캐릭터") {
        var charMsg = "⚔️ " + user.name + "님의 캐릭터 인벤토리\n";
        charMsg += "━━━━━━━━━━━━━━\n";
        charMsg += "(보유 캐릭터 목록 표시 준비중)\n";
        charMsg += "━━━━━━━━━━━━━━\n";
        charMsg += "🔙 메인 메뉴로 가려면 [.돌아가기]";
        replier.reply(charMsg);
        return;
    }


    // ------ [ 5. 일일 보상 및 이벤트 섹션 ] ------
    if (msg === ".출석") {
        user.money += 100;
        user.exp += 20; 
        UserDB.save(sender, user);
        
        var attMsg = "🎁 매일 출석 보상 완료!\n💰 +100G / ✨ +20 EXP\n";
        attMsg += "━━━━━━━━━━━━━━\n";
        attMsg += "🔙 메인 메뉴로 가려면 [.돌아가기]";
        replier.reply(attMsg);
        return;
    }


    // ------ [ 6. 관리자 전용 명령어 섹션 ] ------
    if (isAdmin && isMaster) {
        
        // [특정 유저 초기화] 명령어: .초기화 [닉네임]
        if (msg.startsWith(".초기화 ")) {
            var target = msg.replace(".초기화 ", "").trim();
            var targetPath = "sdcard/msgbot/Bots/sub/data/" + target + ".json";
            
            if (java.io.File(targetPath).exists()) {
                // 초기 데이터 정의
                var resetData = {
                    name: target,
                    level: 1,
                    exp: 0,
                    maxExp: 100,
                    money: 1000,
                    win: 0,
                    loss: 0,
                    ownedChars: [101],
                    lastAttendance: ""
                };
                UserDB.save(target, resetData);
                replier.reply("⚠️ [데이터 리셋]\n[" + target + "]님의 정보를 초기 상태로 변경했습니다.");
            } else {
                replier.reply("❌ 해당 유저를 찾을 수 없습니다.");
            }
            return;
        }

        // [데이터 전체 백업] 명령어: .백업
        if (msg === ".백업") {
            try {
                var sourceFolder = new java.io.File("sdcard/msgbot/Bots/sub/data/");
                var backupFolder = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                if (!backupFolder.exists()) backupFolder.mkdirs();

                var files = sourceFolder.listFiles();
                for (var i = 0; i < files.length; i++) {
                    if (files[i].isFile()) {
                        var content = FileStream.read(files[i].getAbsolutePath());
                        FileStream.write("sdcard/msgbot/Bots/sub/backup/" + files[i].getName(), content);
                    }
                }
                replier.reply("💾 [백업 완료]\n모든 데이터가 backup 폴더에 저장되었습니다.");
            } catch (e) {
                replier.reply("❌ 백업 실패: " + e.message);
            }
            return;
        }

        // [데이터 복구] 명령어: .복구
        if (msg === ".복구 확인") {
            try {
                var backupFolder = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                if (!backupFolder.exists()) {
                    replier.reply("❌ 백업된 데이터가 없습니다.");
                    return;
                }
                var files = backupFolder.listFiles();
                for (var i = 0; i < files.length; i++) {
                    var content = FileStream.read(files[i].getAbsolutePath());
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + files[i].getName(), content);
                }
                replier.reply("✅ [복구 완료]\n백업 시점의 데이터로 모두 복구되었습니다.");
            } catch (e) {
                replier.reply("❌ 복구 실패: " + e.message);
            }
            return;
        }

        if (msg.startsWith(".권한부여 ")) {
            var target = msg.replace(".권한부여 ", "").trim();
            if (AdminDB.add(target)) replier.reply("✅ [" + target + "]님에게 권한을 부여했습니다.");
            return;
        }
    }
};

module.exports = Handler;
