/**
 * PawPal Custom Procedural Pet Canvas Rig
 * 
 * High-performance, pure procedural 2D canvas animation engine.
 * - 100% consistent sizing & anchor alignment across all states (zero jump / scale morphing)
 * - Articulated skeletal joints: head tilt, eye tracking, ear spring physics, 4-paw trot cycles, harmonic tail wagging
 * - 6 distinct handcrafted breeds: Orange Tabby Cat, Shiba Inu, Mocha Corgi, Tuxedo Cat, White Puppy, Panda
 * - Dynamic facial expressions: natural blinking, smiling, heart eyes, crying, chewing mouth
 */

class CustomProceduralPetRig {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Selected Breed (default: big-orange-cat)
    this.petSlug = 'big-orange-cat';

    // State Machine: 'IDLE', 'WALK', 'RUN', 'DRAG', 'EAT', 'SLEEP', 'HAPPY', 'TICKLE', 'BEG', 'STRETCH', 'CRY'
    this.state = 'IDLE';
    this.facingLeft = false;

    // Animation Time & Cycles
    this.time = 0;
    this.walkCycle = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.nextBlinkTime = 2.5 + Math.random() * 2;

    // Physics & Joint Interpolations
    this.eyeTargetX = 0;
    this.eyeTargetY = 0;
    this.curEyeX = 0;
    this.curEyeY = 0;
    this.headTilt = 0;
    this.targetHeadTilt = 0;
    this.earBend = 0;
    this.tailAngle = 0;
    this.tailSpeed = 3.5;
    this.scruffSwing = 0;
    this.scruffSwingVel = 0;
    this.chewCycle = 0;

