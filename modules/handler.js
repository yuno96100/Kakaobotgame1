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
        // 1. 관리자 전용: 유저 상태 원격 조회 (연동 여부와 무관하게 작동)
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

        // 2. 가입/연동/메뉴 가이드
        if (msg === ".가입" || msg === ".연동" || msg === ".메뉴" || msg === ".정보") {
            // [CASE A] 이미 가입(파일 존재)된 경우
            if (isRegistered) {
                var checkUser = UserDB.get(sender);
                // 가입은 됐는데 개인톡 연동(roomName)이 없는 경우 (관리자 포함)
                if (!checkUser.roomName) {
                    var linkGuide = "⚠️ [ 연동 미완료 안내 ]\n" + "━".repeat(12) + "\n" +
                                    (isAdmin ? "관리자님, " : sender + "님, ") + "데이터는 존재하나\n개인톡 방이 등록되지 않았습니다.\n\n" +
                                    "👉 **해결 방법:**\n" +
                                    "서브폰(봇)에게 1:1 대화를 걸어\n**[.연동]**을 반드시 입력해주세요!\n" +
                                    "━".repeat(12);
                    return replier.reply(linkGuide);
                }
                // 가입도 됐고 연동도 이미 완료된 경우
                return replier.reply("🔔 [" + sender + "]님은 연동이 완료된 상태입니다.\n모든 조작은 봇과의 1:1 대화방을 이용해주세요!");
            }

            // [CASE B] 아예 미가입 상태인 경우
            var newGuide = "⚔️ [ 소환사의 협곡 입성 ]\n" + "━".repeat(12) + "\n" +
                           "리그 참여를 위해 '봇 계정'과의\n1:1 개인톡 연동이 필수입니다.\n\n" +
                           "✅ [ 연동 방법 ]\n" +
                           "1. 봇 프로필 ➔ 1:1 채팅 시작\n" +
                           "2. 채팅방에 [.연동] 입력\n" +
                           "━".repeat(12) + "\n" +
                           "⚠️ 연동 시 자동으로 가입 처리됩니다.";
            return replier.reply(newGuide);
        }
        return; 
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // [ 📱 섹션 2: 개인 채팅방 - 대시보드 및 조작 ]
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!isGroupChat) {
        if (msg === ".연동") {
            if (isRegistered) {
                var user = UserDB.get(sender);
                user.roomName = room;
                UserDB.save(sender, user);
                return replier.reply("✅ 이미 연동된 계정입니다.\n[.메뉴]를 입력하여 시작하세요.");
            }
            var newUser = UserDB.get(sender); 
            newUser.roomName = room;
            UserDB.save(sender, newUser);
            return replier.reply("🎊 [ 가입 및 연동 성공 ]\n" + "━".repeat(12) + "\n" +
                                 sender + " 소환사님 환영합니다!\n\n" +
                                 "이제부터 이곳은 당신의\n'개인 전용 관리실'입니다.\n\n" +
                                 "👉 바로 시작하기 ➔ [.메뉴]");
        }

        if (!isRegistered) return replier.reply("⚠️ 연동되지 않은 소환사입니다.\n[.연동]을 입력하여 가입을 먼저 해주세요.");

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
            var info = "📜 [ " + sender + " 상세 정보 ]\n" + "━".repeat(12) + "\n" +
                       "👤 닉네임: " + user.name + (isAdmin ? " (관리자)" : "") + "\n" +
                       "⭐ 레벨: Lv." + user.level + "\n" +
                       "📊 경험치: [" + bar + "] " + expP + "%\n" +
                       "💰 골드: " + user.money.toLocaleString() + "G\n" +
                       "⚔️ 전적: " + user.win + "승 " + user.loss + "패\n" +
                       "━".repeat(12) + "\n" +
                       "🔙 돌아가기 ➔ [.메뉴]";
            return replier.reply(info);
        }

        if (msg === ".출석") {
            var today = new Date().toLocaleDateString();
            if (user.lastAttendance === today) return replier.reply("🔔 [ 출석 알림 ]\n이미 오늘의 보상을 받으셨습니다.");
            user.money += 100; user.exp += 50; user.lastAttendance = today;
            var up = UserDB.checkLevelUp(user);
            UserDB.save(sender, user);
            return replier.reply("🎁 [ 매일 출석 완료 ]\n" + "━".repeat(12) + "\n" +
                                 "💰 보상 골드: +100G\n" +
                                 "📈 보상 경험치: +50EXP\n" +
                                 (up ? "🎊 레벨업 성공! ➔ Lv." + user.level + "\n" : "") +
                                 "━".repeat(12) + "\n" +
                                 "🔙 돌아가기 ➔ [.메뉴]");
        }

        if (msg === ".캐릭터") {
            replier.reply("⚔️ [ 캐릭터 ]\n" + "━".repeat(12) + "\n보유 중인 캐릭터 목록을 불러오고 있습니다...\n(현재 개발 중인 기능입니다)\n" + "━".repeat(12) + "\n🔙 돌아가기 ➔ [.메뉴]");
            return;
        }

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
