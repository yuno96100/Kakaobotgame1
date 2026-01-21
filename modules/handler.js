const UserDB = require("./user");
const AdminDB = require("./admin");
const Champions = require("./champions");

const Handler = {};

Handler.process = function(msg, sender, replier) {
    
    // ------ [ 1. 데이터 및 권한 확인 섹션 ] ------
    var admins = AdminDB.getAdmins();
    var isMaster = (sender === "관리자");
    var isAdmin = (admins.indexOf(sender) > -1 || isMaster);

    var path = "sdcard/msgbot/Bots/sub/data/" + sender + ".json";
    var isRegistered = java.io.File(path).exists();


    // ------ [ 2. 가입 처리 섹션 ] ------
    if (!isRegistered) {
        if (msg === ".가입") {
            UserDB.get(sender); 
            var success = "🎊 [ 소환사 등록 성공 ]\n";
            success += "━━━━━━━━━━━━━━\n";
            success += sender + "님, 소환사의 리그에 합류하신 것을 환영합니다!\n\n";
            success += "📜 '.메뉴'를 입력하여 모험을 시작하세요.";
            replier.reply(success);
            return;
        }

        var guide = "⚔️ [ 소환사의 협곡에 오신것을 환영합니다 ]\n";
        guide += "━━━━━━━━━━━━━━\n";
        guide += "아직 등록되지 않은 소환사입니다.\n";
        guide += "이곳은 매일 결투가 진행되는 소환사의 리그입니다.\n\n";
        guide += "👉 참여를 위해 [.가입]을 입력해주세요!";
        replier.reply(guide);
        return;
    }

    // 가입된 유저의 데이터 로드
    var user = UserDB.get(sender);


    // ------ [ 3. 시스템 및 도움말 섹션 ] ------
    // '돌아가기' 입력 시에도 메인메뉴 출력
    if (msg === ".메뉴" || msg === ".돌아가기" || msg === "돌아가기") {
        var menu = "🎮 [ 메인 메뉴 ]\n";
        menu += "━━━━━━━━━━━━━━\n";
        menu += "1️⃣ 내 정보 확인 ➔ .정보\n";
        menu += "2️⃣ 캐릭터 인벤토리 ➔ .캐릭터\n";
        menu += "3️⃣ 일일 출석 보상 ➔ .출석\n";
        menu += "━━━━━━━━━━━━━━\n";
        menu += "💡 상세 도움말은 [.도움말] 입력";
        replier.reply(menu);
        return;
    }

    if (msg === ".도움말") {
        var help = "📜 [ 전체 도움말 안내 ]\n";
        help += "━━━━━━━━━━━━━━\n";
        help += "👤 [.정보] - 나의 레벨, 전적, 자산 확인\n";
        help += "⚔️ [.캐릭터] - 내가 보유한 캐릭터 목록\n";
        help += "🎁 [.출석] - 매일 100G와 경험치 획득\n";
        help += "🔙 [.돌아가기] - 메인 메뉴로 이동\n";
        help += "━━━━━━━━━━━━━━\n";
        if (isAdmin) {
            help += "🛠️ [ 관리자 명령어 ]\n";
            help += "• .업데이트 - 최신 코드 동기화\n";
            help += "• .전체초기화 확인 - 모든 유저 데이터 삭제\n";
            help += "━━━━━━━━━━━━━━";
        }
        replier.reply(help);
        return;
    }


    // ------ [ 4. 유저 정보 및 인벤토리 섹션 ] ------
    if (msg === ".정보") {
        var total = user.win + user.loss;
        var rate = total === 0 ? 0 : ((user.win / total) * 100).toFixed(1);
        
        var maxExp = user.maxExp || 100;
        var currentExp = user.exp || 0;
        var expPercent = Math.floor((currentExp / maxExp) * 100);
        var barCount = Math.floor(expPercent / 10);
        var expBar = "■".repeat(barCount) + "□".repeat(10 - barCount);
        
        var info = "📜 [ 소환사 정보 ]\n";
        info += "━━━━━━━━━━━━━━\n";
        info += "👤 닉네임: " + user.name + "\n";
        if (isAdmin) info += "🎖️ 권한: 관리자\n";
        info += "⭐ 레벨: Lv." + user.level + "\n";
        info += "📊 경험치: [" + expBar + "] " + expPercent + "%\n";
        info += "💰 보유 골드: " + user.money.toLocaleString() + " G\n";
        info += "⚔️ 전적: " + user.win + "승 " + user.loss + "패 (" + rate + "%)\n";
        info += "━━━━━━━━━━━━━━\n";
        info += "🔙 메인 메뉴로 가려면 [.돌아가기]";
        
        replier.reply(info);
        return;
    }

    if (msg === ".캐릭터") {
        var charMsg = "⚔️ " + user.name + "님의 캐릭터 인벤토리\n";
        charMsg += "━━━━━━━━━━━━━━\n";
        charMsg += "(보유 캐릭터 목록 표시 준비중)\n";
        charMsg += "━━━━━━━━━━━━━━\n";
        charMsg += "🔙 메인 메뉴로 가려면 [.돌아가기]";
        replier.reply(charMsg);
        return;
    }


    // ------ [ 5. 일일 보상 및 이벤트 섹션 ] ------
    if (msg === ".출석") {
        user.money += 100;
        user.exp += 20; 
        UserDB.save(sender, user);
        
        var attMsg = "🎁 매일 출석 보상 완료!\n💰 +100G / ✨ +20 EXP\n";
        attMsg += "━━━━━━━━━━━━━━\n";
        attMsg += "🔙 메인 메뉴로 가려면 [.돌아가기]";
        replier.reply(attMsg);
        return;
    }



    // ------ [ 6. 관리자 전용 명령어 섹션 ] ------
    if (isAdmin && isMaster) {

        // [백업 데이터 목록 확인] 명령어: .백업목록
        if (msg === ".백업목록") {
            try {
                var backupFolder = new java.io.File("sdcard/msgbot/Bots/sub/backup/");
                if (!backupFolder.exists() || backupFolder.listFiles().length === 0) {
                    replier.reply("📂 [백업 현황]\n━━━━━━━━━━━━━━\n저장된 백업 데이터가 없습니다.");
                    return;
                }

                var files = backupFolder.listFiles();
                var list = [];
                var lastTime = 0;

                for (var i = 0; i < files.length; i++) {
                    if (files[i].isFile() && files[i].getName().endsWith(".json")) {
                        // 관리자 파일 제외하고 유저 이름만 추출
                        if (files[i].getName() !== "admins.json") {
                            list.push(files[i].getName().replace(".json", ""));
                        }
                        // 가장 최근 수정 시간 파악
                        if (files[i].lastModified() > lastTime) lastTime = files[i].lastModified();
                    }
                }

                var date = new Date(lastTime);
                var timeStr = (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();

                var res = "📂 [ 백업 데이터 확인 ]\n";
                res += "━━━━━━━━━━━━━━\n";
                res += "⏰ 최근 백업: " + timeStr + "\n";
                res += "👤 대상: " + list.length + "명의 소환사\n";
                res += "📋 명단: " + (list.length > 10 ? list.slice(0, 10).join(", ") + " 외..." : list.join(", ")) + "\n";
                res += "━━━━━━━━━━━━━━\n";
                res += "💡 복구하려면 [.복구 확인] 입력";
                replier.reply(res);
            } catch (e) {
                replier.reply("❌ 목록 조회 실패: " + e.message);
            }
            return;
        }

        // ... (이전의 .백업, .복구 확인, .초기화 코드들) ...
    }
