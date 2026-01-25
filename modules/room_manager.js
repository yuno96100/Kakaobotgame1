// [modules/room_manager.js]
const RoomManager = {};
const ROOM_DIR = "/sdcard/msgbot/Bots/sub/data/rooms/";

RoomManager.saveRoom = function(roomName, roomHash) {
    var folder = new java.io.File(ROOM_DIR);
    if (!folder.exists()) folder.mkdirs();

    var path = ROOM_DIR + roomHash + ".json";
    var roomData = {
        "roomName": roomName,
        "roomHash": roomHash,
        "lastSeen": new Date().toLocaleString()
    };
    
    // 방 정보가 없거나 이름이 바뀌었을 경우 업데이트 저장
    FileStream.write(path, JSON.stringify(roomData, null, 4));
    return roomData;
};

RoomManager.getRoomData = function(roomHash) {
    var path = ROOM_DIR + roomHash + ".json";
    if (!new java.io.File(path).exists()) return null;
    return JSON.parse(FileStream.read(path));
};

module.exports = RoomManager;
