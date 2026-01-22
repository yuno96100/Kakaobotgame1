const USER_PATH = "sdcard/msgbot/Bots/sub/data/";
const UserDB = {};

// [최적화] 메모리 캐시 저장소
const UserCache = {};

// 레벨업 체크 로직
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

// [최적화] 캐싱 기반 데이터 로드
UserDB.get = function(name) {
    // 1. 먼저 메모리 캐시에서 확인
    if (UserCache[name]) {
        return UserCache[name];
    }

    try {
        var file = new java.io.File(USER_PATH + name + ".json");
        var userData;

        if (!file.exists()) {
            // 신규 가입 시 초기 데이터
            userData = { 
                name: name, level: 1, exp: 0, maxExp: 100, money: 1000, 
                win: 0, loss: 0, ownedChars: [101], lastAttendance: "" 
            };
            this.save(name, userData);
        } else {
            // 파일에서 읽기
            var content = FileStream.read(USER_PATH + name + ".json");
            userData = JSON.parse(content);
            
            // 데이터 필드 보정
            if (userData.exp === undefined) userData.exp = 0;
            if (userData.maxExp === undefined) userData.maxExp = 100;
            if (userData.lastAttendance === undefined) userData.lastAttendance = "";
        }

        // 2. 읽어온 데이터를 메모리 캐시에 저장
        UserCache[name] = userData;
        return userData;

    } catch (e) {
        Log.error("[" + name + "] 데이터 로드 실패: " + e.message);
        return null;
    }
};

// [최적화] 데이터 저장 시 캐시와 파일 동시 갱신
UserDB.save = function(name, data) {
    try {
        // 메모리 캐시 갱신
        UserCache[name] = data;
        
        // 파일 쓰기 (비동기 처리가 안 되므로 즉시 저장)
        FileStream.write(USER_PATH + name + ".json", JSON.stringify(data, null, 2));
    } catch (e) {
        Log.error("[" + name + "] 데이터 저장 실패: " + e.message);
    }
};

// [추가] 특정 시간마다 메모리 데이터를 파일로 강제 백업하고 싶을 때 사용
UserDB.clearCache = function() {
    for (var key in UserCache) {
        delete UserCache[key];
    }
    Log.info("메모리 캐시가 초기화되었습니다.");
};

module.exports = UserDB;
