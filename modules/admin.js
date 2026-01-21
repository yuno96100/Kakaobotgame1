const ADMIN_PATH = "sdcard/msgbot/Bots/sub/data/admins.json";

const AdminDB = {};

// 관리자 리스트 불러오기
AdminDB.getAdmins = function() {
    if (!java.io.File(ADMIN_PATH).exists()) {
        // 초기 최종 관리자(시스템) 등록
        var initial = ["시스템"];
        FileStream.write(ADMIN_PATH, JSON.stringify(initial));
        return initial;
    }
    return JSON.parse(FileStream.read(ADMIN_PATH));
};

// 관리자 추가
AdminDB.add = function(name) {
    var admins = this.getAdmins();
    if (admins.indexOf(name) === -1) {
        admins.push(name);
        FileStream.write(ADMIN_PATH, JSON.stringify(admins));
        return true;
    }
    return false;
};

// 관리자 제거
AdminDB.remove = function(name) {
    var admins = this.getAdmins();
    var index = admins.indexOf(name);
    if (index > -1 && name !== "시스템") { // '시스템'은 삭제 불가
        admins.splice(index, 1);
        FileStream.write(ADMIN_PATH, JSON.stringify(admins));
        return true;
    }
    return false;
};

module.exports = AdminDB;
