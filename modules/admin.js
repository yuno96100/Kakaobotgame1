const AdminDB = {};
const path = "sdcard/msgbot/Bots/sub/modules/admin_list.json";

AdminDB.getAdmins = function() {
    if (!java.io.File(path).exists()) return ["관리자"];
    return JSON.parse(FileStream.read(path));
};

AdminDB.add = function(name) {
    var list = this.getAdmins();
    if (list.indexOf(name) > -1) return false;
    list.push(name);
    FileStream.write(path, JSON.stringify(list));
    return true;
};

AdminDB.remove = function(name) {
    if (name === "관리자") return false;
    var list = this.getAdmins();
    var idx = list.indexOf(name);
    if (idx === -1) return false;
    list.splice(idx, 1);
    FileStream.write(path, JSON.stringify(list));
    return true;
};

module.exports = AdminDB;
