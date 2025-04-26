import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_upload_json(id: str, data: dict):
    """JSONデータをアップロードするテスト"""
    print(f"\n=== JSONアップロードテスト ===")
    print(f"ID: {id}")
    print(f"データ: {json.dumps(data, indent=2, ensure_ascii=False)}")

    try:
        response = requests.post(
            f"{BASE_URL}/upload-json",
            json={
                "id": id,
                "data": data
            }
        )
        response.raise_for_status()
        result = response.json()
        print(f"成功: {json.dumps(result, indent=2, ensure_ascii=False)}")
        return result["url"]
    except requests.exceptions.RequestException as e:
        print(f"エラー: {str(e)}")
        if hasattr(e.response, 'text'):
            print(f"レスポンス: {e.response.text}")
        return None

def test_get_json(id: str):
    """JSONデータを取得するテスト"""
    print(f"\n=== JSON取得テスト ===")
    print(f"ID: {id}")

    try:
        response = requests.get(f"{BASE_URL}/get-json/{id}")
        response.raise_for_status()
        result = response.json()
        print(f"成功: {json.dumps(result, indent=2, ensure_ascii=False)}")
        return result
    except requests.exceptions.RequestException as e:
        print(f"エラー: {str(e)}")
        if hasattr(e.response, 'text'):
            print(f"レスポンス: {e.response.text}")
        return None

def main():
    # テストデータ
    test_data = {
        "name": "テストデータ",
        "value": 1234,
        "items": ["item1", "item2", "item3"]
    }

    # テストID
    test_id = "test-1234"

    # アップロードテスト
    url = test_upload_json(test_id, test_data)

    if url:
        # 取得テスト
        test_get_json(test_id)

if __name__ == "__main__":
    main()
