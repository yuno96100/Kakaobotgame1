// sdcard/msgbot/Bots/sub/modules/bridge_test.js

const BridgeTest = {
    process: function(room, msg, senderName, replier) {
        
        // 1. 상태 확인 (누구나 사용 가능)
        if (msg === ".연동체크") {
            var res = "🌐 [네트워크 노드 상태]\n";
            res += "────────────────\n";
            res += "👤 사용자: " + senderName + "\n";
            res += "📍 위치: " + room + "\n";
            res += "📡 상태: 수신 대기 중 (Active)";
            replier.reply(res);
            return;
        }

        // 2. 범용 메시지 전달 (브릿지 핵심)
        // 형식: .연동전송 [대상방이름] [내용]
        if (msg.startsWith(".연동전송 ")) {
            var params = msg.replace(".연동전송 ", "").split(" ");
            if (params.length < 2) {
                replier.reply("⚠️ 사용법: .연동전송 [방이름] [내용]");
                return;
            }

            var targetRoom = params[0]; // 데이터를 보낼 목적지 방
            var content = params.slice(1).join(" "); // 보낼 내용

            try {
                // 서브폰(시스템)이 해당 방으로 메시지를 쏩니다.
                replier.reply(targetRoom, "📢 [" + room + "]의 " + senderName + "님 메시지:\n" + content);
                replier.reply("✅ [" + targetRoom + "] 방으로 전송 성공!");
            } catch (e) {
                replier.reply("❌ 전송 실패: 방 이름을 확인하거나 봇이 해당 방에 있는지 확인하세요.");
            }
        }
    }
};

module.exports = BridgeTest;
