module.exports = {
    get: function(name) {
        var path = "/sdcard/msgbot/Bots/sub/data/" + name + ".json";
        if (java.io.File(path).exists()) return JSON.parse(FileStream.read(path));
        return { name: name, level: 1, exp: 0, maxExp: 100, money: 1000, lastAttendance: "" };
    },
    save: function(name, data) {
        var folder = new java.io.File("/sdcard/msgbot/Bots/sub/data/");
        if (!folder.exists()) folder.mkdirs();
        FileStream.write("/sdcard/msgbot/Bots/sub/data/" + name + ".json", JSON.stringify(data, null, 4));
    }
};
