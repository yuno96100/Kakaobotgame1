const USER_PATH = "sdcard/msgbot/Bots/sub/data/";
const UserDB = {};

UserDB.checkLevelUp = function(userData) {
    var leveledUp = false;
    while (userData.exp >= userData.maxExp) {
        userData.exp -= userData.maxExp;
        userData.level++;
        userData.maxExp = Math.floor(userData.maxExp * 1.2);
        userData.money += 500;
        leveledUp = true;
    }
    return leveledUp;
};

UserDB.get = function(name) {
    try {
        var file = new java.io.File(USER_PATH + name + ".json");
        var userData;
        if (!file.exists()) {
            userData = { name: name, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" };
            this.save(name, userData);
        } else {
            userData = JSON.parse(FileStream.read(USER_PATH + name + ".json"));
            if (userData.exp === undefined) userData.exp = 0;
            if (userData.maxExp === undefined) userData.maxExp = 100;
            if (userData.lastAttendance === undefined) userData.lastAttendance = "";
        }
        return userData;
    } catch (e) { return null; }
};

UserDB.save = function(name, data) {
    FileStream.write(USER_PATH + name + ".json", JSON.stringify(data));
};

module.exports = UserDB;
