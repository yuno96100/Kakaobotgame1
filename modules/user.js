const UserDB = {};
const cache = {};

UserDB.get = function(name) {
    if (cache[name]) return cache[name];
    var path = "sdcard/msgbot/Bots/sub/data/" + name + ".json";
    if (java.io.File(path).exists()) {
        var data = JSON.parse(FileStream.read(path));
        cache[name] = data;
        return data;
    }
    return { name: name, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, roomName: "", lastAttendance: "" };
};

UserDB.save = function(name, data) {
    cache[name] = data;
    var path = "sdcard/msgbot/Bots/sub/data/" + name + ".json";
    var folder = new java.io.File("sdcard/msgbot/Bots/sub/data/");
    if (!folder.exists()) folder.mkdirs();
    FileStream.write(path, JSON.stringify(data, null, 4));
};

UserDB.checkLevelUp = function(user) {
    if (user.exp >= user.maxExp) {
        user.level++;
        user.exp -= user.maxExp;
        user.maxExp = Math.floor(user.maxExp * 1.5);
        return true;
    }
    return false;
};

UserDB.clearCache = function() {
    for (var key in cache) delete cache[key];
};

module.exports = UserDB;
