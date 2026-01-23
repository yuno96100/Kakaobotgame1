const UserDB = require("./user");
const AdminDB = require("./admin");

// [설정] 시스템(서브폰) 프로필 링크 또는 오픈채팅 링크
const PRIVATE_CHAT_LINK = "https://open.kakao.com/o/s4pX9Nci"; 

Handler.process = function(msg, sender, replier, room) {
    if (!msg) return;

    var admins = AdminDB.getAdmins() || [];
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();
    
    // [체크] 개인톡 여부 (room 이름이 sender와 같으면 개인톡)
    var isPrivate = (room === sender);

    // ────────────────────────────────────────────────────────────────
    // [ 1. 단체방(중계방) 로직 ] - 관리 및 안내 전용
    // ────────────────────────────────────────────────────────────────
    if (!isPrivate) {
        // [관리자 전용 명령어]
        if (isAdmin) {
            if (msg === ".관리자명령어") {
                var adm = "🛠️ [ 관리자 시스템 - 단체방 ]\n━━━━━━━━━━━━━━\n• .관리자추가 [이름]\n• .관리자제거 [이름]\n• .백업 (데이터 보존)\n• .복구 확인 (최신 백업 로드)\n• .닉네임변경 [기존]>[신규]\n• .초기화 [이름]\n━━━━━━━━━━━━━━";
                replier.reply(room, adm);
                return;
            }
            
            if (msg.indexOf(".관리자추가 ") === 0) {
                var t = msg.replace(".관리자추가 ", "").trim();
                if (AdminDB.add(t)) replier.reply(room, "✅ " + t + " 소환사를 관리자로 임명했습니다.");
                else replier.reply(room, "❌ 임명 실패: 유저가 없거나 이미 관리자입니다.");
                return;
            }

            if (msg.indexOf(".관리자제거 ") === 0) {
                var t = msg.replace(".관리자제거 ", "").trim();
                if (AdminDB.remove(t)) replier.reply(room, "✅ " + t + " 소환사의 관리자 권한을 해제했습니다.");
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
                    replier.reply(room, "💾 [백업 완료] 모든 소환사 데이터가 안전하게 보관되었습니다.");
                } catch (e) { replier.reply(room, "❌ 백업 중 에러 발생: " + e.message); }
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
                    replier.reply(room, "✅ [복구 완료] 백업 시점의 데이터로 동기화되었습니다.");
                } catch (e) { replier.reply(room, "❌ 복구 중 에러 발생: " + e.message); }
                return;
            }

            if (msg.startsWith(".닉네임변경 ")) {
                try {
                    var p = msg.replace(".닉네임변경 ", "").split(">");
                    if (p.length < 2) return replier.reply(room, "❌ 형식 오류: .닉네임변경 기존>신규");
                    var oldN = p[0].trim(), newN = p[1].trim();
                    var oldFile = new java.io.File("sdcard/msgbot/Bots/sub/data/" + oldN + ".json");
                    if (!oldFile.exists()) return replier.reply(room, "❌ 대상 유저가 존재하지 않습니다.");
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + newN + ".json", FileStream.read(oldFile.getAbsolutePath()));
                    oldFile.delete(); // 이전 파일 삭제
                    replier.reply(room, "🔄 [이전 완료] " + oldN + " 소환사의 데이터가 " + newN + "(으)로 이동되었습니다.");
                } catch (e) { replier.reply(room, "❌ 변경 에러: " + e.message); }
                return;
            }

            if (msg.indexOf(".초기화 ") === 0) {
                var t = msg.replace(".초기화 ", "").trim();
                UserDB.save(t, { name: t, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, ownedChars: [101], lastAttendance: "" });
                replier.reply(room, "⚠️ [" + t + "] 소환사의 데이터를 초기화했습니다.");
                return;
            }
        }

        // [일반 유저 안내]
        if (msg === ".메뉴" || msg === ".시작" || msg === "1" || msg === "2" || msg === "3") {
            replier.reply(room, "📢 [" + sender + "] 소환사님!\n상세 조작은 **시스템과의 개인톡**에서 가능합니다.\n\n🔗 개인톡 바로가기:\n" + PRIVATE_CHAT_LINK);
            return;
        }
        return; 
    }

    // ────────────────────────────────────────────────────────────────
    // [ 2. 개인톡(시스템) 로직 ] - 유저 조작 전용
    // ────────────────────────────────────────────────────────────────
    
    // 가입 체크
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender);
            replier.reply("🎊 [ 가입 성공 ]\n" + sender + "님 환영합니다!\n\n📜 '.메뉴'를 입력하여 협곡 탐험을 시작하세요.");
            return;
        }
        if (msg.startsWith(".")) {
            replier.reply("⚔️ 개인 컨트롤러 공간입니다.\n👉 참여를 위해 [.가입]을 먼저 입력하세요!");
        }
        return;
    }

    var user = UserDB.get(sender);
    if (!user) return;

    // 개인톡 명령어 처리
    if (msg === ".메뉴" || msg === ".돌아가기") {
        var menu = "🎮 [ 개인 컨트롤러 ]\n━━━━━━━━━━━━━━\n1️⃣ 소환사 정보 (.정보)\n2️⃣ 캐릭터 확인 (.캐릭터)\n3️⃣ 매일 출석 (.출석)\n━━━━━━━━━━━━━━\n💡 중계방 알림은 최소화되어 전송됩니다.";
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
        replier.reply("⚔️ [ 보유 캐릭터 ]\n━━━━━━━━━━━━━━\n보유: " + (user.ownedChars ? user.ownedChars.join(", ") : "101") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }

    if (msg === ".출석" || msg === "3") {
        var today = new Date().toLocaleDateString();
        if (user.lastAttendance === today) return replier.reply("🔔 [ 알림 ]\n오늘의 보상을 이미 받으셨습니다.");
        
        user.money += 100; user.exp += 50; user.lastAttendance = today;
        var up = UserDB.checkLevelUp(user);
        UserDB.save(sender, user);
        
        replier.reply("🎁 [ 출석 완료 ]\n+100G / +50EXP 획득!" + (up ? "\n🎊 레벨업! Lv." + user.level : "") + "\n━━━━━━━━━━━━━━\n🔙 [.메뉴]");
        return;
    }
};

module.exports = Handler;
