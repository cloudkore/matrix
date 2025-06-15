// js/footer-effects.js
$(document).ready(function() {
    const matrixLink = document.getElementById('matrixLink');
    let continuousGlowInterval;
    let flickerInterval;
    let letterSpacingInterval;

    // Function to apply the base text shadow
    const applyBaseShadow = (element) => {
        element.style.textShadow = '0 0 8px rgba(224,0,0,.7),0 0 15px rgba(255,69,0,.4),0 0 25px rgba(255,99,71,.2)';
    };

    // Functions for effects (as per your original code snippets)
    function startContinuousGlowPulse() {
        let e = true;
        continuousGlowInterval = setInterval(() => {
            if (matrixLink && !matrixLink.matches(':hover')) {
                if (e) {
                    matrixLink.style.textShadow = '0 0 10px rgba(224,0,0,.8),0 0 20px rgba(255,69,0,.6),0 0 30px rgba(255,99,71,.3)';
                } else {
                    matrixLink.style.textShadow = '0 0 8px rgba(224,0,0,.7),0 0 15px rgba(255,69,0,.4),0 0 25px rgba(255,99,71,.2)';
                }
                e = !e;
            }
        }, 800);
    }

    function startDigitalFlicker() {
        flickerInterval = setInterval(() => {
            if (matrixLink && !matrixLink.matches(':hover')) {
                if (Math.random() < .05) {
                    matrixLink.style.color = `rgba(224,0,0,${.4 + Math.random() * .4})`;
                    matrixLink.style.textShadow = '0 0 5px rgba(255,50,50,.8),0 0 10px rgba(255,100,100,.5)';
                    setTimeout(() => {
                        if (matrixLink && !matrixLink.matches(':hover')) {
                            matrixLink.style.color = '#E00000';
                            applyBaseShadow(matrixLink);
                        }
                    }, 80);
                }
            }
        }, 120);
    }

    function startLetterSpacingPulse() {
        let e = false;
        letterSpacingInterval = setInterval(() => {
            if (matrixLink && !matrixLink.matches(':hover')) {
                // Placeholder effect as original was truncated
                matrixLink.style.letterSpacing = e ? '2px' : '1px';
                e = !e;
            }
        }, 800); // Placeholder interval
    }

    // Add event listeners for mouseover and mouseout
    if (matrixLink) {
        matrixLink.addEventListener('mouseover', function() {
            this.style.color = '#FFF';
            this.style.textShadow = '0 0 25px rgba(255,255,255,.9),0 0 40px rgba(255,100,100,.7),0 0 60px rgba(255,150,150,.5)';
            this.style.transform = 'translateY(-5px) scale(1.1) rotateX(5deg)';
            this.style.cursor = 'pointer';
            // Clear continuous effects on hover
            if (continuousGlowInterval) { clearInterval(continuousGlowInterval); continuousGlowInterval = null; }
            if (flickerInterval) { clearInterval(flickerInterval); flickerInterval = null; }
            if (letterSpacingInterval) { clearInterval(letterSpacingInterval); letterSpacingInterval = null; }
        });

        matrixLink.addEventListener('mouseout', function() {
            // Restore base styles and restart continuous effects on mouse out
            this.style.color = '#E00000';
            applyBaseShadow(this);
            this.style.transform = 'none';
            this.style.cursor = 'default';
            startContinuousGlowPulse();
            startDigitalFlicker();
            startLetterSpacingPulse();
        });

        // Start initial effects when the page loads
        startContinuousGlowPulse();
        startDigitalFlicker();
        startLetterSpacingPulse();
    }
});