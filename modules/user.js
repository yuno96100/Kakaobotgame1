const UserDB = {};
const DATA_PATH = "sdcard/msgbot/Bots/sub/data/";

// 데이터 저장용 폴더 자동 생성
var folder = new java.io.File(DATA_PATH);
if (!folder.exists()) folder.mkdirs();

// 유저 데이터 불러오기 (없으면 신규 생성)
UserDB.get = function(sender) {
    var path = DATA_PATH + sender + ".json";
    if (!java.io.File(path).exists()) {
        var newUser = {
            name: sender,
            level: 1,
            gold: 100,
            hp: 100,
            exp: 0,
            lastStock: "" // 출석 체크 시간 저장용
        };
        this.save(sender, newUser);
        return newUser;
    }
    return JSON.parse(FileStream.read(path));
};

// 유저 데이터 저장하기
UserDB.save = function(sender, data) {
    FileStream.write(DATA_PATH + sender + ".json", JSON.stringify(data, null, 4));
};

module.exports = UserDB;
