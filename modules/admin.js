// /sdcard/msgbot/Bots/sub/modules/admin.js
const ADMIN_PATH = "/sdcard/msgbot/Bots/sub/data/admins.json";
const AdminDB = {};

AdminDB.getAdmins = function() {
    try {
        var file = new java.io.File(ADMIN_PATH);
        if (!file.exists()) {
            var initial = ["관리자"];
            var folder = new java.io.File("/sdcard/msgbot/Bots/sub/data/");
            if (!folder.exists()) folder.mkdirs();
            FileStream.write(ADMIN_PATH, JSON.stringify(initial));
            return initial;
        }
        return JSON.parse(FileStream.read(ADMIN_PATH));
    } catch (e) {
        Log.error("AdminDB 로드 에러: " + e.message);
        return ["관리자"]; // 에러 시 기본 관리자 반환
    }
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
    // '관리자'라는 기본 이름은 삭제 불가능하게 설정
    if (index > -1 && name !== "관리자") {
        admins.splice(index, 1);
        FileStream.write(ADMIN_PATH, JSON.stringify(admins));
        return true;
    }
    return false;
};

module.exports = AdminDB;
