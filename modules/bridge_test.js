// sdcard/msgbot/Bots/sub/modules/bridge_test.js

const BridgeTest = {
    process: function(room, msg, sender, replier) {
        var senderName = sender.toString().split("\n")[0].trim();

        // 1. 단순 응답 테스트 (서브폰 살아있는지 확인)
        if (msg === "!연동체크") {
            replier.reply("📡 [서브폰 서버 연동중]\n────────────────\n👤 발신: " + senderName + "\n🏠 방: " + room + "\n🤖 상태: 24시간 대기 중");
            return;
        }

        // 2. 관리자(메인폰) 전용 연동 테스트
        if (msg.startsWith("!연동공지 ")) {
            var content = msg.replace("!연동공지 ", "").trim();
            // 특정 방(오픈채팅방)으로 메시지 토스 테스트
            // 예: replier.reply("오픈채팅방이름", "[서버공지] " + content);
            replier.reply("✅ 연동 데이터 수신 완료: " + content);
        }
    }
};

module.exports = BridgeTest;
