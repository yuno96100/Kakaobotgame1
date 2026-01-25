// [modules/handler.js]
const Handler = {};

// 1. 모듈 로드 함수 (안전하게 분리)
function loadModule(name) {
    try {
        return require(name);
    } catch (e) {
        return null; // 실패 시 null 반환
    }
}

const User = loadModule("user_manager");
const Room = loadModule("room_manager");

const MASTER_HASH = "236652781"; 
const TARGET_ROOM = "게임봇";

Handler.process = function(room, msg, sender, replier, imageDB, isGroupChat) {
    // [로그] 함수가 호출되었는지 확인 (나중에 지워도 됨)
    // java.lang.System.out.println("핸들러 작동 중: " + msg);

    try {
        const userHash = String(imageDB.getProfileHash()).trim();
        
        // 2. 관리자 정보조회 (모듈 의존성 낮춤)
        if (msg === ".정보조회") {
            if (userHash !== MASTER_HASH) {
                replier.reply("⚠️ 권한 없음 (ID: " + userHash + ")");
                return;
            }
            
            // 방 해시 생성 로직
            var rHash = isGroupChat ? "G_" + room.length : "P_" + userHash; 
            
            var res = "📊 [조회 결과]\n";
            res += "👤 이름: " + sender + "\n";
            res += "🆔 해시: " + userHash + "\n";
            res += "🏠 방명: " + room + "\n";
            res += "📂 모듈상태: " + (User ? "✅" : "❌"); // 여기서 모듈 로드 여부 확인 가능
            replier.reply(res);
            return;
        }

        // 3. 모듈이 정상일 때만 실행되는 로직
        if (User && Room) {
            var rHash = isGroupChat ? "G_" + room.length : "P_" + userHash;
            Room.saveRoom(room, rHash);

            if (!isGroupChat && msg === ".가입") {
                if (User.isRegistered(userHash)) {
                    replier.reply("✅ 이미 가입된 유저입니다.");
                } else {
                    User.register(userHash, sender);
                    replier.reply("🎊 가입 완료!");
                }
            }
        } else {
            // 모듈이 없으면 알려줌
            if (msg.startsWith(".")) replier.reply("⚠️ 시스템 모듈(User/Room)을 찾을 수 없습니다.");
        }

    } catch (err) {
        replier.reply("⚠️ 핸들러 내부 에러: " + err.message);
    }
};

module.exports = Handler;
