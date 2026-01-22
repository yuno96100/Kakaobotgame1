const USER_PATH = "sdcard/msgbot/Bots/sub/data/";

const UserDB = {};

// [보강] 레벨업 체크 함수
UserDB.checkLevelUp = function(userData) {
    var leveledUp = false;
    while (userData.exp >= userData.maxExp) {
        userData.exp -= userData.maxExp;
        userData.level++;
        userData.maxExp = Math.floor(userData.maxExp * 1.2); // 레벨당 필요 경험치 20% 증가
        leveledUp = true;
    }
    return leveledUp;
};

UserDB.get = function(name) {
    try {
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
            
            // 필드 자동 보정 (Schema 보정)
            var updated = false;
            if (userData.exp === undefined) { userData.exp = 0; updated = true; }
            if (userData.maxExp === undefined) { userData.maxExp = 100; updated = true; }
            if (userData.lastAttendance === undefined) { userData.lastAttendance = ""; updated = true; }
            
            if (updated) this.save(name, userData);
        }
        return userData;
    } catch (e) {
        Log.error(name + " 데이터 로드 실패: " + e.message);
        return null;
    }
};

UserDB.save = function(name, data) {
    try {
        FileStream.write(USER_PATH + name + ".json", JSON.stringify(data));
    } catch (e) {
        Log.error(name + " 데이터 저장 실패: " + e.message);
    }
};

module.exports = UserDB;
