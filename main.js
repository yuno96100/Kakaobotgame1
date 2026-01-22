const Handler = require("./modules/handler");

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg.startsWith(".")) {
        Handler.process(room, msg, sender, isGroupChat, replier);
    }
}
