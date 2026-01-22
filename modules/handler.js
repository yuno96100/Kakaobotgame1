const UserDB = require("./user");
const AdminDB = require("./admin");
const Champions = require("./champions");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    
    // [ 1. 초기 설정 및 권한 체크 ]
    var admins = AdminDB.getAdmins();
    var isMaster = (sender === "관리자");
    var isAdmin = (admins.indexOf(sender) > -1 || isMaster);
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();

    // [ 2. 가입 처리 섹션 ]
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender);
            var res = "━━━━━━━━━━━━━━━━━━━━━━\n";
            res += "  [ 🎉 ]  소환사 등록 완료\n";
            res += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
            res += "  ▶ " + sender + "님, 환영합니다!\n";
            res += "  ▶ 초기 자산: 1,000 G 지급\n\n";
            res += "  ※ 주의: 닉네임 변경 시 데이터 이전 필수\n";
            res += "──────────────────────\n";
            res += "  [ .메뉴 ]를 입력하여 시작하세요.";
            replier.reply(res);
            return;
        }
        var guide = "━━━━━━━━━━━━━━━━━━━━━━\n";
        guide += "  [ ⚔️ ]  소환사의 리그  |  JOIN\n";
        guide += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
        guide += "  아직 등록되지 않은 소환사입니다.\n";
        guide += "  지금 바로 리그에 참여하세요!\n\n";
        guide += "──────────────────────\n";
        guide += "  ▶ [ .가입 ] 입력";
        replier.reply(guide);
        return;
    } 
    if (msg === ".가입") {
        replier.reply("━━━━━━━━━━━━━━━━━━━━━━\n  [ ⚠️ ] 이미 등록된 소환사입니다.\n━━━━━━━━━━━━━━━━━━━━━━");
        return;
    }

    var user = UserDB.get(sender);

    // [ 3. 메인 메뉴 ]
    if (msg === ".메뉴" || msg === ".돌아가기" || msg === "돌아가기") {
        var menu = "━━━━━━━━━━━━━━━━━━━━━━\n";
        menu += "  [ 🎮 ]  메인 메뉴  |  MAIN\n";
        menu += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
        menu += "  ▶  내 정보 확인\n";
        menu += "  ▶  캐릭터\n";
        menu += "  ▶  일일 출석\n\n";
        menu += "──────────────────────\n";
        menu += "  ※ 상세 도움말: [ .도움말 ]";
        replier.reply(menu);
        return;
    }

    // [ 4. 소환사 정보 ]
    if (msg === ".정보") {
        var total = user.win + user.loss;
        var rate = total === 0 ? 0 : ((user.win / total) * 100).toFixed(1);
        var expPercent = Math.floor((user.exp / user.maxExp) * 100);
        var barCount = Math.floor(expPercent / 10);
        var expBar = "■".repeat(barCount) + "□".repeat(10 - barCount);
        
        var info = "━━━━━━━━━━━━━━━━━━━━━━\n";
        info += "  [ 👤 ]  소환사 정보  |  INFO\n";
        info += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
        info += "  • 닉네임 : " + user.name + (isAdmin ? " (Admin)" : "") + "\n";
        info += "  • 레벨 : Lv." + user.level + "\n";
        info += "  • 경험치 : [" + expBar + "] " + expPercent + "%\n";
        info += "  • 보유 골드 : " + user.money.toLocaleString() + " G\n";
        info += "  • 전적 : " + user.win + "승 " + user.loss + "패 (" + rate + "%)\n\n";
        info += "──────────────────────\n";
        info += "  [ .돌아가기 ]";
        replier.reply(info);
        return;
    }

    // [ 5. 출석/도움말/캐릭터 ]
    if (msg === ".도움말") {
        var help = "━━━━━━━━━━━━━━━━━━━━━━\n";
        help += "  [ 📜 ]  HELP CENTER\n";
        help += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
        help += "  • .정보 : 상태 및 전적 확인\n";
        help += "  • .캐릭터 : 보유 캐릭터 목록\n";
        help += "  • .출석 : 일일 보상 수령\n\n";
        help += "  • .메뉴 : 메인 화면으로\n";
        help += "  • .돌아가기 : 이전 단계로\n";
        help += "━━━━━━━━━━━━━━━━━━━━━━";
        replier.reply(help);
        return;
    }

    if (msg === ".출석") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) {
            replier.reply("━━━━━━━━━━━━━━━━━━━━━━\n  [ 🔔 ] 이미 보상을 수령했습니다.\n━━━━━━━━━━━━━━━━━━━━━━");
            return;
        }
        user.money += 100; user.exp += 50; user.lastAttendance = today;
        var isLvUp = UserDB.checkLevelUp(user);
        UserDB.save(sender, user);
        var att = "━━━━━━━━━━━━━━━━━━━━━━\n  [ 🎁 ]  출석 체크 완료\n━━━━━━━━━━━━━━━━━━━━━━\n\n";
        att += "  ▶ 골드 : +100 G\n  ▶ 경험치 : +50 EXP\n";
        if (isLvUp) att += "  🎊 레벨업! Lv." + user.level + "\n";
        att += "\n──────────────────────\n  [ .돌아가기 ]";
        replier.reply(att);
        return;
    }

    if (msg === ".캐릭터") {
        replier.reply("━━━━━━━━━━━━━━━━━━━━━━\n  [ ⚔️ ]  캐릭터 인벤토리\n━━━━━━━━━━━━━━\n\n  (보유 캐릭터 목록 준비 중)\n\n──────────────────────\n  [ .돌아가기 ]");
        return;
    }

    // [ 6. 관리자 섹션 ]
    if (isAdmin && isMaster) {
        if (msg === ".관리자명령어") {
            var adm = "━━━━━━━━━━━━━━━━━━━━━━\n  [ 🛠️ ]  관리자 제어 콘솔\n━━━━━━━━━━━━━━━━━━━━━━\n\n";
            adm += "  [ 시스템 ] .업데이트 / .시스템\n  [ 데이터 ] .백업 / .복구 확인\n  [ 유저 ] .초기화 [이름] / .닉네임변경 [A]>[B]\n\n";
            adm += "──────────────────────\n  [ .돌아가기 ]";
            replier.reply(adm);
            return;
        }
        // ... (닉네임변경, 백업, 초기화 로직 유지) ...
    }
};
module.exports = Handler;
