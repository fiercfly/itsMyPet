/**
 * PawPal Character Renderer
 * Manages the High-DPI Canvas Rigging instance, breed switching, and overlays.
 */
class PawPalRenderer {
  constructor() {
    this.canvas = null;
    this.rig = null;
  }

  createCanvasElement() {
    const canvas = document.createElement('canvas');
    canvas.className = 'pawpal-canvas';
    // 2x Retina resolution
    canvas.width = 240;
    canvas.height = 240;
    canvas.style.width = '120px';
    canvas.style.height = '120px';
    this.canvas = canvas;
    this.rig = new window.HandcraftedPuppyRig(canvas);
    return canvas;
  }

  setBreed(breedName) {
    if (this.rig) {
      this.rig.setBreed(breedName);
    }
  }

  update(dt, state, facingLeft, vx, vy, isGrounded, isDragging, mouseX, mouseY, petX, petY) {
    if (!this.rig) return;

    let rigState = 'IDLE';
    if (state === 'DRAGGED_SCRUFF' || isDragging) rigState = 'DRAG';
    else if (state === 'SLEEPING') rigState = 'SLEEP';
    else if (state === 'CRYING') rigState = 'CRY';
    else if (state === 'TICKLE_LAUGH') rigState = 'TICKLE';
    else if (state === 'BEGGING') rigState = 'BEG';
    else if (state === 'STRETCHING') rigState = 'STRETCH';
    else if (state === 'RUN_CHASE') rigState = 'RUN';
    else if (state === 'WALK') rigState = 'WALK';
    else if (state === 'EATING' || state === 'DRINKING') rigState = 'EAT';

    this.rig.state = rigState;
    this.rig.facingLeft = facingLeft;
    this.rig.setEyeTarget(mouseX, mouseY, petX, petY);
    this.rig.update(dt, vx, vy, isGrounded, isDragging);
    this.rig.draw();
  }

  triggerLandSquash() {
    // Petdex sprites have natural built-in physics frames
  }

  triggerClickSquash() {
    // Petdex sprites have natural built-in physics frames
  }
}

window.PawPalRenderer = PawPalRenderer;
