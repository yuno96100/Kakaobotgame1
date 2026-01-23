const UserDB = require("./user");
const AdminDB = require("./admin");

// [필독] 핸들러 객체 정의 (이 부분이 없으면 'Handler is not defined' 에러 발생)
const Handler = {};

// [설정] 시스템(서브폰) 프로필 링크 또는 오픈채팅 링크
const PRIVATE_CHAT_LINK = "https://open.kakao.com/o/sXXXXXX"; 

Handler.process = function(msg, sender, replier, room) {
    if (!msg) return; // 빈 메시지 방어

    // [1] 기본 권한 및 상태 확인
    var admins = AdminDB.getAdmins() || [];
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();
    
    // [2] 채팅방 구분 (room 이름이 sender와 같으면 개인톡)
    var isPrivate = (room === sender);

    // ────────────────────────────────────────────────────────────────
    // [ CASE A ] 단체방(중계방) 로직
    // ────────────────────────────────────────────────────────────────
    if (!isPrivate) {
        // [A-1] 관리자 전용 명령어 (단체방에서만 작동)
        if (isAdmin) {
            if (msg === ".관리자명령어") {
                var adm = "🛠️ [ 관리자 시스템 - 단체방 ]\n━━━━━━━━━━━━━━\n• .관리자추가 [이름]\n• .관리자제거 [이름]\n• .백업 (데이터 보존)\n• .초기화 [이름]\n━━━━━━━━━━━━━━";
                replier.reply(room, adm);
                return;
            }
            
            if (msg.indexOf(".관리자추가 ") === 0) {
                var t = msg.replace(".관리자추가 ", "").trim();
                if (AdminDB.add(t)) replier.reply(room, "✅ " + t + " 소환사를 관리자로 임명했습니다.");
                return;
            }

            if (msg.indexOf(".초기화 ") === 0) {
                var t = msg.replace(".초기화 ", "").trim();
                UserDB.save(t, { name: t, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" });
                replier.reply(room, "⚠️ [" + t + "] 소환사 데이터 초기화 완료.");
                return;
            }
        }

        // [A-2] 일반 유저 안내 (가입/메뉴 시도 시 개인톡 유도)
        if (msg === ".가입" || msg === ".메뉴" || msg === ".시작") {
            replier.reply(room, "📢 [" + sender + "] 소환사님!\n리그 가입 및 상세 조작은\n**시스템과의 개인톡**에서 가능합니다.\n\n🔗 개인톡 바로가기:\n" + PRIVATE_CHAT_LINK);
            return;
        }
        return; // 단체방 로직 종료
    }

    // ────────────────────────────────────────────────────────────────
    // [ CASE B ] 개인톡(시스템) 로직 - 유저 전용 조작
    // ────────────────────────────────────────────────────────────────
    
    // [B-1] 미가입자 가입 처리
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender); // 데이터 생성 및 저장
            replier.reply("🎊 [ 가입 성공 ]\n" + sender + "님 환영합니다!\n이제 이곳에서 자유롭게 조작하세요.\n\n📜 '.메뉴'를 입력하세요.");
            return;
        }
        if (msg.startsWith(".")) {
            replier.reply("⚔️ 소환사의 협곡 개인 컨트롤러입니다.\n👉 참여를 위해 [.가입]을 입력하세요!");
        }
        return;
    }

    // [B-2] 가입 유저 데이터 로드
    var user = UserDB.get(sender);
    if (!user) return;

    // [B-3] 개인톡 명령어 세트
    if (msg === ".메뉴" || msg === ".돌아가기") {
        var menu = "🎮 [ 개인 컨트롤러 ]\n━━━━━━━━━━━━━━\n1️⃣ 소환사 정보 (.정보)\n2️⃣ 캐릭터 확인 (.캐릭터)\n3️⃣ 매일 출석 (.출석)\n━━━━━━━━━━━━━━\n💡 중계방 알림은 주요 소식만 전송됩니다.";
        replier.reply(menu);
        return;
    }

    if (msg === ".정보" || msg === "1") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        replier.reply("📜 [ 정보 ]\n👤: " + user.name + "\n⭐: Lv." + user.level + "\n📊: [" + bar + "] " + expP + "%\n💰: " + user.money.toLocaleString() + "G\n⚔️: " + user.win + "승 " + user.loss + "패");
        return;
    }

    if (msg === ".출석" || msg === "3") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) return replier.reply("🔔 오늘 출석을 이미 완료했습니다.");
        
        user.money += 100; user.exp += 50; user.lastAttendance = today;
        var up = UserDB.checkLevelUp(user);
        UserDB.save(sender, user);
        
        replier.reply("🎁 출석 완료! +100G / +50EXP" + (up ? "\n🎊 레벨업! Lv." + user.level : ""));
        return;
    }

    if (msg === ".캐릭터" || msg === "2") {
        replier.reply("⚔️ [ 보유 캐릭터 ]\n" + (user.ownedChars ? user.ownedChars.join(", ") : "101"));
        return;
    }
};

// [필독] 모듈 외부로 노출 (이 부분이 없으면 메인에서 호출 불가능)
module.exports = Handler;
