const USER_PATH = "sdcard/msgbot/Bots/sub/data/";

const UserDB = {};

// 유저 데이터 불러오기 및 생성
UserDB.get = function(name) {
    var file = new java.io.File(USER_PATH + name + ".json");
    if (!file.exists()) {
        // 폴더가 없으면 생성
        var folder = new java.io.File(USER_PATH);
        if (!folder.exists()) folder.mkdirs();

        // 신규 유저 초기 데이터
        var newUser = {
            name: name,
            level: 1,
            money: 1000,
            win: 0,
            loss: 0,
            ownedChars: [101], // 기본 캐릭터 (연습용 전사) 지급
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

module.exports = UserDB; // 이 부분이 있어야 Handler에서 get 함수를 인식합니다.
