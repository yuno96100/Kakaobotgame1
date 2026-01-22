const UserDB = require("./user"); // 위에서 만든 유저 모듈 불러오기

const Handler = {};

Handler.process = function(msg, sender, replier) {
    // 모든 명령어 처리 전에 유저 데이터를 불러옵니다.
    var user = UserDB.get(sender);

    // 1. 도움말 명령어
    if (msg === ".도움말") {
        var help = "🎮 [ 게임 봇 도움말 ]\n";
        help += "━━━━━━━━━━━━━━\n";
        help += ".정보 - 내 스탯 및 보유 골드 확인\n";
        help += ".출석 - 매일 50골드 보상 받기\n";
        help += ".강화 - 골드를 써서 레벨업 (미구현)\n";
        help += "━━━━━━━━━━━━━━";
        replier.reply(help);
        return;
    }

    // 2. 내 정보 확인
    if (msg === ".정보") {
        var info = "👤 [" + sender + "님의 정보]\n";
        info += "⭐ 레벨: " + user.level + "\n";
        info += "💰 골드: " + user.gold + " G\n";
        info += "❤️ 체력: " + user.hp + " / 100\n";
        info += "📊 경험치: " + user.exp;
        replier.reply(info);
        return;
    }

    // 3. 출석 체크 (간단한 로직)
    if (msg === ".출석") {
        user.gold += 50;
        user.exp += 10;
        UserDB.save(sender, user); // 데이터 파일 저장
        replier.reply("🎊 출석 완료! 50골드와 경험치 10을 획득했습니다.\n(현재 골드: " + user.gold + "G)");
        return;
    }
};

module.exports = Handler;
