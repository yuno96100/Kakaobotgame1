const USER_PATH = "sdcard/msgbot/Bots/sub/data/";

const UserDB = {};

// 유저 데이터 불러오기 및 생성
UserDB.get = function(name) {
    var file = new java.io.File(USER_PATH + name + ".json");
    if (!file.exists()) {
        var folder = new java.io.File(USER_PATH);
        if (!folder.exists()) folder.mkdirs();

        // [경험치 추가] 신규 유저 초기 데이터
        var newUser = {
            name: name,
            level: 1,
            exp: 0,        // 현재 경험치
            maxExp: 100,   // 레벨업에 필요한 경험치
            money: 1000,
            win: 0,
            loss: 0,
            ownedChars: [101],
            lastAttendance: ""
        };
        this.save(name, newUser);
        return newUser;
    }
    return JSON.parse(FileStream.read(USER_PATH + name + ".json"));
};

// 유저 데이터 저장
UserDB.save = function(name, data) {
    FileStream.write(USER_PATH + name + ".json", JSON.stringify(data));
};

module.exports = UserDB;
