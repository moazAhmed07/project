/* ==========================================================================
   LANDING PAGE — Background image slideshow with a curtain transition.
   ========================================================================== */

/* Page container whose background image we change, and list of image names. */
let landingPage = document.querySelector('.js-landing-page');
let imgsArray = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'];

const curtain = document.querySelector('.slide-curtain');

/* Pick a random image index, but never the same as last time. */
let lastNumber = -1;

function getRandomNumber() {
    let randomNumber;
    do {
        randomNumber = Math.floor(Math.random() * imgsArray.length);
    } while (randomNumber === lastNumber);
    lastNumber = randomNumber;
    return randomNumber;
}

/* Every 10 seconds: show curtain, change background to a new random image,
   then animate curtain closed so the new image is visible. */
setInterval(() => {
    curtain.classList.add('open');

    setTimeout(() => {
        let randomNumber = getRandomNumber();
        landingPage.style.backgroundImage = 'url("imgs/' + imgsArray[randomNumber] + '")';

        curtain.classList.remove('open');
        curtain.classList.add('close');

        setTimeout(() => {
            curtain.classList.remove('close');
        }, 600);

    }, 600);

}, 10000);