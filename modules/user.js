
const USER_PATH = "sdcard/msgbot/Bots/sub/data/";

const UserDB = {};

UserDB.get = function(name) {
    var file = new java.io.File(USER_PATH + name + ".json");
    var userData;

    if (!file.exists()) {
        var folder = new java.io.File(USER_PATH);
        if (!folder.exists()) folder.mkdirs();

        userData = {
            name: name,
            level: 1,
            exp: 0,
            maxExp: 100,
            money: 1000,
            win: 0,
            loss: 0,
            ownedChars: [101],
            lastAttendance: ""
        };
        this.save(name, userData);
    } else {
        userData = JSON.parse(FileStream.read(USER_PATH + name + ".json"));
        
        // [보강: 필드 자동 보정] 새로운 항목이 추가되어도 에러 안 나게 방지
        var updated = false;
        if (userData.exp === undefined) { userData.exp = 0; updated = true; }
        if (userData.maxExp === undefined) { userData.maxExp = 100; updated = true; }
        if (userData.lastAttendance === undefined) { userData.lastAttendance = ""; updated = true; }
        
        if (updated) this.save(name, userData);
    }
    return userData;
};

UserDB.save = function(name, data) {
    FileStream.write(USER_PATH + name + ".json", JSON.stringify(data));
};

module.exports = UserDB;
