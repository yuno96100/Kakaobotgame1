const USER_PATH = "sdcard/msgbot/Bots/sub/data/";
const UserDB = {};

// [최적화] 데이터 로드 시 방어 로직 강화
UserDB.get = function(name) {
    try {
        var file = new java.io.File(USER_PATH + name + ".json");
        var userData;

        if (!file.exists()) {
            userData = { 
                name: name, level: 1, exp: 0, maxExp: 100, money: 1000, 
                win: 0, loss: 0, ownedChars: [101], lastAttendance: "" 
            };
            this.save(name, userData);
        } else {
            var content = FileStream.read(USER_PATH + name + ".json");
            if (!content) throw new Error("파일 내용이 비어있음");
            userData = JSON.parse(content);
            
            // 필드 누락 보정 (최적화)
            var defaults = { exp: 0, maxExp: 100, money: 1000, lastAttendance: "" };
            var isUpdated = false;
            for (var key in defaults) {
                if (userData[key] === undefined) {
                    userData[key] = defaults[key];
                    isUpdated = true;
                }
            }
            if (isUpdated) this.save(name, userData);
        }
        return userData;
    } catch (e) {
        // 에러 발생 시 로그를 남기고 기본값 반환하여 봇 멈춤 방지
        Log.error("[" + name + "] 데이터 로드 실패: " + e.message);
        return null;
    }
};

UserDB.save = function(name, data) {
    try {
        FileStream.write(USER_PATH + name + ".json", JSON.stringify(data, null, 2));
    } catch (e) {
        Log.error("[" + name + "] 데이터 저장 실패: " + e.message);
    }
};

module.exports = UserDB;
