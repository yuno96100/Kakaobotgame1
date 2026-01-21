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
        // [미가입 유저가 가입 시도]
        if (msg === ".가입") {
            UserDB.get(sender); 
            var success = "🎊 [ 소환사 등록 성공 ]\n";
            success += "━━━━━━━━━━━━━━\n";
            success += sender + "님, 소환사의 리그에 합류하신 것을 환영합니다!\n\n";
            success += "📜 '.메뉴'를 입력하여 모험을 시작하세요.";
            replier.reply(success);
            return;
        }

        // [미가입 유저에게 가입 안내]
        var guide = "⚔️ [ 소환사의 협곡에 오신것을 환영합니다 ]\n";
        guide += "━━━━━━━━━━━━━━\n";
        guide += "아직 등록되지 않은 소환사입니다.\n";
        guide += "이곳은 매일 결투가 진행되는 소환사의 리그입니다.\n\n";
        guide += "👉 참여를 위해 [.가입]을 입력해주세요!";
        replier.reply(guide);
        return;
    } else {
        // [이미 가입된 유저가 .가입을 입력한 경우]
        if (msg === ".가입") {
            replier.reply("⚠️ [ 안내 ]\n이미 가입이 완료된 소환사입니다.\n게임을 시작하려면 [.메뉴]를 입력해주세요.");
            return;
        }
    }

    // 가입된 유저의 데이터 로드
    var user = UserDB.get(sender);


  // ------ [ 3. 시스템 및 도움말 섹션 ] ------
    
    // [명령어: .메뉴] - 명령어 표기 제거 및 초슬림 구성
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

    // [명령어: .도움말] - 관리자 명령어 제외 버전
    if (msg === ".도움말") {
        var help = "📜 [ 소환사 가이드 ]\n";
        help += "━━━━━━━━━━━━━━\n";
        help += "✅ [ 주요 기능 ]\n";
        help += "• .정보 - 본인의 레벨, 전적, 자산 확인\n";
        help += "• .캐릭터 - 보유 중인 캐릭터 목록 확인\n";
        help += "• .출석 - 매일 보너스 보상 획득\n\n";
        help += "⚙️ [ 시스템 ]\n";
        help += "• .메뉴 - 메인 화면으로 이동\n";
        help += "• .돌아가기 - 이전 단계 또는 메뉴로 이동\n";
        help += "━━━━━━━━━━━━━━";
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
        info += "🔙 [.돌아가기]";
        
        replier.reply(info);
        return;
    }

    if (msg === ".캐릭터") {
        var charMsg = "⚔️ [ 캐릭터 인벤토리 ]\n";
        charMsg += "━━━━━━━━━━━━━━\n";
        charMsg += "(보유 캐릭터 목록 표시 준비중)\n";
        charMsg += "━━━━━━━━━━━━━━\n";
        charMsg += "🔙 [.돌아가기]";
        replier.reply(charMsg);
        return;
    }


    // ------ [ 5. 일일 보상 및 이벤트 섹션 ] ------
    if (msg === ".출석") {
        user.money += 100;
        user.exp += 20; 
        UserDB.save(sender, user);
        
        var attMsg = "🎁 [ 출석 체크 완료 ]\n";
        attMsg += "━━━━━━━━━━━━━━\n";
        attMsg += "💰 보상: +100G\n";
        attMsg += "✨ 보상: +20 EXP\n";
        attMsg += "━━━━━━━━━━━━━━\n";
        attMsg += "🔙 [.돌아가기]";
        replier.reply(attMsg);
        return;
    }


    // ------ [ 6. 관리자 전용 명령어 섹션 ] ------
    if (isAdmin && isMaster) {
        
        if (msg === ".관리자명령어") {
            var adminHelp = "🛠️ [ 관리자 시스템 ]\n";
            adminHelp += "━━━━━━━━━━━━━━\n";
            adminHelp += "1️⃣ 시스템 관리\n";
            adminHelp += "• .업데이트 / .시스템 / .권한부여\n\n";
            adminHelp += "2️⃣ 데이터 보호\n";
            adminHelp += "• .백업 / .백업목록 / .복구 확인\n\n";
            adminHelp += "3️⃣ 유저 관리\n";
            adminHelp += "• .초기화 [닉네임]\n";
            adminHelp += "━━━━━━━━━━━━━━\n";
            adminHelp += "🔙 [.돌아가기]";
            replier.reply(adminHelp);
            return;
        }

        // ... (.업데이트, .백업 등 기존 로직 동일) ...
        if (msg === ".백업") { /* 백업 로직 */ }
        if (msg === ".백업목록") { /* 백업목록 로직 */ }
        if (msg === ".복구 확인") { /* 복구 로직 */ }
        if (msg.startsWith(".초기화 ")) { /* 초기화 로직 */ }
    }
};

module.exports = Handler;
