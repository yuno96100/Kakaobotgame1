const UserDB = {};
const DATA_PATH = "sdcard/msgbot/Bots/sub/data/";

// 데이터 저장용 폴더 생성
java.io.File(DATA_PATH).mkdirs();

UserDB.get = function(sender) {
    var path = DATA_PATH + sender + ".json";
    if (!FileStream.exists(path)) {
        // 신규 유저 초기 데이터
        var newUser = {
            name: sender,
            level: 1,
            gold: 100,
            hp: 100
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
