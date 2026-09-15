/**
 * PawPal Speech & Dialogue Manager
 * Context-aware thoughts, breed-specific personalities, and care prompts.
 */
class PawPalSpeech {
  constructor(petEngine) {
    this.pet = petEngine;
    this.bubbleElement = null;
    this.hideTimeout = null;

    this.dialogues = {
      idle: [
        "What are we browsing today, hooman? 🐾",
        "10/10 best companion right here! ✨",
        "Sniff sniff... smells like great code! 🐶",
        "Don't forget to stay hydrated too! 💧",
        "Just keeping you company while you work! ❤️",
        "I believe in you! You got this! 🌟",
        "Look at all those tabs you have open! 📑",
        "*happy tail wags* 🐾"
      ],
      idle_panda: [
        "Munch munch... fresh bamboo is the best! 🎋✨",
        "*panda roll* Look at my round belly! 🐼❤️",
        "Just a chubby baby panda hanging out! 🌿",
        "Panda cuddle power: 100%! 🐼✨",
        "Did somebody bring bamboo treats?! 🎋😋"
      ],
      idle_shiba: [
        "Much code! Very smart! Wow! 🐕✨",
        "Shiba drill mode standing by! 🌪️",
        "Paws ready for adventure! 🐾",
        "Such browser! Very companion! ✨"
      ],
      idle_corgi: [
        "*wiggle wiggle* Look at my corgi loaf! 🍞✨",
        "Short legs, big heart! 🐶❤️",
        "Ready to zoom across the screen! ⚡",
        "Splooting mode activated! 🐾"
      ],
      idle_neko: [
        "Purrrr... you may pet me, hooman! 🐱✨",
        "Nyan! Inspecting your mouse cursor! 🐾",
        "If it fits, I sits! 📦",
        "Meow! Taking a cute break from catching bugs! 🐞"
      ],
      idle_golden: [
        "You are my absolute favorite human! 🐕‍🦺❤️",
        "I brought you 100% positive vibes! ✨",
        "*floppy ear wiggle* Hugs please! 🤗",
        "Best day ever hanging out with you! 🌟"
      ],
      hungry: [
        "My tummy is doing the rumbly grumble! 🍖🥺",
        "Sniff... is that bacon? Feed me please! 🥓",
        "Treats? Did somebody whisper treats?! 🥩",
        "Hooman... I requires nourishment! 🥺💧"
      ],
      thirsty: [
        "Pawtner, could I get some fresh water? 💧",
        "*pant pant* Super thirsty! 🚰",
        "Water bowl is looking kinda empty... 🐕💧"
      ],
      crying: [
        "*whimper* Don't forget about me... 😢",
        "*sniffle* I'm super hungry and sad... 🥺💔",
        "Please feed and pet me hooman! 🍖💧",
        "Look at my big sad puppy eyes! 🥺"
      ],
      tickle: [
        "AHAHAHA THAT TICKLES!! 😂🐾",
        "Nooo not the belly tickles! hehehe! 🐶✨",
        "Hehehe stop tickling my paws! 🪶😆",
        "*giggle snort* Best belly rubs ever! 🥰"
      ],
      dragged: [
        "Woah! Flying companion mode activated! 🚀",
        "Wheeeee! Where are we flying to?! ✨",
        "Hold onto my scruff gently! 🐾",
        "I believe I can flyyy! 🐕💨",
        "Put me down on solid ground, chief!"
      ],
      chasing: [
        "GET THE TOY!! 🦋⚡",
        "I'm so fast! Nyoooom! 💨",
        "Almost caught it!! 🐾",
        "You can't outrun the mighty pup! 🐶"
      ],
      begging: [
        "Please please please treat?! 🍖🥺✨",
        "*waving cute paws* Look how good I am! 🐾",
        "One tiny snack for the goodest pet? 🥩"
      ],
      eating: [
        "Nom nom nom! Delicious! 🍖✨",
        "CRUNCH CRUNCH! Best treat ever! 🥩",
        "Yummy in my tummy! 😋"
      ],
      drinking: [
        "Slurp slurp slurp! Ahhh, refreshing! 💧",
        "10/10 crisp water! 🌊"
      ],
      sleeping: [
        "Zzz... dreaming of giant treats... 🦴",
        "Zzz... 5 more minutes mommy... 💤",
        "Zzz... chasing dream butterflies... 🦋"
      ],
      petted: [
        "Awww yesss, right behind the ears! ❤️",
        "I love you hooman! Best friend forever! 🌟",
        "*melting into a happy puddle* 🥰",
        "Heart: 100% full! ✨"
      ]
    };
  }

  setBubbleElement(el) {
    this.bubbleElement = el;
  }

  showThought(category, customText = null, duration = 4200) {
    if (!this.bubbleElement) return;

    let text = customText;
    if (!text) {
      // Check if breed specific dialogue exists
      const breed = this.pet && this.pet.breed ? this.pet.breed : 'shiba';
      const breedKey = `${category}_${breed}`;
      let pool = this.dialogues[breedKey] || this.dialogues[category] || this.dialogues.idle;
      text = pool[Math.floor(Math.random() * pool.length)];
    }

    this.bubbleElement.textContent = text;
    this.bubbleElement.classList.add('pawpal-visible');

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    this.hideTimeout = setTimeout(() => {
      this.hideThought();
    }, duration);
  }

  hideThought() {
    if (this.bubbleElement) {
      this.bubbleElement.classList.remove('pawpal-visible');
    }
  }
}

window.PawPalSpeech = PawPalSpeech;
