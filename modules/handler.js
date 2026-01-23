const UserDB = require("./user");
const AdminDB = require("./admin");

// 핸들러 객체 정의
const Handler = {};

// [설정] 시스템(서브폰) 프로필 링크 또는 오픈채팅 링크
const PRIVATE_CHAT_LINK = "https://open.kakao.com/o/s4pX9Nci"; 

Handler.process = function(msg, sender, replier, room) {
    if (!msg || !msg.startsWith(".")) return; // 점(.)으로 시작하는 명령어만 처리

    // [1] 권한 및 상태 확인
    var admins = AdminDB.getAdmins() || [];
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();
    
    /**
     * [2] 채팅방 구분 로직
     * room이 없거나, room 이름이 sender와 같으면 '개인톡'
     * 그 외에는 '단체방'으로 간주합니다.
     */
    var isPrivate = (room === sender || !room || room.trim() === "");

    // ────────────────────────────────────────────────────────────────
    // [ CASE A ] 단체방(중계방) 로직 - 관리 및 안내
    // ────────────────────────────────────────────────────────────────
    if (!isPrivate) {
        // [A-1] 관리자 전용 명령어 (단체방에서만 작동)
        if (isAdmin) {
            if (msg === ".관리자명령어") {
                var adm = "🛠️ [ 관리자 시스템 - 단체방 ]\n━━━━━━━━━━━━━━\n• .관리자추가 [이름]\n• .관리자제거 [이름]\n• .백업 (데이터 보존)\n• .복구 확인 (최신 백업 로드)\n• .닉네임변경 [기존]>[신규]\n• .초기화 [이름]\n━━━━━━━━━━━━━━";
                replier.reply(room, adm);
                return;
            }
            
            if (msg.indexOf(".관리자추가 ") === 0) {
                var t = msg.replace(".관리자추가 ", "").trim();
                if (AdminDB.add(t)) replier.reply(room, "✅ [" + t + "] 소환사를 관리자로 임명했습니다.");
                else replier.reply(room, "❌ 이미 관리자이거나 유저를 찾을 수 없습니다.");
                return;
            }

            if (msg.indexOf(".관리자제거 ") === 0) {
                var t = msg.replace(".관리자제거 ", "").trim();
                if (AdminDB.remove(t)) replier.reply(room, "✅ [" + t + "] 소환사의 권한을 해제했습니다.");
                return;
            }

            if (msg === ".백업") {
                try {
                    var src = new java.io.File("sdcard/msgbot/Bots/sub/data/");
                    var bak = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                    if (!bak.exists()) bak.mkdirs();
                    var files = src.listFiles();
                    for (var i = 0; i < files.length; i++) {
                        if (files[i].isFile()) {
                            FileStream.write("sdcard/msgbot/Bots/sub/backup/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                        }
                    }
                    replier.reply(room, "💾 [백업 성공] 모든 데이터가 backup 폴더에 저장되었습니다.");
                } catch (e) { replier.reply(room, "❌ 백업 실패: " + e.message); }
                return;
            }

            if (msg === ".복구 확인") {
                try {
                    var bakDir = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                    var filesB = bakDir.listFiles();
                    if (!filesB || filesB.length === 0) return replier.reply(room, "❌ 복구할 백업 데이터가 없습니다.");
                    for (var j = 0; j < filesB.length; j++) {
                        FileStream.write("sdcard/msgbot/Bots/sub/data/" + filesB[j].getName(), FileStream.read(filesB[j].getAbsolutePath()));
                    }
                    UserDB.clearCache();
                    replier.reply(room, "✅ [복구 완료] 백업 시점의 데이터로 복원되었습니다.");
                } catch (e) { replier.reply(room, "❌ 복구 실패: " + e.message); }
                return;
            }

            if (msg.startsWith(".닉네임변경 ")) {
                try {
                    var p = msg.replace(".닉네임변경 ", "").split(">");
                    if (p.length < 2) return replier.reply(room, "❌ 형식: .닉네임변경 기존닉>신규닉");
                    var oldN = p[0].trim(), newN = p[1].trim();
                    var oldFile = new java.io.File("sdcard/msgbot/Bots/sub/data/" + oldN + ".json");
                    if (!oldFile.exists()) return replier.reply(room, "❌ [" + oldN + "] 유저를 찾을 수 없습니다.");
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + newN + ".json", FileStream.read(oldFile.getAbsolutePath()));
                    oldFile.delete();
                    replier.reply(room, "🔄 [닉네임 변경] " + oldN + " ➔ " + newN + " 완료.");
                } catch (e) { replier.reply(room, "❌ 변경 실패: " + e.message); }
                return;
            }

            if (msg.indexOf(".초기화 ") === 0) {
                var t = msg.replace(".초기화 ", "").trim();
                UserDB.save(t, { name: t, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" });
                replier.reply(room, "⚠️ [" + t + "] 소환사 데이터가 초기화되었습니다.");
                return;
            }
        }

        // [A-2] 일반 유저 안내 (단체방 응답)
        if (msg === ".가입" || msg === ".메뉴" || msg === ".시작") {
            replier.reply(room, "📢 [" + sender + "] 소환사님!\n리그 가입 및 조작은 **개인톡**에서만 가능합니다.\n\n🔗 개인톡 바로가기:\n" + PRIVATE_CHAT_LINK + "\n\n💬 입장 후 다시 한번 [.가입]을 입력해 주세요!");
            return;
        }
        return; 
    }

    // ────────────────────────────────────────────────────────────────
    // [ CASE B ] 개인톡(시스템) 로직 - 실제 게임 조작
    // ────────────────────────────────────────────────────────────────
    
    // [B-1] 가입 체크
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender);
            replier.reply("🎊 [ 가입 성공 ]\n" + sender + "님 환영합니다!\n이제 이곳에서 모든 조작을 수행할 수 있습니다.\n\n📜 '.메뉴'를 입력하세요.");
            return;
        }
        replier.reply("⚔️ 소환사의 협곡 개인 컨트롤러입니다.\n먼저 [.가입]을 입력하여 등록해 주세요!");
        return;
    }

    var user = UserDB.get(sender);
    if (!user) return;

    // [B-2] 개인톡 명령어 메뉴
    if (msg === ".메뉴" || msg === ".돌아가기") {
        var menu = "🎮 [ 개인 컨트롤러 ]\n━━━━━━━━━━━━━━\n1️⃣ 소환사 정보 (.정보)\n2️⃣ 캐릭터 확인 (.캐릭터)\n3️⃣ 매일 출석 (.출석)\n━━━━━━━━━━━━━━\n🔙 가기: .돌아가기";
        replier.reply(menu);
        return;
    }

    if (msg === ".정보" || msg === "1") {
        var expP = Math.floor((user.exp / user.maxExp) * 100);
        var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
        replier.reply("📜 [ 소환사 정보 ]\n━━━━━━━━━━━━━━\n👤 닉네임: " + user.name + "\n⭐ 레벨: Lv." + user.level + "\n📊 EXP: [" + bar + "] " + expP + "%\n💰 골드: " + user.money.toLocaleString() + "G\n⚔️ 전적: " + user.win + "승 " + user.loss + "패\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    if (msg === ".캐릭터" || msg === "2") {
        replier.reply("⚔️ [ 보유 캐릭터 ]\n━━━━━━━━━━━━━━\n보유 리스트: " + (user.ownedChars ? user.ownedChars.join(", ") : "101") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    if (msg === ".출석" || msg === "3") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) return replier.reply("🔔 오늘 이미 출석 보상을 받으셨습니다.");
        
        user.money += 100; user.exp += 50; user.lastAttendance = today;
        var up = UserDB.checkLevelUp(user);
        UserDB.save(sender, user);
        
        replier.reply("🎁 [ 출석 완료 ]\n보상: 100G / 50EXP 획득!" + (up ? "\n🎊 레벨업 축하드립니다! Lv." + user.level : "") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }
};

module.exports = Handler;
