// 時計の表示
function clock() {
    // 現在の日時
    var now = new Date();

    // Tokyoの時間（ミリ秒）
    var timeTokyo = now.getTime();

    // UTC（協定世界時）の時間（ミリ秒）
    var timeUTC = timeTokyo - 9 * 60 * 60 * 1000;

    // 選択された都市のタイムゾーン
    var cityElement = document.getElementById("city");
    var index = cityElement.selectedIndex;
    var timeZone = cityElement.options[index].value;

    // タイムゾーン用の要素取得
    var timezoneElement = document.getElementById("timezone");
    // タイムゾーンをセット
    timezoneElement.innerHTML = "Timezone:" + timeZone;

    // 選択された都市の時間（ミリ秒）
    var timeCity = timeUTC + timeZone * 60 * 60 *1000;

    // 選択された都市の日時
    now = new Date(timeCity);

    // 時間の取得
    var hour = now.getHours();
    // 分の取得
    var min = now.getMinutes();
    // 秒の取得
    var sec = now.getSeconds();

    // 2桁表示に変更
    if (hour < 10) hour = "0" + hour;
    if (min < 10) min = "0" + min;
    if (sec < 10) sec = "0" + sec;

    // 時間表示用の要素取得
    var timeElement = document.getElementById("time");
    // 時間をセット
    timeElement.innerHTML = hour + ":" + min + ":" + sec;

    // 年の取得
    var year = now.getFullYear();
    // 月の取得
    var month = now.getMonth() + 1;
    // 日の取得
    var day = now.getDate();

    // 月、日を2ケタ表示に変更
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;

    // 曜日の名称
    var weekArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    // 曜日の取得
    var week = weekArray[now.getDay()];

    // 日付表示用の要素の取得
    var dateElement = document.getElementById("date");
    // 日付をセット
    dateElement.innerHTML = year + "/" + month + "/" + day + " " + week;
}