    // Multi-Breed Configuration Registry
    this.registry = {
      'big-orange-cat': {
        species: 'cat',
        name: 'Orange Cat',
        primaryColor: '#F97316',
        secondaryColor: '#EA580C',
        stripeColor: '#C2410C',
        bellyColor: '#FFFDF5',
        earInnerColor: '#FDA4AF',
        eyeColor: '#F59E0B',
        noseColor: '#FB7185',
        tailType: 'cat-long',
        earType: 'cat-pointy',
        bodyType: 'chubby-cat',
        hasStripes: true,
        voice: 'cat'
      },
      'shiba-4': {
        species: 'dog',
        name: 'Shiba Inu',
        primaryColor: '#E59837',
        secondaryColor: '#D97706',
        stripeColor: null,
        bellyColor: '#FFFDF5',
        earInnerColor: '#FBBF24',
        eyeColor: '#451A03',
        noseColor: '#1E293B',
        tailType: 'shiba-curly',
        earType: 'dog-pointy',
        bodyType: 'shiba',
        hasEyebrowSpots: true,
        voice: 'dog'
      },
      'mocha': {
        species: 'dog',
        name: 'Mocha Corgi',
        primaryColor: '#F59E0B',
        secondaryColor: '#D97706',
        stripeColor: null,
        bellyColor: '#FFFDF5',
        earInnerColor: '#FDA4AF',
        eyeColor: '#38200E',
        noseColor: '#0F172A',
        tailType: 'corgi-stubby',
        earType: 'corgi-giant',
        bodyType: 'corgi',
        hasEyebrowSpots: true,
        voice: 'dog'
      },
      'suketi-the-cat': {
        species: 'cat',
        name: 'Tuxedo Cat',
        primaryColor: '#1E293B',
        secondaryColor: '#0F172A',
        stripeColor: null,
        bellyColor: '#FFFFFF',
        earInnerColor: '#FDA4AF',
        eyeColor: '#10B981',
        noseColor: '#FB7185',
        tailType: 'cat-long',
        earType: 'cat-pointy',
        bodyType: 'sleek-cat',
        hasTuxedoBib: true,
        voice: 'cat'
      },
      'white-dog': {
        species: 'dog',
        name: 'White Puppy',
        primaryColor: '#FFFFFF',
        secondaryColor: '#F1F5F9',
        stripeColor: null,
        bellyColor: '#F8FAFC',
        earInnerColor: '#FECDD3',
        eyeColor: '#0F172A',
        noseColor: '#0F172A',
        tailType: 'dog-plume',
        earType: 'dog-floppy',
        bodyType: 'fluffy-pup',
        hasFluffTufts: true,
        voice: 'dog'
      },
      'hua-hua-panda': {
        species: 'panda',
        name: 'Hua Hua Panda',
        primaryColor: '#FFFFFF',
        secondaryColor: '#1E293B',
        stripeColor: null,
        bellyColor: '#FFFFFF',
        earInnerColor: '#0F172A',
        eyeColor: '#0F172A',
        noseColor: '#0F172A',
        tailType: 'panda-nub',
        earType: 'panda-round',
        bodyType: 'panda',
        hasPandaPatches: true,
        voice: 'panda'
      }
    };
  }

  setBreed(slug) {
    if (this.registry[slug]) {
      this.petSlug = slug;
    } else {
      this.petSlug = 'big-orange-cat';
    }
  }

  setEyeTarget(mouseX, mouseY, petX, petY) {
    const dx = mouseX - (petX + 60);
    const dy = mouseY - (petY + 60);
    const dist = Math.hypot(dx, dy);

    if (dist > 1) {
      const maxEyeOffset = 4;
      this.eyeTargetX = (dx / dist) * Math.min(maxEyeOffset, dist * 0.03);
      this.eyeTargetY = (dy / dist) * Math.min(maxEyeOffset, dist * 0.03);
      this.targetHeadTilt = Math.max(-0.12, Math.min(0.12, dx * 0.0008));
    } else {
      this.eyeTargetX = 0;
      this.eyeTargetY = 0;
      this.targetHeadTilt = 0;
    }
  }

  triggerSquash(sx, sy) {
    // Kept for interface compatibility
  }

  update(dt, vx, vy, isGrounded, isDragging) {
    this.time += dt;

    // Natural Eye Blinking cycle
    this.blinkTimer += dt;
    if (this.blinkTimer > this.nextBlinkTime) {
      this.isBlinking = true;
      if (this.blinkTimer > this.nextBlinkTime + 0.16) {
        this.isBlinking = false;
        this.blinkTimer = 0;
        this.nextBlinkTime = 2.8 + Math.random() * 3.2;
      }
    }

    // Smooth Eye & Head Tilt Tracking
    this.curEyeX += (this.eyeTargetX - this.curEyeX) * 0.18;
    this.curEyeY += (this.eyeTargetY - this.curEyeY) * 0.18;
    this.headTilt += (this.targetHeadTilt - this.headTilt) * 0.14;

    // Trot Walk Cycle Rate
    if (this.state === 'RUN') {
      this.walkCycle += dt * 14;
      this.tailSpeed = 16;
      this.earBend += (0.18 - this.earBend) * 0.15;
    } else if (this.state === 'WALK') {
      this.walkCycle += dt * 8.5;
      this.tailSpeed = 8;
      this.earBend += (0.05 - this.earBend) * 0.15;
    } else {
      this.walkCycle = 0;
      this.tailSpeed = this.state === 'HAPPY' || this.state === 'TICKLE' ? 12 : 3.5;
      this.earBend += (0 - this.earBend) * 0.15;
    }

    // Ear and Tail harmonic oscillation
    this.tailAngle = Math.sin(this.time * this.tailSpeed) * (this.state === 'SLEEP' ? 0.1 : 0.35);

    // Chew cycle for Eating
    if (this.state === 'EAT') {
      this.chewCycle += dt * 10;
    } else {
      this.chewCycle = 0;
    }

    // Scruff Dangling Swing Physics
    if (this.state === 'DRAG' || isDragging) {
      const targetSwing = -vx * 0.07;
      this.scruffSwingVel += (targetSwing - this.scruffSwing) * 0.16;
      this.scruffSwingVel *= 0.88;
      this.scruffSwing += this.scruffSwingVel;
    } else {
      this.scruffSwing += (0 - this.scruffSwing) * 0.2;
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const pet = this.registry[this.petSlug] || this.registry['big-orange-cat'];

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Constant ground baseline anchor
    ctx.translate(w / 2, h - 22);

    // Facing direction
    if (this.facingLeft) {
      ctx.scale(-1, 1);
    }

    // Drag swing rotation
    if (this.state === 'DRAG') {
      ctx.rotate(this.scruffSwing);
    }

    // 1. Soft Ambient Ground Shadow
    if (this.state !== 'DRAG') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
      ctx.beginPath();
      const shadowW = this.state === 'SLEEP' ? 52 : (this.state === 'WALK' || this.state === 'RUN' ? 44 : 40);
      const shadowH = 7;
      ctx.ellipse(0, 4, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Procedural Breathing & Bob Physics
    const isMoving = this.state === 'WALK' || this.state === 'RUN';
    const isSleeping = this.state === 'SLEEP';
    const isEating = this.state === 'EAT';
    const isHappy = this.state === 'HAPPY' || this.state === 'TICKLE';

    const breathe = isSleeping 
      ? Math.sin(this.time * 2.2) * 2.5 
      : Math.sin(this.time * 3.2) * 1.2;
    
    const bodyBob = isMoving 
      ? Math.abs(Math.sin(this.walkCycle)) * (this.state === 'RUN' ? 5 : 3) 
      : 0;

    // Draw Sleeping Posture
    if (isSleeping) {
      this.drawSleepingPet(ctx, pet, breathe);
      ctx.restore();
      return;
    }

    // Draw Upright / Trotting Pet Posture
    this.drawActivePet(ctx, pet, breathe, bodyBob, isMoving, isEating, isHappy);

    ctx.restore();
  }

  // ============================================================
  // ACTIVE PET RENDERING (Idle, Walk, Run, Play, Eat, Scruff)
  // ============================================================

  drawActivePet(ctx, pet, breathe, bodyBob, isMoving, isEating, isHappy) {
    const time = this.time;
    const walk = this.walkCycle;

    ctx.save();
    ctx.translate(0, -bodyBob);

    // 1. Tail (Behind Body)
    this.drawTail(ctx, pet);

    // 2. Back Legs / Paws
    this.drawLegs(ctx, pet, walk, isMoving, true);

    // 3. Main Torso / Body
    this.drawBody(ctx, pet, breathe);

    // 4. Front Legs / Paws
    this.drawLegs(ctx, pet, walk, isMoving, false);

    // 5. Head, Ears & Face
    this.drawHeadAndFace(ctx, pet, breathe, isEating, isHappy);

    // 6. Active Item / Treat if Eating
    if (isEating) {
      this.drawTreatItem(ctx, pet);
    }

    ctx.restore();
  }

  // ============================================================
  // TAIL RENDERING
  // ============================================================

  drawTail(ctx, pet) {
    ctx.save();
    const tailBaseX = -26;
    const tailBaseY = -34;
    ctx.translate(tailBaseX, tailBaseY);
    ctx.rotate(this.tailAngle);

    if (pet.tailType === 'shiba-curly') {
      // Donut Curly Shiba Tail
      ctx.strokeStyle = pet.primaryColor;
      ctx.lineWidth = 11;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-8, -12, 12, 0.4, Math.PI * 1.8, false);
      ctx.stroke();

      // White tail tip
      ctx.strokeStyle = '#FFFDF5';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(-8, -12, 12, Math.PI * 1.2, Math.PI * 1.8, false);
      ctx.stroke();
    } else if (pet.tailType === 'corgi-stubby') {
      // Cute Little Corgi Tail Nub
      ctx.fillStyle = pet.primaryColor;
      ctx.beginPath();
      ctx.ellipse(-4, -4, 8, 6, -0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (pet.tailType === 'panda-nub') {
      // Round Little Panda Tail Nub
      ctx.fillStyle = pet.secondaryColor;
      ctx.beginPath();
      ctx.arc(-3, -2, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (pet.tailType === 'dog-plume') {
      // Fluffy Dog Plume Tail
      ctx.strokeStyle = pet.primaryColor;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-18, -18, -14, -34);
      ctx.stroke();
    } else {
      // Sleek Curved Cat Tail
      ctx.strokeStyle = pet.primaryColor;
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-16, -10, -26, -26, -20, -42);
      ctx.stroke();

      // Cat Tail Tip
      if (pet.secondaryColor && pet.hasStripes) {
        ctx.strokeStyle = pet.secondaryColor;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(-22, -36);
        ctx.lineTo(-20, -42);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ============================================================
  // LEGS & TROT CYCLE
  // ============================================================

  drawLegs(ctx, pet, walkCycle, isMoving, isBackPair) {
    ctx.save();
    const legColor = isBackPair ? (pet.secondaryColor || pet.primaryColor) : pet.primaryColor;
    ctx.fillStyle = legColor;

    const xOffset = isBackPair ? -18 : 14;
    const yBase = -10;

    let legLiftA = 0;
    let legLiftB = 0;

    if (this.state === 'DRAG') {
      // Dangling relaxed paws
      legLiftA = 6;
      legLiftB = 4;
    } else if (isMoving) {
      const phase = isBackPair ? 0 : Math.PI;
      legLiftA = Math.sin(walkCycle + phase) * (this.state === 'RUN' ? 7 : 5);
      legLiftB = Math.sin(walkCycle + phase + Math.PI * 0.5) * (this.state === 'RUN' ? 7 : 5);
    }

    // Left Paw in pair
    ctx.beginPath();
    ctx.roundRect(xOffset - 6, yBase - 12 + Math.max(0, -legLiftA), 10, 16 + Math.min(0, legLiftA), 5);
    ctx.fill();

    // White socks if cat
    if (pet.bellyColor && (pet.hasTuxedoBib || pet.hasStripes)) {
      ctx.fillStyle = pet.bellyColor;
      ctx.beginPath();
      ctx.roundRect(xOffset - 6, yBase + 1 + Math.max(0, -legLiftA), 10, 5, 2);
      ctx.fill();
      ctx.fillStyle = legColor;
    }

    // Right Paw in pair
    const rightX = xOffset + (isBackPair ? 10 : 8);
    ctx.beginPath();
    ctx.roundRect(rightX - 6, yBase - 12 + Math.max(0, -legLiftB), 10, 16 + Math.min(0, legLiftB), 5);
    ctx.fill();

    if (pet.bellyColor && (pet.hasTuxedoBib || pet.hasStripes)) {
      ctx.fillStyle = pet.bellyColor;
      ctx.beginPath();
      ctx.roundRect(rightX - 6, yBase + 1 + Math.max(0, -legLiftB), 10, 5, 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ============================================================
  // MAIN BODY / TORSO
  // ============================================================

  drawBody(ctx, pet, breathe) {
    ctx.save();
    ctx.translate(0, -32);

    // Body Capsule
    ctx.fillStyle = pet.primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 34 + breathe * 0.6, 26 + breathe * 0.4, -0.04, 0, Math.PI * 2);
    ctx.fill();

    // Panda Black Vest / Shoulder Belt
    if (pet.hasPandaPatches) {
      ctx.fillStyle = pet.secondaryColor;
      ctx.beginPath();
      ctx.ellipse(-10, 0, 18, 26, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cream Belly Patch
    if (pet.bellyColor && !pet.hasPandaPatches) {
      ctx.fillStyle = pet.bellyColor;
      ctx.beginPath();
      ctx.ellipse(4, 3, 20 + breathe * 0.4, 17, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tiger / Tabby Coat Stripes
    if (pet.hasStripes && pet.stripeColor) {
      ctx.strokeStyle = pet.stripeColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      // Back stripes
      ctx.beginPath();
      ctx.moveTo(-16, -18);
      ctx.lineTo(-12, -4);
      ctx.moveTo(-8, -22);
      ctx.lineTo(-4, -6);
      ctx.moveTo(2, -22);
      ctx.lineTo(4, -8);
      ctx.stroke();
    }

    // Tuxedo Cat White Bib
    if (pet.hasTuxedoBib) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(12, -18);
      ctx.lineTo(24, 0);
      ctx.lineTo(6, 12);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // ============================================================
  // HEAD, EARS & EXPRESSIVE FACE
  // ============================================================

  drawHeadAndFace(ctx, pet, breathe, isEating, isHappy) {
    ctx.save();
    const headX = 14;
    const headY = -48 + breathe * 0.4;
    ctx.translate(headX, headY);
    ctx.rotate(this.headTilt);

    // 1. Ears (Behind or on top of head)
    this.drawEars(ctx, pet);

    // 2. Main Head Sphere
    ctx.fillStyle = pet.primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 23, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Breed-specific face markings
    if (pet.hasEyebrowSpots) {
      // Shiba Inu White Cheeks & Eyebrow dots
      ctx.fillStyle = '#FFFDF5';
      ctx.beginPath();
      // Left cheek puff
      ctx.ellipse(-10, 6, 10, 8, 0.2, 0, Math.PI * 2);
      // Right cheek puff
      ctx.ellipse(10, 6, 10, 8, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Cute white eyebrow dots
      ctx.beginPath();
      ctx.arc(-8, -12, 3.2, 0, Math.PI * 2);
      ctx.arc(8, -12, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (pet.hasPandaPatches) {
      // Panda Black Eye Patches
      ctx.fillStyle = pet.secondaryColor;
      ctx.beginPath();
      ctx.ellipse(-9, -2, 7.5, 9.5, -0.35, 0, Math.PI * 2);
      ctx.ellipse(9, -2, 7.5, 9.5, 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    if (pet.hasStripes && pet.stripeColor) {
      // Cat Forehead M-stripes
      ctx.strokeStyle = pet.stripeColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-6, -18);
      ctx.lineTo(-3, -11);
      ctx.lineTo(0, -16);
      ctx.lineTo(3, -11);
      ctx.lineTo(6, -18);
      ctx.stroke();
    }

    // 4. Blushing Cheeks
    ctx.fillStyle = isHappy ? 'rgba(251, 113, 133, 0.65)' : 'rgba(251, 113, 133, 0.35)';
    ctx.beginPath();
    ctx.ellipse(-15, 6, 6, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(15, 6, 6, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Expressive Eyes
    this.drawEyes(ctx, pet, isHappy);

    // 6. Cute Nose & Mouth
    this.drawMuzzleAndMouth(ctx, pet, isEating, isHappy);

    ctx.restore();
  }

  // ============================================================
  // EARS
  // ============================================================

  drawEars(ctx, pet) {
    ctx.save();
    const bend = this.earBend;

    if (pet.earType === 'panda-round') {
      // Round Panda Ears
      ctx.fillStyle = pet.secondaryColor;
      ctx.beginPath();
      ctx.arc(-18, -20, 10, 0, Math.PI * 2);
      ctx.arc(18, -20, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (pet.earType === 'corgi-giant') {
      // Big Perky Corgi Ears
      ctx.fillStyle = pet.primaryColor;
      // Left Ear
      ctx.beginPath();
      ctx.ellipse(-18 - bend * 10, -28, 11, 20, -0.45 - bend, 0, Math.PI * 2);
      ctx.fill();
      // Right Ear
      ctx.beginPath();
      ctx.ellipse(18 - bend * 10, -28, 11, 20, 0.45 - bend, 0, Math.PI * 2);
      ctx.fill();

      // Inner pink
      ctx.fillStyle = pet.earInnerColor || '#FDA4AF';
      ctx.beginPath();
      ctx.ellipse(-18 - bend * 10, -27, 6.5, 14, -0.45 - bend, 0, Math.PI * 2);
      ctx.ellipse(18 - bend * 10, -27, 6.5, 14, 0.45 - bend, 0, Math.PI * 2);
      ctx.fill();
    } else if (pet.earType === 'dog-floppy') {
      // Floppy Puppy Ears
      ctx.fillStyle = pet.primaryColor;
      ctx.beginPath();
      ctx.ellipse(-20, -10 + bend * 5, 9, 15, 0.35, 0, Math.PI * 2);
      ctx.ellipse(20, -10 + bend * 5, 9, 15, -0.35, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Pointed Cat & Shiba Triangular Ears
      ctx.fillStyle = pet.primaryColor;

      // Left Ear
      ctx.beginPath();
      ctx.moveTo(-20, -10);
      ctx.lineTo(-26 - bend * 8, -36);
      ctx.lineTo(-6, -22);
      ctx.closePath();
      ctx.fill();

      // Right Ear
      ctx.beginPath();
      ctx.moveTo(20, -10);
      ctx.lineTo(26 - bend * 8, -36);
      ctx.lineTo(6, -22);
      ctx.closePath();
      ctx.fill();

      // Inner Ear Pink
      ctx.fillStyle = pet.earInnerColor || '#FDA4AF';
      ctx.beginPath();
      ctx.moveTo(-18, -12);
      ctx.lineTo(-23 - bend * 8, -31);
      ctx.lineTo(-8, -21);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(18, -12);
      ctx.lineTo(23 - bend * 8, -31);
      ctx.lineTo(8, -21);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // ============================================================
  // EYES
  // ============================================================

  drawEyes(ctx, pet, isHappy) {
    ctx.save();
    const eyeOffsetX = this.curEyeX;
    const eyeOffsetY = this.curEyeY;

    if (this.isBlinking) {
      // Closed blinking eye lines
      ctx.strokeStyle = pet.eyeColor || '#0F172A';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.quadraticCurveTo(-9, 4, -4, 0);
      ctx.moveTo(4, 0);
      ctx.quadraticCurveTo(9, 4, 14, 0);
      ctx.stroke();
    } else if (isHappy) {
      // Sweet Happy Squint Arcs (^ ‿ ^)
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-14, 2);
      ctx.quadraticCurveTo(-9, -6, -4, 2);
      ctx.moveTo(4, 2);
      ctx.quadraticCurveTo(9, -6, 14, 2);
      ctx.stroke();
    } else if (this.state === 'CRY') {
      // Teardrop Sad Eyes
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(-9, 0, 4.5, 0, Math.PI * 2);
      ctx.arc(9, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Glistening Tears
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(-11, 4, 3, 0, Math.PI * 2);
      ctx.arc(11, 4, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Sparkling Kawaii Eyes
      const eyeL_X = -9;
      const eyeR_X = 9;
      const eyeY = -1;

      // White Sclera for Panda & Tuxedo
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(eyeL_X, eyeY, 5.5, 6.5, 0, 0, Math.PI * 2);
      ctx.ellipse(eyeR_X, eyeY, 5.5, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris & Pupil
      ctx.fillStyle = pet.eyeColor || '#0F172A';
      ctx.beginPath();
      ctx.ellipse(eyeL_X + eyeOffsetX, eyeY + eyeOffsetY, 4.8, 5.8, 0, 0, Math.PI * 2);
      ctx.ellipse(eyeR_X + eyeOffsetX, eyeY + eyeOffsetY, 4.8, 5.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Big Sparkle Highlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(eyeL_X + eyeOffsetX - 1.5, eyeY + eyeOffsetY - 2, 2, 0, Math.PI * 2);
      ctx.arc(eyeR_X + eyeOffsetX - 1.5, eyeY + eyeOffsetY - 2, 2, 0, Math.PI * 2);
      ctx.fill();

      // Mini Sparkle Highlight
      ctx.beginPath();
      ctx.arc(eyeL_X + eyeOffsetX + 2, eyeY + eyeOffsetY + 2, 1, 0, Math.PI * 2);
      ctx.arc(eyeR_X + eyeOffsetX + 2, eyeY + eyeOffsetY + 2, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ============================================================
  // NOSE & MOUTH
  // ============================================================

  drawMuzzleAndMouth(ctx, pet, isEating, isHappy) {
    ctx.save();
    const noseY = 4;

    // Pink / Black Button Nose
    ctx.fillStyle = pet.noseColor || '#FB7185';
    ctx.beginPath();
    ctx.ellipse(0, noseY, 3.2, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';

    if (isEating) {
      // Chewing open mouth
      const mouthOpen = Math.abs(Math.sin(this.chewCycle)) * 5 + 2;
      ctx.fillStyle = '#FDA4AF';
      ctx.beginPath();
      ctx.ellipse(0, noseY + 4, 4, mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (isHappy) {
      // Big Happy Open Smile with Pink Tongue
      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.arc(0, noseY + 3, 5, 0.1, Math.PI - 0.1, false);
      ctx.fill();
      ctx.stroke();
    } else {
      // Cute Cat/Dog `3` Smile
      ctx.beginPath();
      ctx.moveTo(-5, noseY + 3);
      ctx.quadraticCurveTo(-2.5, noseY + 6, 0, noseY + 3);
      ctx.quadraticCurveTo(2.5, noseY + 6, 5, noseY + 3);
      ctx.stroke();
    }

    // Whiskers for Cats
    if (pet.species === 'cat') {
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      // Left whiskers
      ctx.moveTo(-14, noseY + 1);
      ctx.lineTo(-28, noseY - 2);
      ctx.moveTo(-14, noseY + 4);
      ctx.lineTo(-27, noseY + 6);
      // Right whiskers
      ctx.moveTo(14, noseY + 1);
      ctx.lineTo(28, noseY - 2);
      ctx.moveTo(14, noseY + 4);
      ctx.lineTo(27, noseY + 6);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ============================================================
  // SLEEPING PET RENDERING
  // ============================================================

  drawSleepingPet(ctx, pet, breathe) {
    ctx.save();
    ctx.translate(0, -18);

    // Curled Body Capsule
    ctx.fillStyle = pet.primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 38 + breathe * 0.8, 22 + breathe * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    if (pet.bellyColor && !pet.hasPandaPatches) {
      ctx.fillStyle = pet.bellyColor;
      ctx.beginPath();
      ctx.ellipse(-2, 3, 24 + breathe * 0.5, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Curled Tail wrapped around body
    ctx.strokeStyle = pet.primaryColor;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-18, 0, 18, 0.4, Math.PI * 1.6, false);
    ctx.stroke();

    // Sleeping Head nestled
    ctx.fillStyle = pet.primaryColor;
    ctx.beginPath();
    ctx.ellipse(18, -4 + breathe * 0.4, 18, 16, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = pet.earInnerColor || '#FDA4AF';
    ctx.beginPath();
    ctx.moveTo(22, -18);
    ctx.lineTo(30, -28);
    ctx.lineTo(14, -20);
    ctx.closePath();
    ctx.fill();

    // Peaceful Sleeping Eyes (`- -`)
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(12, -4);
    ctx.quadraticCurveTo(16, -2, 20, -4);
    ctx.stroke();

    // Nose
    ctx.fillStyle = pet.noseColor || '#FB7185';
    ctx.beginPath();
    ctx.arc(28, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ============================================================
  // TREAT / SNACK ITEM
  // ============================================================

  drawTreatItem(ctx, pet) {
    ctx.save();
    ctx.translate(26, -38);
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let item = '🍖';
    if (pet.species === 'cat') item = '🐟';
    if (pet.species === 'panda') item = '🎋';

    ctx.fillText(item, 0, Math.sin(this.time * 8) * 3);
    ctx.restore();
  }
}

window.CustomProceduralPetRig = CustomProceduralPetRig;
window.HandcraftedPuppyRig = CustomProceduralPetRig;
window.PetdexSpriteRig = CustomProceduralPetRig;
