const ADMIN_PATH = "sdcard/msgbot/Bots/sub/data/admins.json";
const AdminDB = {};

AdminDB.getAdmins = function() {
    try {
        if (!java.io.File(ADMIN_PATH).exists()) {
            var initial = ["관리자"]; 
            var folder = new java.io.File("sdcard/msgbot/Bots/sub/data/");
            if (!folder.exists()) folder.mkdirs();
            FileStream.write(ADMIN_PATH, JSON.stringify(initial));
            return initial;
        }
        return JSON.parse(FileStream.read(ADMIN_PATH));
    } catch (e) { return ["관리자"]; }
};

AdminDB.add = function(name) {
    var admins = this.getAdmins();
    if (admins.indexOf(name) === -1) {
        admins.push(name);
        FileStream.write(ADMIN_PATH, JSON.stringify(admins));
        return true;
    }
    return false;
};

AdminDB.remove = function(name) {
    var admins = this.getAdmins();
    var index = admins.indexOf(name);
    if (index > -1 && name !== "관리자") {
        admins.splice(index, 1);
        FileStream.write(ADMIN_PATH, JSON.stringify(admins));
        return true;
    }
    return false;
};

module.exports = AdminDB;
