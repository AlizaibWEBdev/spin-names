
        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const wheelCanvas = document.getElementById('wheelCanvas');
            const namesInput = document.getElementById('namesInput');
            const spinBtn = document.getElementById('spinBtn');
            const winnerDisplay = document.getElementById('winnerDisplay');
            const colorPicker = document.getElementById('colorPicker');
            const colorOptions = document.querySelectorAll('.color-option');
            const spinDuration = document.getElementById('spinDuration');
            const textColor = document.getElementById('textColor');
            const saveBtn = document.getElementById('saveBtn');
            const shareBtn = document.getElementById('shareBtn');

            // Wheel variables
            let ctx = wheelCanvas.getContext('2d');
            let names = ["Alice", "Bob", "Charlie", "Diana", "Eve"];
        
            namesInput.value = names.join('\n');

            let currentColor = '#3369e8';
            let isSpinning = false;
            let currentRotation = 0;
            let wheelSize = Math.min(wheelCanvas.parentElement.offsetWidth, 500);
            
            // Initialize wheel
            function initWheel() {
                wheelCanvas.width = wheelSize;
                wheelCanvas.height = wheelSize;
                drawWheel();
            }

            // Draw the wheel
            function drawWheel() {
                ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
                
                if (names.length === 0) {
                    ctx.fillStyle = '#f0f0f0';
                    ctx.beginPath();
                    ctx.arc(wheelSize/2, wheelSize/2, wheelSize/2 - 10, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = '#999';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = '20px Poppins';
                    ctx.fillText('Add names to begin', wheelSize/2, wheelSize/2);
                    return;
                }
                
                const center = wheelSize / 2;
                const radius = center - 10;
                const segmentAngle = (Math.PI * 2) / names.length;
                
                // Draw segments
                for (let i = 0; i < names.length; i++) {
                    const startAngle = i * segmentAngle + currentRotation;
                    const endAngle = (i + 1) * segmentAngle + currentRotation;
                    
                    ctx.beginPath();
                    ctx.moveTo(center, center);
                    ctx.arc(center, center, radius, startAngle, endAngle);
                    ctx.closePath();
                    
                    // Alternate colors for better visibility
                    const segmentColor = i % 2 === 0 ? 
                        adjustColor(currentColor, -20) : 
                        adjustColor(currentColor, 20);
                    
                    ctx.fillStyle = segmentColor;
                    ctx.fill();
                    
                    // Draw segment border
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    // Draw text
                    ctx.save();
                    ctx.translate(center, center);
                    ctx.rotate(startAngle + segmentAngle / 2);
                    ctx.textAlign = 'right';
                    ctx.fillStyle = textColor.value;
                    ctx.font = `bold ${Math.min(20, radius / 5)}px Poppins`;
                    
                    const maxWidth = radius * 0.7;
                    const text = names[i];
                    let fontSize = Math.min(20, radius / 5);
                    
                    // Adjust font size to fit text
                    ctx.font = `bold ${fontSize}px Poppins`;
                    while (ctx.measureText(text).width > maxWidth && fontSize > 10) {
                        fontSize -= 1;
                        ctx.font = `bold ${fontSize}px Poppins`;
                    }
                    
                    ctx.fillText(text, radius - 20, 5);
                    ctx.restore();
                }
                
                // Draw center circle
                ctx.beginPath();
                ctx.arc(center, center, radius * 0.1, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.strokeStyle = '#ddd';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                // Draw pointer
                
            }

            // Helper function to adjust color brightness
            function adjustColor(color, amount) {
            // color will be a hash code like #fffe 
                let r = parseInt(color.slice(1, 3), 16);
                let g = parseInt(color.slice(3, 5), 16);
                let b = parseInt(color.slice(5, 7), 16);
                
                r = Math.min(Math.max(r + amount, 0), 255);
                g = Math.min(Math.max(g + amount, 0), 255);
                b = Math.min(Math.max(b + amount, 0), 255);
                
                return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        
            }

            // Spin the wheel
            function spinWheel() {
                if (isSpinning || names.length === 0) return;
                
                isSpinning = true;
                spinBtn.disabled = true;
                winnerDisplay.textContent = '';
                
                const duration = parseInt(spinDuration.value) * 1000;
                const spins = 5 + Math.random() * 5; // 5-10 full spins
                const targetRotation = currentRotation + Math.PI * 2 * spins;
                const startTime = performance.now();
                
                function animate(time) {
                    const elapsed = time - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeProgress = easeOutCubic(progress);
                    
                    currentRotation = easeProgress * targetRotation;
                    drawWheel();
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        finishSpin();
                    }
                }
                
                requestAnimationFrame(animate);
            }

            // Easing function for smooth spin
            function easeOutCubic(t) {
                return 1 - Math.pow(1 - t, 3);
            }

            // Finish spin and display winner
            function finishSpin() {
                isSpinning = false;
                spinBtn.disabled = false;
                
                // Calculate winner
                const normalizedRotation = currentRotation % (Math.PI * 2);
                const segmentAngle = (Math.PI * 2) / names.length;
                let winningSegment = Math.floor((Math.PI * 2 - normalizedRotation) / segmentAngle);
                
                // Adjust for negative rotation
                winningSegment = (winningSegment + names.length) % names.length;
                
                // Display winner with animation
                const winner = names[winningSegment];
                winnerDisplay.textContent = '';
                
                let i = 0;
                const speed = 100; // ms per character
                function typeWriter() {
                    if (i < winner.length) {
                        winnerDisplay.textContent += winner.charAt(i);
                        i++;
                        setTimeout(typeWriter, speed);
                    }
                }
                
                typeWriter();
            }

            // Event listeners
            namesInput.addEventListener('input', function() {
                names = this.value.split('\n').filter(name => name.trim() !== '');
                drawWheel();
            });

            colorOptions.forEach(option => {
                option.addEventListener('click', function() {
                    colorOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    currentColor = this.dataset.color;
                    drawWheel();
                });
            });

            spinBtn.addEventListener('click', spinWheel);

            spinDuration.addEventListener('change', function() {
                if (this.value < 2) this.value = 2;
                if (this.value > 10) this.value = 10;
            });

            textColor.addEventListener('change', drawWheel);

            saveBtn.addEventListener('click', function() {
                if (names.length === 0) {
                    alert('Please add some names first!');
                    return;
                }
                alert('Wheel saved! (In a real implementation, this would save to localStorage or a database)');
            });

            shareBtn.addEventListener('click', function() {
                if (names.length === 0) {
                    alert('Please add some names first!');
                    return;
                }
                
                if (navigator.share) {
                    navigator.share({
                        title: 'Check out my Wheel of Names',
                        text: 'I created a custom wheel spinner with Wheel of Names',
                        url: window.location.href
                    }).catch(err => {
                        console.log('Error sharing:', err);
                    });
                } else {
                    // Fallback for browsers that don't support Web Share API
                    alert('Share this link: ' + window.location.href);
                }
            });

            // Handle window resize
            window.addEventListener('resize', function() {
                wheelSize = Math.min(wheelCanvas.parentElement.offsetWidth, 500);
                wheelCanvas.width = wheelSize;
                wheelCanvas.height = wheelSize;
                drawWheel();
            });

            // Initialize
            initWheel();
        });
   