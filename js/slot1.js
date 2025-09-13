    let angle = 0;

    function spin() {
        const min = 6; 
        const max = 10; 
        const extra = Math.floor(Math.random() * 360); 
        const spins = Math.floor(Math.random() * (max - min + 1)) + min;

        angle += spins * 360 + extra; 

        const koleso = document.getElementById("koleso");
        koleso.style.transform = `rotate(${angle}deg)`;
        console.log(angle)
    }