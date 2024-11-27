export function throttle(fn, wait){
    let throttled = false;
    return function(...args){
        if(!throttled){
            fn.apply(this,args);
            throttled = true;
            setTimeout(()=>{
                throttled = false;
            }, wait);
        }
    }
}