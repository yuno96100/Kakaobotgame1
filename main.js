// sdcard/msgbot/Bots/sub/main.js

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg.startsWith(".")) {
        // [순서 엄격 준수] room(1), msg(2), sender(3), isGroupChat(4), replier(5)
        Handler.process(room, msg, sender, isGroupChat, replier);
    }
}
