/* Dynamic gradient + particles + neon lines background
   Lightweight canvas implementation: combines moving radial blobs (mesh-like),
   soft light spots, particle field and glowing bezier lines. Works as progressive
   enhancement when video is unavailable or for devices that support canvas.
*/
(function(){
  const DPR = Math.max(1, window.devicePixelRatio || 1);

  function createCanvas(parent, zIndex){
    const c = document.createElement('canvas');
    c.style.zIndex = zIndex;
    parent.appendChild(c);
    const ctx = c.getContext('2d');
    return {c, ctx};
  }

  function resizeCanvas(el){
    const {c, ctx} = el;
    const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    c.width = Math.round(w * DPR);
    c.height = Math.round(h * DPR);
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  function rand(min, max){ return Math.random() * (max - min) + min; }

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('.animated-bg') || document.body;

    // If user agent doesn't support canvas -> abort
    const test = document.createElement('canvas');
    if (!test.getContext) return;

    // Ensure we don't duplicate
    if (root.querySelector('.bg-canvas')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'bg-canvas';
    root.appendChild(wrapper);

    const gradientLayer = createCanvas(wrapper, 1);
    const spotsLayer = createCanvas(wrapper, 2);
    const particlesLayer = createCanvas(wrapper, 3);
    const linesLayer = createCanvas(wrapper, 4);

    // Glass and vignette overlays (CSS-based)
    const glass = document.createElement('div');
    glass.className = 'glass-layer';
    root.appendChild(glass);
    const vign = document.createElement('div');
    vign.className = 'bg-vignette';
    root.appendChild(vign);

    // Apex palette: deep blue → bright blue (hues ~205-220)
    const blobs = [];
    for (let i=0;i<6;i++){
      blobs.push({
        x: rand(0,1), y: rand(0,1),
        r: rand(0.2,0.8),
        w: rand(0.2,0.8),
        hue: rand(205,225),
        speed: rand(0.0005, 0.002)
      });
    }

    const particles = [];
    for (let i=0;i<120;i++){
      particles.push({
        x: Math.random(), y: Math.random(),
        vx: rand(-0.0008, 0.0008), vy: rand(-0.0008,0.0008),
        size: rand(0.6, 2.6), alpha: rand(0.03,0.18)
      });
    }

    const lines = [];
    for (let i=0;i<3;i++){
      const pts = [];
      const count = 4 + Math.floor(rand(0,4));
      for (let j=0;j<count;j++) pts.push({x: rand(0,1), y: rand(0,1)});
      lines.push({pts, t: rand(0,1000), speed: rand(0.0002,0.001), colorHue: rand(200,220)});
    }

    function drawGradient(time){
      const ctx = gradientLayer.ctx;
      const w = gradientLayer.c.width / DPR;
      const h = gradientLayer.c.height / DPR;
      ctx.clearRect(0,0,w,h);

      // Multi-blob radial composition
      for (let i=0;i<blobs.length;i++){
        const b = blobs[i];
        b.x += Math.cos(time * (0.0003 + i*0.00005) + i) * b.speed * 10;
        b.y += Math.sin(time * (0.0004 + i*0.00004) + i*1.2) * b.speed * 10;
        const gx = b.x * w;
        const gy = b.y * h;
        const radius = Math.max(w,h) * b.r;
        const g = ctx.createRadialGradient(gx, gy, radius*0.12, gx, gy, radius);
        g.addColorStop(0, `hsla(${b.hue},88%,42%,0.28)`);
        g.addColorStop(0.4, `hsla(${b.hue+8},80%,22%,0.14)`);
        g.addColorStop(1, `rgba(5,7,13,0)`);
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = g;
        ctx.fillRect(0,0,w,h);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    function drawSpots(time){
      const ctx = spotsLayer.ctx; const w = spotsLayer.c.width / DPR; const h = spotsLayer.c.height / DPR;
      ctx.clearRect(0,0,w,h);
      ctx.globalCompositeOperation = 'lighter';
      for (let i=0;i<4;i++){
        const t = (time*0.0006 + i*2);
        const x = (0.5 + Math.sin(t*0.9 + i)*0.35) * w;
        const y = (0.45 + Math.cos(t*0.7 + i)*0.28) * h;
        const r = Math.max(w,h) * (0.18 + i*0.06);
        const g = ctx.createRadialGradient(x,y,r*0.02,x,y,r);
        const hue = 210 + i*8; // tight blue range (Apex)
        g.addColorStop(0, `hsla(${hue},85%,55%,0.16)`);
        g.addColorStop(0.4, `hsla(${hue+5},80%,30%,0.07)`);
        g.addColorStop(1, 'rgba(5,7,13,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0,0,w,h);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    function drawParticles(time){
      const ctx = particlesLayer.ctx; const w = particlesLayer.c.width / DPR; const h = particlesLayer.c.height / DPR;
      ctx.clearRect(0,0,w,h);
      ctx.globalCompositeOperation = 'lighter';
      for (let i=0;i<particles.length;i++){
        const p = particles[i];
        // subtle orbiting motion
        p.x += p.vx + Math.sin(time*0.0005 + i) * 0.0005;
        p.y += p.vy + Math.cos(time*0.0004 + i) * 0.0005;
        if (p.x < -0.05) p.x = 1.05; if (p.x > 1.05) p.x = -0.05;
        if (p.y < -0.05) p.y = 1.05; if (p.y > 1.05) p.y = -0.05;
        const px = p.x * w; const py = p.y * h;
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    function drawLines(time){
      const ctx = linesLayer.ctx; const w = linesLayer.c.width / DPR; const h = linesLayer.c.height / DPR;
      ctx.clearRect(0,0,w,h);
      for (let i=0;i<lines.length;i++){
        const L = lines[i];
        const pts = L.pts;
        // animate points
        for (let j=0;j<pts.length;j++){
          pts[j].x += Math.sin(time * (0.0002 + j*0.0001) + i + j) * 0.0006 * Math.cos(i+j);
          pts[j].y += Math.cos(time * (0.00018 + j*0.00012) + i + j) * 0.0005 * Math.sin(i+j);
          if (pts[j].x < 0) pts[j].x = 1; if (pts[j].x > 1) pts[j].x = 0;
          if (pts[j].y < 0) pts[j].y = 1; if (pts[j].y > 1) pts[j].y = 0;
        }

        ctx.save();
        ctx.lineWidth = Math.max(1, Math.min(w,h) * 0.0025);
        ctx.strokeStyle = `hsla(${L.colorHue},90%,60%,0.12)`;
        ctx.shadowColor = `hsla(${L.colorHue},95%,70%,0.25)`;
        ctx.shadowBlur = 40;
        ctx.beginPath();
        const s0 = pts[0]; ctx.moveTo(s0.x * w, s0.y * h);
        for (let k=1;k<pts.length;k++){
          const p = pts[k]; const prev = pts[k-1];
          const cx = (prev.x + p.x) / 2; const cy = (prev.y + p.y) / 2;
          ctx.quadraticCurveTo(prev.x*w, prev.y*h, cx*w, cy*h);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    function frame(t){
      drawGradient(t);
      drawSpots(t);
      drawParticles(t);
      drawLines(t);
      raf = requestAnimationFrame(frame);
    }

    // initial resize
    [gradientLayer, spotsLayer, particlesLayer, linesLayer].forEach(resizeCanvas);

    let raf = requestAnimationFrame(frame);

    window.addEventListener('resize', () => {
      [gradientLayer, spotsLayer, particlesLayer, linesLayer].forEach(resizeCanvas);
    });

    // Optional: stop canvas if reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      cancelAnimationFrame(raf);
      gradientLayer.ctx.clearRect(0,0,gradientLayer.c.width, gradientLayer.c.height);
    }

  });
})();
