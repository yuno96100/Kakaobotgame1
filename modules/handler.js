const UserDB = require("./user");
const Champions = require("./champions");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    var path = "sdcard/msgbot/Bots/sub/data/" + sender + ".json";
    var isRegistered = java.io.File(path).exists();

    // [이벤트 감지: 오픈채팅봇의 환영 문구 확인]
    // 오픈채팅봇이 "소환사의 협곡에 오신것을 환영합니다."를 포함한 메시지를 보냈을 때
    if (msg.includes("소환사의 협곡에 오신것을 환영합니다.")) {
        var welcomeGuide = "📜 [ 가입 안내 ]\n";
        welcomeGuide += "━━━━━━━━━━━━━━\n";
        welcomeGuide += "새로 오신 소환사님, 반갑습니다!\n";
        welcomeGuide += "게임을 시작하려면 [.가입]을 입력해주세요.\n";
        welcomeGuide += "━━━━━━━━━━━━━━";
        replier.reply(welcomeGuide);
        return;
    }

    // [명령어: .가입]
    if (msg === ".가입") {
        if (isRegistered) {
            replier.reply("⚠️ 이미 소환사 등록이 완료된 상태입니다.");
            return;
        }
        
        UserDB.get(sender); // 신규 유저 데이터 생성
        
        var success = "🎊 [ 소환사 등록 성공 ]\n";
        success += "━━━━━━━━━━━━━━\n";
        success += sender + "님의 데이터가 생성되었습니다!\n\n";
        success += "📜 '.메뉴'를 입력하여 기능을 확인하세요.";
        replier.reply(success);
        return;
    }

    // [미가입자 차단]
    if (!isRegistered) {
        if (msg.startsWith(".")) {
            replier.reply("👋 아직 등록되지 않은 소환사입니다.\n'.가입'을 먼저 진행해주세요!");
        }
        return;
    }

    // [가입 유저 전용 메뉴]
    var user = UserDB.get(sender);

    if (msg === ".메뉴" || msg === ".도움말") {
        var menu = "🎮 [ 메인 메뉴 ]\n";
        menu += "━━━━━━━━━━━━━━\n";
        menu += "1️⃣ 내 정보 확인 ➔ .정보\n";
        menu += "2️⃣ 보유 캐릭터 ➔ .보유캐릭터\n";
        menu += "3️⃣ 일일 보상 ➔ .출석\n";
        menu += "━━━━━━━━━━━━━━";
        replier.reply(menu);
        return;
    }

    if (msg === ".정보") {
        var total = user.win + user.loss;
        var rate = total === 0 ? 0 : ((user.win / total) * 100).toFixed(1);
        var info = "👤 [" + user.name + " 정보]\n";
        info += "⭐ Lv." + user.level + " / 💰 " + user.money.toLocaleString() + " G\n";
        info += "📊 전적: " + user.win + "승 " + user.loss + "패 (" + rate + "%)\n";
        info += "📜 상세 캐릭터: '.보유캐릭터'";
        replier.reply(info);
        return;
    }
};

module.exports = Handler;
