from fastapi.testclient import TestClient
from main import app
client = TestClient(app)

def test_items_follow_schema():
    r=client.get("/api/items",params={"limit":3})
    assert r.status_code==200
    assert len(r.json())==3
    assert set(r.json()[0])=={"id","title","price","rating"}

def test_limit_is_validated():
    assert client.get("/api/items",params={"limit":0}).status_code==422
    assert client.get("/api/items",params={"limit":100000}).status_code==422
    assert client.get("/api/items",params={"delay":11}).status_code==422

def test_unchanged_catalog_returns_304():
    first=client.get("/api/items",params={"limit":3})
    etag=first.headers["etag"]
    second=client.get("/api/items",params={"limit":3},headers={"If-None-Match":etag})
    assert second.status_code==304 and second.content==b""
    assert client.get("/api/items",params={"limit":4},headers={"If-None-Match":etag}).status_code==200

def test_response_is_compressed():
    r=client.get("/api/items",params={"limit":1000},headers={"Accept-Encoding":"gzip"})
    assert r.headers["content-encoding"]=="gzip"
