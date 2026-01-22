const UserDB = require("./user");
const AdminDB = require("./admin");

const Handler = {};

Handler.process = function(room, msg, sender, isGroupChat, replier) {
    var admins = AdminDB.getAdmins();
    var isAdmin = (admins.indexOf(sender) > -1 || sender === "관리자");
    var isRegistered = java.io.File("sdcard/msgbot/Bots/sub/data/" + sender + ".json").exists();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 🌐 섹션 1: 단체 채팅방 - 가이드 및 중계 ]
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isGroupChat) {
        if (isAdmin && msg.startsWith(".유저체크 ")) {
            var target = msg.replace(".유저체크 ", "").trim();
            if (!java.io.File("sdcard/msgbot/Bots/sub/data/" + target + ".json").exists()) {
                return replier.reply("❌ [" + target + "] 미가입 유저입니다.");
            }
            var tData = UserDB.get(target);
            var status = "🔍 [ 소환사 원격 관측 ]\n" + "━".repeat(12) + "\n" +
                         "👤 대상: " + target + "\n" +
                         "🔗 연동: " + (tData.roomName ? "✅ 완료" : "❌ 미연동") + "\n" +
                         "💰 자산: " + tData.money.toLocaleString() + "G\n" +
                         "⭐ 레벨: Lv." + tData.level + "\n" +
                         "━".repeat(12);
            return replier.reply(status);
        }

        if (msg === ".가입" || msg === ".연동" || msg === ".메뉴" || msg === ".정보") {
            if (isRegistered) {
                var checkUser = UserDB.get(sender);
                if (!checkUser.roomName) {
                    return replier.reply("⚠️ [ 연동 미완료 ]\n" + "━".repeat(12) + "\n데이터는 존재하나 개인톡 연동이 안 되었습니다.\n봇에게 1:1 대화로 [.연동]을 보내주세요!");
                }
                return replier.reply("🔔 [" + sender + "]님은 연동 완료 상태입니다.\n조작은 봇과의 1:1 대화방을 이용해주세요!");
            }
            var guide = "⚔️ [ 소환사의 협곡 입성 ]\n" + "━".repeat(12) + "\n" +
                        "리그 참여를 위해 '봇 계정'과의\n1:1 개인톡 연동이 필수입니다.\n\n" +
                        "✅ [ 연동 방법 ]\n" +
                        "1. 봇 프로필 ➔ 1:1 채팅 시작\n" +
                        "2. 채팅방에 [.연동] 입력\n" +
                        "━".repeat(12) + "\n" +
                        "⚠️ 연동 시 자동으로 가입 처리됩니다.";
            return replier.reply(guide);
        }
        return; // 이 return은 함수 내부이므로 정상입니다.
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 📱 섹션 2: 개인 채팅방 - 조작 ]
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!isGroupChat) {
        if (msg === ".연동") {
            if (isRegistered) {
                var user = UserDB.get(sender);
                user.roomName = room;
                UserDB.save(sender, user);
                return replier.reply("✅ 이미 연동되었습니다.\n[.메뉴]를 입력하여 시작하세요.");
            }
            var newUser = UserDB.get(sender); 
            newUser.roomName = room;
            UserDB.save(sender, newUser);
            return replier.reply("🎊 [ 가입 및 연동 성공 ]\n" + sender + "님 환영합니다!\n👉 [.메뉴]를 입력하세요!");
        }

        if (!isRegistered) return replier.reply("⚠️ [.연동]을 입력하여 가입을 먼저 해주세요.");

        var user = UserDB.get(sender);

        if (msg === ".메뉴" || msg === ".돌아가기") {
            var menu = "🎮 [ 메인 메뉴 ]\n" + "━".repeat(12) + "\n" +
                       "1️⃣ .정보   (소환사 정보)\n" +
                       "2️⃣ .캐릭터 (보유 챔피언)\n" +
                       "3️⃣ .출석   (매일 보상)\n" +
                       (isAdmin ? "🛠️ .관리자명령어\n" : "") +
                       "━".repeat(12) + "\n" +
                       "🔙 모든 조작은 여기서만 가능합니다.";
            return replier.reply(menu);
        }

        if (msg === ".정보") {
            var expP = Math.floor((user.exp / user.maxExp) * 100);
            var bar = "■".repeat(Math.floor(expP/10)) + "□".repeat(10-Math.floor(expP/10));
            var info = "📜 [ " + sender + " 정보 ]\n" + "━".repeat(12) + "\n👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n⭐ Lv." + user.level + "\n📊 EXP: [" + bar + "]\n💰 골드: " + user.money.toLocaleString() + "G\n━".repeat(12) + "\n🔙 돌아가기 ➔ [.메뉴]";
            return replier.reply(info);
        }

        if (msg === ".출석") {
            var today = new Date().toLocaleDateString();
            if (user.lastAttendance === today) return replier.reply("🔔 이미 오늘 보상을 받았습니다.");
            user.money += 100; user.exp += 50; user.lastAttendance = today;
            UserDB.save(sender, user);
            return replier.reply("🎁 [ 매일 출석 완료 ]\n보상: 100G / 50EXP 획득!\n━".repeat(12) + "\n🔙 돌아가기 ➔ [.메뉴]");
        }

        if (msg === ".캐릭터") {
            return replier.reply("⚔️ [ 캐릭터 ]\n" + "━".repeat(12) + "\n보유 중인 캐릭터 목록을 불러오는 중...\n(기능 구현 중)\n" + "━".repeat(12) + "\n🔙 돌아가기 ➔ [.메뉴]");
        }

        // [ 관리자 상세 기능 ]
        if (isAdmin) {
            if (msg === ".관리자명령어") {
                return replier.reply("🛠️ [ 관리자 도구 ]\n.백업 / .복구 확인 / .초기화 [이름] / .닉네임변경 [A]>[B]");
            }
            // 필요한 경우 여기에 백업/복구 상세 로직을 다시 추가하세요.
        }
    }
}; // Handler.process 함수 종료 지점

