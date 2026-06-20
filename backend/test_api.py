import requests

def test_health():
    url = "http://localhost:8000/health"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print("Success! Backend is running:", response.json())
        else:
            print(f"Failed. Status code: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("Failed to connect. Make sure the backend server is running (uvicorn main:app).")

if __name__ == "__main__":
    test_health()
