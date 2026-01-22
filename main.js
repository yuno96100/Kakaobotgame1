// sdcard/msgbot/Bots/sub/main.js

// [1] 외부 모듈 로드를 일단 주석 처리하여 에러 차단
// const Handler = require("sdcard/msgbot/Bots/sub/modules/handler");
// const BridgeTest = require("sdcard/msgbot/Bots/sub/modules/bridge_test");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    
    // [2] 이름 정제
    var senderName = sender.toString().split("\n")[0].trim();
    
    // [3] 기본 응답 테스트 (이게 안 오면 권한 문제입니다)
    if (msg === ".체크") {
        replier.reply("✅ [시스템] 정상 작동 중\n📍 방: " + room + "\n👤 유저: " + senderName);
        return;
    }

    // [4] 업데이트 기능 (작동한다고 하신 로직)
    if (msg === ".업데이트" && senderName === "관리자") {
        replier.reply("🔄 [시스템] 업데이트를 시작합니다.");
        // 기존 업데이트 로직...
        return;
    }

    // [5] 연동 로직 (모듈 대신 내부에 직접 구현하여 에러 방지)
    if (msg.startsWith(".연동")) {
        if (msg === ".연동체크") {
            replier.reply("📡 [연동] 브릿지 활성화 완료\n현재 위치: " + room);
        } else if (msg.startsWith(".연동전송 ")) {
            var params = msg.replace(".연동전송 ", "").split(" ");
            var targetRoom = params[0];
            var content = params.slice(1).join(" ");
            
            try {
                replier.reply(targetRoom, "📢 [" + room + "] " + senderName + ": " + content);
                replier.reply("✅ 전송 완료");
            } catch (e) {
                replier.reply("❌ 전송 실패 (방 이름 확인)");
            }
        }
        return;
    }
}
