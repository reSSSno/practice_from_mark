import asyncio, hashlib, json, random
from typing import Annotated
from fastapi import FastAPI, Query, Request, Response
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

app = FastAPI(title="Каталог оборудования")
app.add_middleware(GZipMiddleware, minimum_size=1000)
rnd = random.Random(42)
WORDS = ["кабель","роутер","коммутатор","ноутбук","монитор","клавиатура","мышь","сервер","диск","память","камера","датчик","адаптер","антенна","колонка"]
BRANDS = ["Альфа","Бета","Гамма","Дельта","Сигма","Омега"]
ITEMS = [{"id":i,"title":f"{rnd.choice(WORDS)} {rnd.choice(BRANDS)} {rnd.randint(100,999)}","price":rnd.randint(300,300_000),"rating":round(rnd.uniform(1,5),1)} for i in range(1,50_001)]
CATALOG_VERSION = hashlib.sha256(json.dumps(ITEMS,ensure_ascii=False).encode()).hexdigest()[:16]

class Item(BaseModel):
    id: int
    title: str = Field(min_length=1,max_length=200)
    price: int = Field(ge=0)
    rating: float = Field(ge=0,le=5)

@app.get("/api/items",response_model=list[Item])
async def list_items(request: Request,response: Response,limit: Annotated[int,Query(ge=1,le=50_000)]=50_000,delay: Annotated[float,Query(ge=0,le=10)]=0):
    if delay: await asyncio.sleep(delay)
    etag = f'"{CATALOG_VERSION}-{limit}"'
    headers = {"ETag":etag,"Cache-Control":"no-cache"}
    if request.headers.get("if-none-match")==etag:
        return Response(status_code=304,headers=headers)
    response.headers.update(headers)
    return ITEMS[:limit]

app.mount("/",StaticFiles(directory="static",html=True),name="static")
