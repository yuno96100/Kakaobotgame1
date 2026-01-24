// [modules/tester.js]
const Tester = {};

Tester.check = function(room, msg, sender, replier, imageDB, isGroupChat) {
    if (msg === ".테스트") {
        const userHash = String(imageDB.getProfileHash()).trim();
        var res = "🧪 [테스트 응답]\n";
        res += "🆔 내 해시: " + userHash + "\n";
        res += "🏠 방: " + room;
        replier.reply(res);
        return true; 
    }
    return false;
};

module.exports = Tester; // 이 줄이 반드시 있어야 함
