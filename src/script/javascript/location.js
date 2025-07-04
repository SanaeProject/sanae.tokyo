"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getLatLngByGeolocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            resolve({ lat, lng });
        }, (error) => {
            let errorMessage = '';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = '位置情報の取得が許可されていません。';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = '位置情報が利用できません。';
                    break;
                case error.TIMEOUT:
                    errorMessage = '位置情報の取得がタイムアウトしました。';
                    break;
                default:
                    errorMessage = '位置情報の取得中に不明なエラーが発生しました。';
                    break;
            }
            reject(new Error(errorMessage));
        });
    });
}
function getLatLngByLocationName(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const getLatlngByGsi = (address) => __awaiter(this, void 0, void 0, function* () {
            const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${address}`;
            const response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`HTTPエラー: ${response.status} ${response.statusText}`);
            }
            const text = yield response.text();
            const data = JSON.parse(text);
            if (!data || data.length === 0) {
                throw new Error('指定された住所に一致するデータが見つかりませんでした。');
            }
            const coordinates = data[0].geometry.coordinates;
            return { lat: parseFloat(coordinates[1]), lng: coordinates[0] };
        });
        try {
            return yield getLatlngByGsi(address);
        }
        catch (error) {
            throw new Error(`住所から緯度経度を取得できませんでした: ${error.message}`);
        }
    });
}
//# sourceMappingURL=location.js.map