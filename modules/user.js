const USER_PATH = "sdcard/msgbot/Bots/sub/data/";
const UserCache = {}; 
const UserDB = {};

UserDB.get = function(name) {
    if (UserCache[name]) return UserCache[name];
    try {
        var file = new java.io.File(USER_PATH + name + ".json");
        var userData;
        if (!file.exists()) {
            userData = { name: name, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" };
            this.save(name, userData);
        } else {
            userData = JSON.parse(FileStream.read(USER_PATH + name + ".json"));
        }
        UserCache[name] = userData;
        return userData;
    } catch (e) { return null; }
};

UserDB.save = function(name, data) {
    UserCache[name] = data;
    FileStream.write(USER_PATH + name + ".json", JSON.stringify(data, null, 2));
};

UserDB.checkLevelUp = function(user) {
    var up = false;
    while (user.exp >= user.maxExp) {
        user.exp -= user.maxExp;
        user.level++;
        user.maxExp = Math.floor(user.maxExp * 1.2);
        user.money += 500;
        up = true;
    }
    return up;
};

UserDB.clearCache = function() { for (var k in UserCache) delete UserCache[k]; };
module.exports = UserDB;
