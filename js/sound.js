const clickSound = new Audio("assets/sound.mp3");
clickSound.preload = 'auto';

document.addEventListener("click", () => {
  try {
    clickSound.currentTime = 0;
    clickSound.play();

    // Strong haptic: double pulse
    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 30]);
    }
  } catch (err) {
    console.error("Click error:", err);
  }
});