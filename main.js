// [main.js]
const BOT_NAME = "sub"; 
const MASTER_HASH = "236652781"; 
const BASE_URL = "https://raw.githubusercontent.com/yuno96100/Kakaobotgame1/refs/heads/main/";
const ROOT_PATH = "/sdcard/msgbot/Bots/" + BOT_NAME + "/";

/**
 * [업데이트 로직] GitHub에서 최신 코드를 받아옵니다.
 */
function updateBot(replier) {
    try {
        var timestamp = "?t=" + new Date().getTime();
        replier.reply("📡 업데이트 동기화 중...");
        
        var vJson = JSON.parse(org.jsoup.Jsoup.connect(BASE_URL + "version.json" + timestamp).ignoreContentType(true).execute().body());

        for (var i = 0; i < vJson.files.length; i++) {
            var fileName = vJson.files[i];
            var code = org.jsoup.Jsoup.connect(BASE_URL + fileName + timestamp).ignoreContentType(true).execute().body();
            
            var localFileName = (fileName === "main.js") ? "script.js" : fileName;
            
            if (fileName.includes("/")) {
                var folderPath = fileName.split("/").slice(0, -1).join("/");
                var folder = new java.io.File(ROOT_PATH + folderPath);
                if (!folder.exists()) folder.mkdirs(); 
            }
            FileStream.write(ROOT_PATH + localFileName, code);
        }

        replier.reply("🚀 v" + vJson.version + " 업데이트 완료! 시스템을 재시작합니다.");
        java.lang.Thread.sleep(1000);
        Api.reload(BOT_NAME);
    } catch (e) {
        replier.reply("❌ 업데이트 실패: " + e.message);
    }
}

/**
 * [메인 응답 함수]
 */
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    const userHash = String(imageDB.getProfileHash()).trim();

    // 1. 관리자 전용 긴급 업데이트 (모듈 에러와 상관없이 작동해야 함)
    if (msg === ".업데이트" && userHash === MASTER_HASH) {
        updateBot(replier);
        return;
    }

    // 2. 핸들러 실행 (함수 꼬임 방지 처리)
    try {
        // 캐시 삭제로 실시간 반영 보장
        delete require.cache[require.resolve("modules/handler")];
        var Handler = require("modules/handler");

        // 함수 존재 여부 확인 후 호출
        if (Handler && typeof Handler.process === "function") {
            Handler.process(room, msg, sender, replier, imageDB, isGroupChat);
        } else {
            if (msg.startsWith(".")) replier.reply("⚠️ 핸들러 함수(process)를 찾을 수 없습니다.");
        }

    } catch (e) {
        // 모듈을 불러오지 못하거나 실행 중 에러가 나면 즉시 출력
        if (msg.startsWith(".")) {
            var errorInfo = "⚠️ 시스템 엔진 오류\n";
            errorInfo += "내용: " + e.message + "\n";
            errorInfo += "위치: " + e.lineNumber + "라인";
            replier.reply(errorInfo);
        }
    }
}
