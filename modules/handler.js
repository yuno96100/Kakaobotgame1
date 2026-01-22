const UserDB = require("./user");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    var user = UserDB.get(sender); // 유저 정보 자동 로드/생성

    if (msg === "/정보") {
        replier.reply("[" + sender + "님의 정보]\n💰 골드: " + user.gold + "\n⭐ 레벨: " + user.level);
    }

    if (msg === "/출석") {
        user.gold += 50;
        UserDB.save(sender, user); // 데이터 저장
        replier.reply(sender + "님, 출석 보상으로 50골드를 얻었습니다!");
    }
};

module.exports = Handler;
