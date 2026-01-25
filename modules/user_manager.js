const UserManager = {};
const USER_DIR = "/sdcard/msgbot/Bots/sub/data/users/";

UserManager.getFilePath = function(hash) {
    return USER_DIR + hash + ".json";
};

UserManager.isRegistered = function(hash) {
    return new java.io.File(this.getFilePath(hash)).exists();
};

UserManager.register = function(hash, name) {
    var folder = new java.io.File(USER_DIR);
    if (!folder.exists()) folder.mkdirs();

    var userData = {
        "name": name,
        "hash": hash,
        "level": 1,
        "money": 1000,
        "joinDate": new Date().toLocaleString()
    };
    FileStream.write(this.getFilePath(hash), JSON.stringify(userData, null, 4));
    return userData;
};

UserManager.getData = function(hash) {
    if (!this.isRegistered(hash)) return null;
    return JSON.parse(FileStream.read(this.getFilePath(hash)));
};

module.exports = UserManager;