module.exports = Handler;

module.exports = Handler;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // [ 🛠️ 섹션 3: 관리자 전용 제어 - 상세 로직 ]
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (isAdmin) {
            if (msg === ".관리자명령어") {
                var adm = "🛠️ [ 관리자 시스템 ]\n" + "━".repeat(12) + "\n" +
                          "• 권한: .관리자추가 / .관리자제거\n" +
                          "• 데이터: .백업 / .복구 확인\n" +
                          "• 유저: .닉네임변경 / .초기화\n" +
                          "━".repeat(12) + "\n" +
                          "🔙 돌아가기 ➔ [.메뉴]";
                return replier.reply(adm);
            }

            if (msg.startsWith(".관리자추가 ")) {
                var target = msg.replace(".관리자추가 ", "").trim();
                if (AdminDB.add(target)) replier.reply("✅ [" + target + "] 님을 관리자로 임명했습니다.");
                else replier.reply("❌ 실패: 데이터가 없거나 이미 관리자입니다.");
                return;
            }

            if (msg.startsWith(".관리자제거 ")) {
                var target = msg.replace(".관리자제거 ", "").trim();
                if (AdminDB.remove(target)) replier.reply("✅ [" + target + "] 님을 관리자에서 해제했습니다.");
                else replier.reply("❌ 실패: 목록에 없거나 마스터 계정입니다.");
                return;
            }

            if (msg === ".백업") {
                try {
                    var src = new java.io.File("sdcard/msgbot/Bots/sub/data/");
                    var bak = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                    if (!bak.exists()) bak.mkdirs();
                    var files = src.listFiles();
                    for (var i = 0; i < files.length; i++) {
                        if (files[i].isFile()) FileStream.write("sdcard/msgbot/Bots/sub/backup/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                    }
                    replier.reply("💾 [백업 완료] 현재 모든 데이터를 안전하게 복사했습니다.");
                } catch (e) { replier.reply("❌ 백업 실패: " + e.message); }
                return;
            }

            if (msg === ".복구 확인") {
                try {
                    var bakDir = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                    var files = bakDir.listFiles();
                    if (!files || files.length === 0) return replier.reply("❌ 실패: 백업된 파일이 없습니다.");
                    for (var i = 0; i < files.length; i++) {
                        FileStream.write("sdcard/msgbot/Bots/sub/data/" + files[i].getName(), FileStream.read(files[i].getAbsolutePath()));
                    }
                    UserDB.clearCache();
                    replier.reply("✅ [복구 완료] 백업 시점의 데이터로 롤백되었습니다.");
                } catch (e) { replier.reply("❌ 복구 실패: " + e.message); }
                return;
            }

            if (msg.startsWith(".닉네임변경 ")) {
                try {
                    var parts = msg.replace(".닉네임변경 ", "").split(">");
                    var oldN = parts[0].trim(), newN = parts[1].trim();
                    var oldFile = "sdcard/msgbot/Bots/sub/data/" + oldN + ".json";
                    if (!java.io.File(oldFile).exists()) return replier.reply("❌ 실패: " + oldN + " 유저가 없습니다.");
                    FileStream.write("sdcard/msgbot/Bots/sub/data/" + newN + ".json", FileStream.read(oldFile));
                    replier.reply("🔄 [이전 완료] " + oldN + " ➔ " + newN);
                } catch (e) { replier.reply("❌ 이전 실패: " + e.message); }
                return;
            }

            if (msg.startsWith(".초기화 ")) {
                var target = msg.replace(".초기화 ", "").trim();
                UserDB.save(target, { name: target, level: 1, exp: 0, maxExp: 100, money: 1000, win: 0, loss: 0, roomName: "", lastAttendance: "" });
                return replier.reply("⚠️ [" + target + "] 데이터 강제 초기화 완료.");
            }
        }
    }
};

module.exports = Handler;
