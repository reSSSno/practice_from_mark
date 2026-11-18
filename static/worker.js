import {search} from "./search.js";
let items=[];
self.addEventListener("message",({data})=>{
  if(data.type==="items"){items=data.items;self.postMessage({type:"ready",count:items.length});return;}
  if(data.type==="search"){
    const t0=performance.now();
    const found=search(items,data.query);
    self.postMessage({type:"result",id:data.id,found,ms:Math.round(performance.now()-t0)});
  }
});
