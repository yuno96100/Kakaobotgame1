const UserDB = require("./user");
const AdminDB = require("./admin");

// 핸들러 객체 정의
const Handler = {};

// [설정] 시스템(서브폰) 프로필 링크 또는 오픈채팅 링크
const PRIVATE_CHAT_LINK = "https://open.kakao.com/o/s4pX9Nci"; 

Handler.process = function(msg, sender, replier, room) {
    if (!msg || !msg.startsWith(".")) return; 

    // [1] 권한 및 상태 확인
    var admins = AdminDB.getAdmins() || [];
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();
    
    // [2] 채팅방 구분 (room 이름이 sender와 같으면 개인톡)
    var isPrivate = (room === sender || !room || room.trim() === "");

    // ────────────────────────────────────────────────────────────────
    // [ CASE A ] 단체방(중계방) 로직 - 안내 및 관리 전용
    // ────────────────────────────────────────────────────────────────
    if (!isPrivate) {
        // [A-1] 일반 유저 명령어 안내 (반응성 향상을 위해 최상단 배치)
        // 단체방에서 가입, 메뉴, 숫자 등을 입력하면 무조건 개인톡으로 유도
        if (msg === ".가입" || msg === ".메뉴" || msg === ".시작" || msg === "1" || msg === "2" || msg === "3") {
            replier.reply(room, "📢 [" + sender + "] 소환사님!\n\n상세 조작과 **리그 가입**은 아래의\n**시스템 개인톡**에서만 가능합니다!\n\n🔗 개인톡 바로가기:\n" + PRIVATE_CHAT_LINK + "\n\n💬 입장 후 [.가입]을 입력하여 등록해 주세요!");
            return;
        }

        // [A-2] 관리자 전용 명령어 (단체방 전용)
        if (isAdmin) {
            if (msg === ".관리자명령어") {
                var adm = "🛠️ [ 관리자 시스템 - 단체방 ]\n━━━━━━━━━━━━━━\n• .관리자추가 [이름]\n• .관리자제거 [이름]\n• .백업 (데이터 저장)\n• .복구 확인 (최신 백업 로드)\n• .닉네임변경 [기존]>[신규]\n• .초기화 [이름]\n━━━━━━━━━━━━━━";
                replier.reply(room, adm);
                return;
            }
            
            if (msg.indexOf(".관리자추가 ") === 0) {
                var t = msg.replace(".관리자추가 ", "").trim();
                if (AdminDB.add(t)) replier.reply(room, "✅ [" + t + "] 님을 관리자로 임명했습니다.");
                else replier.reply(room, "❌ 유저가 없거나 이미 관리자입니다.");
                return;
            }

            if (msg.indexOf(".관리자제거 ") === 0) {
                var t = msg.replace(".관리자제거 ", "").trim();
                if (AdminDB.remove(t)) replier.reply(room, "✅ [" + t + "] 님의 권한을 해제했습니다.");
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
                    replier.reply(room, "💾 [백업 성공] 모든 데이터가 백업 폴더에 저장되었습니다.");
                } catch (e) { replier.reply(room, "❌ 백업 실패: " + e.message); }
                return;
            }

            if (msg === ".복구 확인") {
                try {
                    var bakDir = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                    var filesB = bakDir.listFiles();
                    if (!filesB || filesB.length === 0) return replier.reply(room, "❌ 복구할 백업 파일이 없습니다.");
                    for (var j = 0; j < filesB.length; j++) {
                        FileStream.write("sdcard/msgbot/Bots/sub/data/" + filesB[j].getName(), FileStream.read(filesB[j].getAbsolutePath()));
                    }
                    UserDB.clearCache();
                    replier.reply(room, "✅ [복구 완료] 최신 백업 데이터로 복원되었습니다.");
                } catch (e) { replier.reply(room, "❌ 복구 실패: " + e.message); }
                return;
            }

            if (msg.startsWith(".닉네임변경 ")) {
                try {
                    var p = msg.replace(".닉네임변경 ", "").split(">");
                    if (p.length < 2) return replier.reply(room, "❌ 형식: .닉네임변경 기존닉>신규닉");
                    var oldN = p[0].trim(), newN = p[1].trim();
                    var oldFile = new java.io.File("sdcard/msgbot/Bots/sub/data/" + oldN + ".json");
                    if (!oldFile.exists()) return replier.reply(room, "❌ [" + oldN + "] 유저가 존재하지 않습니다.");
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + newN + ".json", FileStream.read(oldFile.getAbsolutePath()));
                    oldFile.delete();
                    replier.reply(room, "🔄 [변경 완료] " + oldN + " ➔ " + newN);
                } catch (e) { replier.reply(room, "❌ 변경 에러: " + e.message); }
                return;
            }

            if (msg.indexOf(".초기화 ") === 0) {
                var t = msg.replace(".초기화 ", "").trim();
                UserDB.save(t, { name: t, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" });
                replier.reply(room, "⚠️ [" + t + "] 소환사 데이터를 초기화했습니다.");
                return;
            }
        }
        return; 
    }

    // ────────────────────────────────────────────────────────────────
    // [ CASE B ] 개인톡(시스템) 로직 - 유저 조작 및 게임 진행
    // ────────────────────────────────────────────────────────────────
    
    // [B-1] 가입 프로세스
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender);
            replier.reply("🎊 [ 가입 성공 ]\n" + sender + "님 환영합니다!\n이제 모든 기능을 이곳에서 사용하세요.\n\n📜 '.메뉴'를 입력하세요.");
            return;
        }
        replier.reply("⚔️ 개인 컨트롤러 공간입니다.\n먼저 [.가입]을 입력하여 등록해 주세요!");
        return;
    }

    if (msg === ".가입") {
        replier.reply("🔔 이미 가입된 소환사입니다.\
