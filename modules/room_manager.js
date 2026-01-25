const RoomManager = {};
const ROOM_DIR = "/sdcard/msgbot/Bots/sub/data/rooms/";

RoomManager.saveRoom = function(roomName, roomHash) {
    var folder = new java.io.File(ROOM_DIR);
    if (!folder.exists()) folder.mkdirs();

    var path = ROOM_DIR + roomHash + ".json";
    var roomData = {
        "roomName": roomName,
        "roomHash": roomHash,
        "lastUpdate": new Date().toLocaleString()
    };
    
    FileStream.write(path, JSON.stringify(roomData, null, 4));
    return roomData;
};

module.exports = RoomManager;
