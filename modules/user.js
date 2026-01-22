// modules/user.js (롤 컨셉 튜닝)
const UserDB = {};
const DATA_PATH = "sdcard/msgbot/Bots/sub/data/";

UserDB.get = function(sender) {
    var path = DATA_PATH + sender + ".json";
    if (!java.io.File(path).exists()) {
        var newUser = {
            name: sender,
            lv: 1,           // 계정 레벨
            exp: 0,          // 계정 경험치
            money: 500,      // 보유 재화
            win: 0,
            loss: 0,
            chars: ["전사"]   // 기본 캐릭터
        };
        this.save(sender, newUser);
        return newUser;
    }
    return JSON.parse(FileStream.read(path));
};

UserDB.save = function(sender, data) {
    FileStream.write(DATA_PATH + sender + ".json", JSON.stringify(data, null, 4));
};

module.exports = UserDB;
