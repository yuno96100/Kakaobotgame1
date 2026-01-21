const UserDB = require("./user");
const AdminDB = require("./admin");
const Champions = require("./champions");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    // 1. 관리자 및 가입 여부 체크
    var admins = AdminDB.getAdmins();
    // 관리자 이름을 '관리자'로 변경하여 체크
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");

    var path = "sdcard/msgbot/Bots/sub/data/" + sender + ".json";
    var isRegistered = java.io.File(path).exists();

    // 2. 미가입 유저의 첫 대화 감지 및 가입 절차
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender);
            var success = "🎊 [ 소환사 등록 성공 ]\n";
            success += "━━━━━━━━━━━━━━\n";
            success += sender + "님, 데이터 생성이 완료되었습니다!\n\n";
            success += "📜 '.메뉴'를 입력하여 기능을 확인하세요.";
            replier.reply(success);
            return;
        }

        // 환영 문구 수정: '턴제' -> '매일'
        var welcome = "⚔️ [ 소환사의 협곡에 오신것을 환영합니다 ]\n";
        welcome += "━━━━━━━━━━━━━━\n";
        welcome += "반갑습니다, " + sender + "님!\n";
        welcome += "이곳은 매일 결투가 진행되는 소환사들의 리그입니다.\n\n";
        welcome += "👉 게임 참여를 위해 [.가입]을 입력해주세요!";
        replier.reply(welcome);
        return;
    }

    // 3. 관리자 전용 명령어 (시스템>관리자 전용)
    if (isAdmin && sender === "시스템>관리자") {
        if (msg.startsWith(".권한부여 ")) {
            var target = msg.replace(".권한부여 ", "").trim();
            if (AdminDB.add(target)) replier.reply("✅ [" + target + "]님에게 권한을 부여했습니다.");
            return;
        }
    }

    // 4. 유저 공통 메뉴 및 명령어 (명령어 수정: .보유캐릭터 -> .캐릭터)
    if (msg === ".메뉴" || msg === ".도움말") {
        var menu = "🎮 [ 메인 메뉴 ]\n━━━━━━━━━━━━━━\n";
        menu += "1️⃣ 내 정보 ➔ .정보\n";
        menu += "2️⃣ 캐릭터 ➔ .캐릭터\n"; // 메뉴 문구 및 명령어 수정
        menu += "3️⃣ 일일 보상 ➔ .출석\n";
        menu += "━━━━━━━━━━━━━━";
        replier.reply(menu);
        return;
    }

    if (msg === ".정보") {
        var user = UserDB.get(sender);
        var total = user.win + user.loss;
        var rate = total === 0 ? 0 : ((user.win / total) * 100).toFixed(1);
        replier.reply("👤 [" + user.name + " 정보]\n⭐ Lv." + user.level + " / 💰 " + user.money.toLocaleString() + " G\n📊 전적: " + user.win + "승 " + user.loss + "패 (" + rate + "%)");
        return;
    }

    // 명령어 수정에 따른 처리
    if (msg === ".캐릭터") {
        // 기존의 보유 캐릭터 조회 로직 실행
        replier.reply("⚔️ 보유하신 캐릭터 목록을 불러옵니다... (기능 연결 중)");
        return;
    }

    if (msg === ".출석") {
        var user = UserDB.get(sender);
        user.money += 100;
        UserDB.save(sender, user);
        replier.reply("🎁 출석 보상 100G 지급!\n(현재 자산: " + user.money.toLocaleString() + "G)");
        return;
    }
};

module.exports = Handler;
