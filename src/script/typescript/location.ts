function getLatLngByGeolocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat: number = position.coords.latitude;
                const lng: number = position.coords.longitude;
                resolve({ lat, lng });
            },
            (error) => {
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
            }
        );
    });
}

async function getLatLngByLocationName(address: string): Promise<{ lat: number; lng: number }> {
    const getLatlngByGsi = async (address: string): Promise<{ lat: number; lng: number }> => {
        const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${address}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        const data = JSON.parse(text);
        if (!data || data.length === 0) {
            throw new Error('指定された住所に一致するデータが見つかりませんでした。');
        }
        const coordinates = data[0].geometry.coordinates;
        return { lat: parseFloat(coordinates[1]), lng: coordinates[0] };
    };

    try {
        return await getLatlngByGsi(address);
    } catch (error: any) {
        throw new Error(`住所から緯度経度を取得できませんでした: ${error.message}`);
    }
}