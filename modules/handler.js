const UserDB = require("./user");
const AdminDB = require("./admin");

const Handler = {};

// [중요] 반드시 5개의 인자(room, msg, sender, isGroupChat, replier)를 순서대로 받아야 합니다.
Handler.process = function(room, msg, sender, isGroupChat, replier) {
    var admins = AdminDB.getAdmins();
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 🌐 섹션 1: 단체 채팅방 로직 ]
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isGroupChat) {
        // 1. 관리자 전용: 유저 상태 원격 조회
        if (isAdmin && msg.startsWith(".유저체크 ")) {
            var target = msg.replace(".유저체크 ", "").trim();
            if (!java.io.File("sdcard/msgbot/Bots/sub/data/" + target + ".json").exists()) {
                replier.reply("❌ [" + target + "] 미가입 유저입니다.");
            } else {
                var tData = UserDB.get(target);
                replier.reply("🔍 [ 소환사 원격 관측 ]\n" + "━".repeat(12) + "\n👤 대상: " + target + "\n🔗 연동: " + (tData.roomName ? "✅ 완료" : "❌ 미연동") + "\n💰 자산: " + tData.money.toLocaleString() + "G\n⭐ Lv." + tData.level + "\n" + "━".repeat(12));
            }
        } 
        // 2. 공통 가이드
        else if (msg === ".가입" || msg === ".연동" || msg === ".메뉴" || msg === ".정보") {
            if (isRegistered) {
                var checkUser = UserDB.get(sender);
                if (!checkUser.roomName) {
                    replier.reply("⚠️ [ 연동 미완료 ]\n" + "━".repeat(12) + "\n데이터는 존재하나 개인톡 연동이 안 되었습니다.\n봇에게 1:1 대화로 [.연동]을 보내주세요!");
                } else {
                    replier.reply("🔔 [" + sender + "]님은 이미 등록되었습니다.\n모든 조작은 봇과의 1:1 대화방을 이용해주세요!");
                }
            } else {
                replier.reply("⚔️ [ 소환사의 협곡 입성 ]\n" + "━".repeat(12) + "\n리그 참여를 위해 '봇 계정'과의\n1:1 개인톡 연동이 필수입니다.\n\n✅ [ 연동 방법 ]\n1. 봇 프로필 ➔ 1:1 채팅 시작\n2. 채팅방에 [.연동] 입력\n" + "━".repeat(12) + "\n⚠️ 연동 시 자동으로 가입 처리됩니다.");
            }
        }
    } 

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 📱 섹션 2: 개인 채팅방 로직 ]
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else {
        // A. 연동 처리 (가장 최상단)
        if (msg === ".연동") {
            var user = UserDB.get(sender); 
            user.roomName = room; // 현재 방 이름을 연동방으로 저장
            UserDB.save(sender, user);
            replier.reply("🎊 [ 연동 및 가입 성공 ]\n" + "━".repeat(12) + "\n" + sender + " 소환사님 환영합니다!\n\n👉 바로 시작하기 ➔ [.메뉴]");
        } 
        // B. 미가입자 차단
        else if (!isRegistered) {
            replier.reply("⚠️ 연동되지 않은 소환사입니다.\n이곳에 [.연동]을 입력하여 가입을 완료해주세요.");
        } 
        // C. 가입자 전용 메뉴
        else {
            var user = UserDB.get(sender);

            // 1. 공통 메뉴
            if (msg === ".메뉴" || msg === ".돌아가기") {
                var menu = "🎮 [ 메인 메뉴 ]\n" + "━".repeat(12) + "\n1️⃣ .정보   (소환사 정보)\n2️⃣ .캐릭터 (보유 유닛)\n3️⃣ .출석   (매일 보상)\n" + (isAdmin ? "🛠️ .관리자명령어\n" : "") + "━".repeat(12) + "\n🔙 모든 조작은 여기서만 가능합니다.";
                replier.reply(menu);
            } 
            // 2. 정보 보기
            else if (msg === ".정보") {
                var expP = Math.floor((user.exp / user.maxExp) * 100);
                var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
                replier.reply("📜 [ " + sender + " 정보 ]\n" + "━".repeat(12) + "\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n" + "━".repeat(12) + "\n🔙 돌아가기 ➔ [.메뉴]");
            } 
            // 3. 출석 체크 (매일)
            else if (msg === ".출석") {
                var today = new Date().toLocaleDateString();
                if (user.lastAttendance === today) {
                    replier.reply("🔔 [ 출석 알림 ]\n이미 오늘의 보상을 받으셨습니다.");
                } else {
                    user.money += 100; user.exp += 50; user.lastAttendance = today;
                    var up = UserDB.checkLevelUp(user);
                    UserDB.save(sender, user);
                    replier.reply("🎁 [ 매일 출석 완료 ]\n" + "━".repeat(12) + "\n💰 보상 골드: +100G\n📈 보상 경험치: +50EXP\n" + (up ? "🎊 레벨업 성공! ➔ Lv." + user.level + "\n" : "") + "━".repeat(12) + "\n🔙 돌아가기 ➔ [.메뉴]");
                }
            } 
            // 4. 캐릭터 확인
            else if (msg === ".캐릭터") {
                replier.reply("⚔️ [ 캐릭터 목록 ]\n" + "━".repeat(12) + "\n보유 중인 캐릭터를 불러오는 중입니다...\n(추후 업데이트 예정)\n" + "━".repeat(12) + "\n🔙 돌아가기 ➔ [.메뉴]");
            } 

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // [ 🛠️ 섹션 3: 관리자 전용 제어 ]
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            else if (isAdmin) {
                if (msg === ".관리자명령어") {
                    replier.reply("🛠️ [ 관리자 시스템 ]\n" + "━".repeat(12) + "\n• .관리자추가 [닉네임]\n• .관리자제거 [닉네임]\n• .백업 (데이터 보존)\n• .복구 확인 (백업 복원)\n• .초기화 [닉네임]\n• .닉네임변경
