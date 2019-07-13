// タイル関係
var t_pale = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
    attribution: "<a href='http://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html' target='_blank'>国土地理院</a>"
});

var t_ort = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg', {
    attribution: "<a href='http://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html' target='_blank'>国土地理院</a>"
});

var o_std = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
});

var Map_BaseLayer = {
    // "MIERUNE地図 color": m_color,
    // "MIERUNE地図 mono": m_mono,
    "地理院地図 淡色": t_pale,
    "地理院地図 航空写真": t_ort,
    "OpenStreetMap 標準": o_std
};

var map = L.map('map', {
    center: [32.504405, 130.604782],  // 八代を中心に設定
    zoom: 13,
    zoomControl: true,
    layers: [t_pale]
});

L.control.layers(Map_BaseLayer, null, {
    collapsed: true
}).addTo(map)

L.control.scale({imperial:false}).addTo(map);


var occur_info = [];      // 不審者出没マーカー情報
var occur_contents = [];  // 不審者出没表示内容
var occur_lat = [];  // 不審者出没緯度
var occur_lon = [];  // 不審者出没経度

var safeguard_info = [];     // まもるいえマーカー情報
var safeguard_contents = []; // まもるいえ表示内容
var safeguard_lat = [];  // まもるいえ緯度
var safeguard_lon = [];  // まもるいえ経度
var safeguard_img = [];  // まもるいえ写真

var occur_flag = 0;
var safeguard_flag = 0;
var danger_flag = 0;

var occur_tile;
var safeguard_tile;
var danger_tile = [];

var occur_popOpt = {
    'className': 'occur_pop'
}
var safeguard_popOpt = {
    'className': 'safeguard_pop'
}
var occur_pop_title = '<div class="occur_pop_title">不審者出没地点</div>';
var safeguard_pop_title = '<div class="safeguard_pop_title">こどもをまもるいえ</div>';

$.getJSON({ url: 'map_data.json', cache: false, }) // json読み込み開始
    .done(function (data) { // jsonの読み込みに成功した時
        console.log('成功');
        len = data.length;
        for (var i = 0; i < len; i++) {
            if (data[i].kind == 0) {
                occur_contents.push(data[i].time)
                occur_lat.push(data[i].lat);
                occur_lon.push(data[i].lon);
            }
            else{
                safeguard_contents.push(data[i].time)
                safeguard_lat.push(data[i].lat);
                safeguard_lon.push(data[i].lon);
                safeguard_img.push(data[i].img);
            }
        }
        data_load();
    })
    .fail(function () { // jsonの読み込みに失敗した時
        console.log('失敗');
    }
);

/*
function get_data(data){
    console.log('成功');
    len = data.length;
    for (var i = 0; i < len; i++) {
        if (data[i].kind == 0) {
            occur_contents.push(data[i].time)
            occur_lat.push(data[i].lat);
            occur_lon.push(data[i].lon);
        }
        else{
            safeguard_contents.push(data[i].time)
            safeguard_lat.push(data[i].lat);
            safeguard_lon.push(data[i].lon);
            safeguard_img.push(data[i].img);
        }
    }
    data_load();
    occur_appear();
    safeguard_appear();
    danger_appear();
}
*/

function data_load(){
    // GeoJSON形式で複数個のマーカーを設定する
    // 不審者出没
    for (var i = 0; i < occur_lat.length; i++) {
        occur_info.push({     // 1つのマーカーの情報を格納する
            "type": "Feature",
            "properties": {
                "popupContent": occur_contents[i]
            },
            "geometry": {
                "type": "Point",
                "coordinates": [occur_lon[i], occur_lat[i]]
            }
        });
    }

    // こどもをまもるいえ
    for (var i = 0; i < safeguard_lat.length; i++) {
        var img_info = "<br><img src=" + safeguard_img[0] + "width='100%' height='auto' text-aling='center'></img>";
        safeguard_info.push({     // 1つのマーカーの情報を格納する
            "type": "Feature",
            "properties": {
                "popupContent": safeguard_contents[i] + img_info
            },
            "geometry": {
                "type": "Point",
                "coordinates": [safeguard_lon[i], safeguard_lat[i]]
            }
        });
    }
}

// 不審者出没表示
function occur_appear() {
    if (occur_flag == 1) {
        occur_flag = 0;
        occur_disappear();
    }
    else {
        occur_flag = 1;
        // クリックしたらポップアップが出るように設定する
        occur_tile = L.geoJson(occur_info,
            {
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.popupContent) {
                        layer.bindPopup(occur_pop_title + feature.properties.popupContent, occur_popOpt);  // popupOptions : class名を振る
                    }
                },
                // オリジナル画像を設定する
                pointToLayer: function (feature, latlng) {
                    var myIcon = L.icon({
                        iconUrl: 'img/marker-red.png',  // 画像のURI
                        iconSize: [25, 41],         // 画像のサイズ設定
                        iconAnchor: [12, 40],       // 画像の位置設定
                        popupAnchor: [0, -40]       // ポップアップの表示を開始する位置設定
                    });
                    return L.marker(latlng, { icon: myIcon });  // マーカーに画像情報を設定
                }
            });
        occur_tile.addTo(map);
    }
}

// 不審者出没非表示
function occur_disappear() {
    map.removeLayer(occur_tile);

}

// まもるいえ表示
function safeguard_appear() {
    if (safeguard_flag == 1) {
        safeguard_flag = 0;
        safeguard_disappear();
    }
    else {
        safeguard_flag = 1;
        // クリックしたらポップアップが出るように設定する
        safeguard_tile = L.geoJson(safeguard_info,
            {
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.popupContent) {
                        layer.bindPopup(safeguard_pop_title + feature.properties.popupContent, safeguard_popOpt);
                    }
                },
                // オリジナル画像を設定する
                pointToLayer: function (feature, latlng) {
                    var myIcon = L.icon({
                        iconUrl: 'img/mamoruie.png',  // 画像のURI
                        iconSize: [40, 40],         // 画像のサイズ設定
                        iconAnchor: [12, 40],       // 画像の位置設定
                        popupAnchor: [0, -40]       //　　ポップアップの表示を開始する位置設定
                    });
                    return L.marker(latlng, { icon: myIcon });  // マーカーに画像情報を設定
                }
            });
        safeguard_tile.addTo(map);
    }
}

// まもるいえ非表示
function safeguard_disappear() {
    map.removeLayer(safeguard_tile);
}

// 危険エリア表示
function danger_appear() {
    if (danger_flag == 1) {
        danger_flag = 0;
        danger_disappear();
    }
    else {
        danger_flag = 1;

        for (var i = 0; i < occur_lat.length; i ++ ){
            danger_tile[i] = L.circle([occur_lat[i], occur_lon[i]], 200,{ // 位置と半径
                // radius: 1000,
                color: 'blue',
                fillColor: '#399ade',
                fillOpacity: 0.5,
                weight: 0  // 枠線の太さ
            }).addTo(map);
        }
    }
}

// 危険エリア非表示
function danger_disappear() {
    for (var i = 0; i < occur_lat.length; i++) {
        map.removeLayer(danger_tile[i]);
    }
}

// ページ読み込み時に実行
window.onload = function () {
    occur_appear();
    safeguard_appear();
    danger_appear();
}