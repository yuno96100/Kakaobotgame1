const UserDB = {};
const DATA_PATH = "sdcard/msgbot/Bots/sub/data/";

var folder = new java.io.File(DATA_PATH);
if (!folder.exists()) folder.mkdirs();

UserDB.get = function(sender) {
    var path = DATA_PATH + sender + ".json";
    if (!java.io.File(path).exists()) {
        var newUser = {
            name: sender,
            title: "초보 소환사",      // 칭호 추가
            level: 1,                // 계정 레벨
            money: 1000,             // 구매 재화
            win: 0,                  // 승리
            loss: 0,                 // 패배
            ownedChars: ["기본 전사"] // 보유 캐릭터
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
