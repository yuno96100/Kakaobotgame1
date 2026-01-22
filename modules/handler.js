const UserDB = require("./user");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    var user = UserDB.get(sender);

    // .정보 명령어 처리
    if (msg === ".정보") {
        // 승률 계산 로직 (0판일 경우 대비)
        var totalGames = user.win + user.loss;
        var winRate = totalGames === 0 ? 0 : ((user.win / totalGames) * 100).toFixed(1);

        var info = "👤 [ " + user.name + "님의 소환사 정보 ]\n";
        info += "━━━━━━━━━━━━━━\n";
        info += "🏅 칭호: " + user.title + "\n";
        info += "⭐ 계정 레벨: Lv." + user.level + "\n";
        info += "💰 보유 재화: " + user.money.toLocaleString() + " G\n";
        info += "📊 전적: " + user.win + "승 " + user.loss + "패 (승률: " + winRate + "%)\n";
        info += "⚔️ 보유 캐릭터: [" + user.ownedChars.join(", ") + "]\n";
        info += "━━━━━━━━━━━━━━";
        
        replier.reply(info);
        return;
    }

    // .도움말 명령어
    if (msg === ".도움말") {
        var help = "📜 [ 게임 도움말 ]\n";
        help += ".정보 - 내 프로필 확인\n";
        help += ".출석 - 일일 보상 획득\n";
        replier.reply(help);
        return;
    }
};

module.exports = Handler;
