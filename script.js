document.addEventListener('DOMContentLoaded', () => {
    console.log("Running Multi-Lift SCAN algorithm locally.");

    // Inputs
    const maxFloorsInput = document.getElementById('maxFloors');
    const initPosA = document.getElementById('initialPosA');
    const initPosB = document.getElementById('initialPosB');
    const reqsInput = document.getElementById('requests');

    // UI elements
    const statusMsg = document.getElementById('statusMsg');
    statusMsg.innerText = `Ready to Optimize`;
    const optimizeBtn = document.getElementById('optimizeBtn');
    
    // Direction Toggles
    const dirToggleA = document.getElementById('dirToggleA').querySelectorAll('button');
    const dirToggleB = document.getElementById('dirToggleB').querySelectorAll('button');
    
    let dirA = "UP";
    let dirB = "DOWN";

    function setDirToggle(buttons, setDirCallback) {
        buttons.forEach(btn => {
            btn.onclick = () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                setDirCallback(btn.getAttribute('data-dir'));
            };
        });
    }
    
    setDirToggle(dirToggleA, (d) => dirA = d);
    setDirToggle(dirToggleB, (d) => dirB = d);

    // Cars and outputs
    const carA = document.getElementById('liftCarA');
    const carB = document.getElementById('liftCarB');
    const dispA = carA.querySelector('.lift-display');
    const dispB = carB.querySelector('.lift-display');
    const floorMarkers = document.getElementById('floorMarkers');

    let myChart;

    function generateMarkers(max) {
        floorMarkers.innerHTML = '';
        for (let i = 0; i <= max; i += Math.ceil(max / 10)) {
            const tick = document.createElement('div');
            tick.className = 'floor-tick';
            tick.innerText = `F${i}`;
            tick.style.bottom = `${(i / max) * 100}%`;
            floorMarkers.appendChild(tick);
        }
    }

    function animateLift(car, disp, seqContainer, distContainer, sequence, head, maxFloor) {
        let i = 0;
        car.style.transition = 'bottom 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        car.style.bottom = `${(head / maxFloor) * 100}%`;
        disp.innerText = head;
        seqContainer.innerText = "";
        distContainer.innerText = "0";
        
        if (!sequence || sequence.length === 0) {
            seqContainer.innerText = "None";
            return;
        }

        let currentSeq = [];
        let currDist = 0;
        let currPos = head;

        function moveNext() {
            if (i >= sequence.length) return;
            const target = sequence[i];
            car.style.bottom = `${(target / maxFloor) * 100}%`;
            
            let travelTime = 1500;
            let startDist = currDist;
            let distToAdd = Math.abs(target - currPos);
            let startTime = null;

            function countUp(timestamp) {
                if (!startTime) startTime = timestamp;
                let progress = (timestamp - startTime) / travelTime;
                if (progress > 1) progress = 1;

                // Easing function to match the CSS cubic-bezier roughly
                let easeProgress = 1 - Math.pow(1 - progress, 3);
                
                distContainer.innerText = Math.floor(startDist + (distToAdd * progress));
                disp.innerText = Math.floor(currPos + ((target - currPos) * easeProgress));
                
                if (progress < 1) {
                    requestAnimationFrame(countUp);
                } else {
                    disp.innerText = target;
                    distContainer.innerText = startDist + distToAdd;
                }
            }
            requestAnimationFrame(countUp);
            
            // Append to sequence right as it touches the floor
            setTimeout(() => {
                currentSeq.push(target);
                seqContainer.innerText = currentSeq.join(' → ');
                currDist += distToAdd;
                currPos = target;
            }, travelTime - 50);

            i++;
            setTimeout(moveNext, travelTime + 300); // Small pause before moving to the next
        }
        setTimeout(moveNext, 1000);
    }

    function initChart(distA, distB, fcfs) {
        const ctx = document.getElementById('distChart').getContext('2d');
        if (myChart) myChart.destroy();
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Lift A', 'Lift B', 'Total', '1-Lift Naive'],
                datasets: [{
                    data: [distA, distB, distA + distB, fcfs],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)', 
                        'rgba(16, 185, 129, 0.7)', 
                        'rgba(79, 70, 229, 0.7)',
                        'rgba(100, 116, 139, 0.4)'
                    ],
                    borderColor: ['#3b82f6', '#10b981', '#4f46e5', '#64748b'],
                    borderWidth: 1,
                    borderRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { color: '#64748b' } },
                    x: { grid: { display: false }, ticks: { color: '#64748b' } }
                }
            }
        });
    }

    function getEta(head, direction, target, maxFloor) {
        if (direction === "UP") {
            if (target >= head) return target - head;
            else return (maxFloor - head) + (maxFloor - target);
        } else {
            if (target <= head) return head - target;
            else return head + target;
        }
    }

    function calculateScan(head, requests, direction, maxFloor) {
        if (!requests || requests.length === 0) return { sequence: [], distance: 0 };

        let left = requests.filter(r => r < head);
        let right = requests.filter(r => r > head);
        let atHead = [...new Set(requests.filter(r => r === head))];

        if (direction === "UP" && left.length > 0) right.push(maxFloor);
        else if (direction === "DOWN" && right.length > 0) left.push(0);

        left = [...new Set(left)].sort((a, b) => b - a);
        right = [...new Set(right)].sort((a, b) => a - b);

        let sequence = [];
        if (atHead.length > 0) sequence.push(head);

        let dist = 0;
        let curr = head;
        let runs = 2;
        let currDir = direction;

        while (runs > 0) {
            if (currDir === "UP") {
                for (let r of right) {
                    sequence.push(r);
                    dist += Math.abs(r - curr);
                    curr = r;
                }
                currDir = "DOWN";
            } else {
                for (let r of left) {
                    sequence.push(r);
                    dist += Math.abs(r - curr);
                    curr = r;
                }
                currDir = "UP";
            }
            runs--;
        }
        return { sequence, distance: dist };
    }

    async function runOptimization() {
        const maxFloor = parseInt(maxFloorsInput.value);
        const headA = parseInt(initPosA.value);
        const headB = parseInt(initPosB.value);
        const reqs = reqsInput.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

        if (isNaN(headA) || isNaN(headB) || reqs.length === 0) {
            alert("Please enter valid positive numbers."); return;
        }

        generateMarkers(maxFloor);
        statusMsg.innerText = "Calculating routes locally...";
        statusMsg.style.color = "var(--accent-primary)";

        try {
            // Local Processing Instead of Fetch
            let reqsA = [];
            let reqsB = [];

            for (let r of reqs) {
                let etaA = getEta(headA, dirA, r, maxFloor);
                let etaB = getEta(headB, dirB, r, maxFloor);
                if (etaA <= etaB) reqsA.push(r);
                else reqsB.push(r);
            }

            const resA = calculateScan(headA, reqsA, dirA, maxFloor);
            const resB = calculateScan(headB, reqsB, dirB, maxFloor);

            const data = {
                liftA: { requests: reqsA, sequence: resA.sequence, distance: resA.distance },
                liftB: { requests: reqsB, sequence: resB.sequence, distance: resB.distance },
                totalDistance: resA.distance + resB.distance
            };
            
            // Generate FCFS naive calculation using Lift A
            let fcfsDist = 0;
            let c = headA; 
            reqs.forEach(r => { fcfsDist += Math.abs(r - c); c = r; });

            // Prepare distance incrementor for Total
            const distAValElem = document.getElementById('distAVal');
            const distBValElem = document.getElementById('distBVal');
            const totalDistValElem = document.getElementById('totalDistVal');
            
            const totalInterval = setInterval(() => {
                let a = parseInt(distAValElem.innerText) || 0;
                let b = parseInt(distBValElem.innerText) || 0;
                totalDistValElem.innerText = a + b;
            }, 50);
            
            // Stop observing after max possible time
            const maxSeq = Math.max(data.liftA.sequence.length, data.liftB.sequence.length);
            setTimeout(() => clearInterval(totalInterval), 1000 + (maxSeq * 1800) + 500);

            const seqAContainer = document.getElementById('seqA');
            const seqBContainer = document.getElementById('seqB');

            animateLift(carA, dispA, seqAContainer, distAValElem, data.liftA.sequence, headA, maxFloor);
            animateLift(carB, dispB, seqBContainer, distBValElem, data.liftB.sequence, headB, maxFloor);

            initChart(data.liftA.distance, data.liftB.distance, fcfsDist);
            statusMsg.innerText = "Optimization complete.";
            statusMsg.style.color = "var(--accent-secondary)";

        } catch (err) {
            statusMsg.innerText = `Error processing calculation.`;
            statusMsg.style.color = "var(--accent-danger)";
            console.error(err);
        }
    }

    optimizeBtn.addEventListener('click', runOptimization);
    
    // Initial visuals
    setTimeout(() => {
        const max = parseInt(maxFloorsInput.value) || 50;
        carA.style.bottom = `${(parseInt(initPosA.value) / max) * 100}%`;
        carB.style.bottom = `${(parseInt(initPosB.value) / max) * 100}%`;
        generateMarkers(max);
    }, 100);
});
