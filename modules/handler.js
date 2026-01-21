const UserDB = require("./user");
const Champions = require("./champions");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    var path = "sdcard/msgbot/Bots/sub/data/" + sender + ".json";
    var isRegistered = java.io.File(path).exists();

    // [1단계: 가입 절차]
    if (msg === ".가입") {
        if (isRegistered) {
            replier.reply("⚠️ 이미 소환사 등록이 완료된 상태입니다!\n'.메뉴'를 입력해 기능을 이용하세요.");
            return;
        }
        
        // 데이터 생성
        UserDB.get(sender); 
        
        var success = "🎊 [ 소환사 가입 승인 ]\n";
        success += "━━━━━━━━━━━━━━\n";
        success += sender + " 소환사님의 데이터가 생성되었습니다.\n\n";
        success += "이제 모든 게임 기능을 이용하실 수 있습니다!\n";
        success += "📜 '.메뉴'를 입력하여 확인하세요.";
        replier.reply(success);
        return;
    }

    // [2단계: 미가입자 접근 제한]
    if (!isRegistered) {
        // 점(.)으로 시작하는 명령어를 쳤는데 가입이 안 된 경우
        if (msg.startsWith(".")) {
            replier.reply("🚫 접근 권한이 없습니다.\n먼저 '.가입' 명령어를 통해 소환사 등록을 해주세요.");
        }
        return;
    }

    // [3단계: 가입된 유저 전용 메뉴 (1번 코드 핵심 로직)]
    var user = UserDB.get(sender);

    if (msg === ".메뉴" || msg === ".도움말") {
        var menu = "🎮 [ 리그 오브 봇: 메인 메뉴 ]\n";
        menu += "━━━━━━━━━━━━━━\n";
        menu += "1️⃣ 내 정보 확인 ➔ .정보\n";
        menu += "2️⃣ 보유 캐릭터 ➔ .보유캐릭터\n";
        menu += "3️⃣ 일일 보상 ➔ .출석\n";
        menu += "4️⃣ 대전 매칭 ➔ .매칭 (준비중)\n";
        menu += "━━━━━━━━━━━━━━";
        replier.reply(menu);
    }
    
    // ... 이후 .정보, .보유캐릭터 등 기존 1번 코드 내용 동일 ...
};

module.exports = Handler;
