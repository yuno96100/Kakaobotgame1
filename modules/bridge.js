const Bridge = {};

// [설정] 실제 단체톡방(중계방)의 정확한 이름을 여기에 적으세요.
const MAIN_ROOM_NAME = "소환사의 협곡"; 

Bridge.broadcast = function(replier, type, data) {
    var message = "";
    
    switch(type) {
        case "JOIN":
            message = "🎊 [ 신규 소환사 합류 ]\n" + data.name + "님이 협곡에 입장하셨습니다!";
            break;
        case "LEVEL_UP":
            message = "⭐ [ 레벨 업 알림 ]\n" + data.name + "님이 Lv." + data.level + "을 달성했습니다!";
            break;
        case "REWARD":
            message = "🎁 [ 전설적 행보 ]\n" + data.name + "님이 특별 보상을 획득했습니다!";
            break;
    }
    
    if (message) {
        replier.reply(MAIN_ROOM_NAME, message);
    }
};

module.exports = Bridge;
