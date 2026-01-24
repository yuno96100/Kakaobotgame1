// [modules/tester.js]
const Tester = {};

Tester.check = function(room, msg, sender, replier, imageDB, isGroupChat) {
    if (msg === ".테스트") {
        const userHash = String(imageDB.getProfileHash()).trim();
        var res = "🧪 [테스트 모듈 응답 성공]\n";
        res += "🆔 내 해시: " + userHash + "\n";
        res += "🏠 방 이름: [" + room + "]";
        
        replier.reply(res);
        return true; // 실행 완료를 알림
    }
    return false; // .테스트가 아닐 경우 false 반환
};

module.exports = Tester;
