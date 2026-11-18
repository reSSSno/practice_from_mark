const input=document.querySelector("#q");
const results=document.querySelector("#results");
const status=document.querySelector("#status");
const reload=document.querySelector("#reload");
const connection=document.querySelector("#connection");
const worker=new Worker(new URL("./worker.js",import.meta.url),{type:"module"});
let items=[],lastId=0,controller,generation=0,ready=false;
const say=text=>status.textContent=text;
const showConnection=()=>connection.textContent=navigator.onLine?"● Сеть доступна":"● Офлайн";
window.addEventListener("online",showConnection);
window.addEventListener("offline",showConnection);
showConnection();

function render(found){
  const fragment=document.createDocumentFragment();
  for(const item of found){
    const card=document.createElement("li");card.className="card";
    const head=document.createElement("div");head.className="card-header";
    const title=document.createElement("h3");title.textContent=item.title;
    const rating=document.createElement("span");rating.className="rating";rating.textContent="★ "+item.rating;
    const price=document.createElement("p");price.className="price";price.textContent=item.price.toLocaleString("ru-RU")+" ₽";
    head.append(title,rating);card.append(head,price);fragment.append(card);
  }
  results.replaceChildren(fragment);
}
function searchNow(){
  if(!ready)return;
  const id=++lastId;
  say("Ищем товары…");
  worker.postMessage({type:"search",id,query:input.value});
}
worker.addEventListener("message",({data})=>{
  if(data.type==="ready"){ready=true;searchNow();return;}
  if(data.type==="result"&&data.id===lastId){
    render(data.found);
    say(data.found.length?`Найдено ${data.found.length} товаров · поиск ${data.ms} мс (в воркере)`:"Ничего не нашлось. Проверьте запрос.");
  }
});
worker.addEventListener("error",()=>say("Не удалось запустить поиск. Обновите страницу."));
input.addEventListener("input",()=>{++lastId;searchNow();});

async function load(){
  controller?.abort();
  const current=++generation;
  controller=new AbortController();
  const signal=AbortSignal.any([controller.signal,AbortSignal.timeout(5000)]);
  say("Загружаем каталог…");reload.disabled=true;
  try{
    const response=await fetch("/api/items",{signal,cache:"no-cache"});
    if(!response.ok)throw new Error(`сервер ответил ${response.status}`);
    const received=await response.json();
    if(current!==generation)return;
    if(!Array.isArray(received))throw new Error("неверный формат ответа");
    items=received;ready=false;
    worker.postMessage({type:"items",items});
    say(`Загружено ${items.length.toLocaleString("ru-RU")} товаров. Готовим поиск…`);
  }catch(error){
    if(current!==generation||error.name==="AbortError")return;
    if(items.length){say("Не удалось обновить каталог. Используем ранее загруженные данные.");searchNow();}
    else say(error.name==="TimeoutError"?"Сервер не ответил за 5 секунд. Попробуйте обновить страницу.":`Не удалось загрузить каталог: ${error.message}`);
  }finally{if(current===generation)reload.disabled=false;}
}
reload.addEventListener("click",load);
if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{});
load();
