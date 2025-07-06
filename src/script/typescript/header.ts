import {throttle} from './util.js';

const threshold = 50;
document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector('header') as HTMLElement;
    if(!header) return;

    let lastScroll = window.scrollY;
    
    const handleScroll = throttle(() => {
        const currentScroll = window.scrollY;
        const scrollDelta = currentScroll - lastScroll;
        
        if(Math.abs(scrollDelta) < threshold) return;
        if(scrollDelta < 0 && !header.classList.contains('show')){
            // 上方向にスクロール - ヘッダーを表示
            header.classList.add('show');
            header.classList.remove('hide');
        } else if(scrollDelta > 0 && !header.classList.contains('hide')){
            // 下方向にスクロール - ヘッダーを隠す
            header.classList.add('hide');
            header.classList.remove('show');
        }
        
        lastScroll = currentScroll;
    }, 50);
    
    document.addEventListener('scroll', handleScroll);
});