// [메인 폰 전용 script.js]
const MASTER_HASH = "여기에_메인폰_해시값을_입력하세요"; // .내해시 로 확인 후 교체

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    const hash = imageDB.getProfileHash();

    // 관리자 본인이 보낸 메시지인지 확인
    if (hash !== MASTER_HASH) return;

    if (msg === ".업데이트") {
        replier.reply("✅ [시스템] 서버 폰에 업데이트 신호를 송신합니다.");
        // 서브 폰은 이 메시지를 읽고 업데이트 함수를 실행하게 됩니다.
    }

    if (msg === ".내해시") {
        replier.reply("👤 관리자님의 해시값:\n" + hash);
    }
}
