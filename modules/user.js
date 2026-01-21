// modules/user.js 예시
const UserSystem = {};

UserSystem.save = function(name, data) {
    FileStream.write("sdcard/msgbot/Bots/sub/data/" + name + ".json", JSON.stringify(data));
};

UserSystem.load = function(name) {
    var path = "sdcard/msgbot/Bots/sub/data/" + name + ".json";
    if (!FileStream.exists(path)) return null;
    return JSON.parse(FileStream.read(path));
};

module.exports = UserSystem;
