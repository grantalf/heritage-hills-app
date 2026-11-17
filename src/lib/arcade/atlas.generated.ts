// Made by scripts/make_sprites.mts. Do not edit by hand. Run `npm run sprites`.
export const STORE_SCALE = 3;
export const ATLAS = {
 "hero": {
  "id": "hero",
  "cw": 64,
  "ch": 62,
  "ax": 26,
  "ay": 53,
  "cols": 8,
  "rows": 3,
  "count": 17,
  "anims": {
   "idle": {
    "from": 0,
    "count": 2,
    "fps": 3,
    "loop": true
   },
   "walk": {
    "from": 2,
    "count": 4,
    "fps": 9,
    "loop": true
   },
   "attack1": {
    "from": 6,
    "count": 2,
    "fps": 14,
    "loop": false
   },
   "attack2": {
    "from": 8,
    "count": 2,
    "fps": 14,
    "loop": false
   },
   "attack3": {
    "from": 10,
    "count": 3,
    "fps": 12,
    "loop": false
   },
   "hurt": {
    "from": 13,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "down": {
    "from": 14,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "cheer": {
    "from": 15,
    "count": 2,
    "fps": 5,
    "loop": true
   }
  }
 },
 "shambler": {
  "id": "shambler",
  "cw": 56,
  "ch": 56,
  "ax": 22,
  "ay": 50,
  "cols": 8,
  "rows": 2,
  "count": 9,
  "anims": {
   "idle": {
    "from": 0,
    "count": 2,
    "fps": 3,
    "loop": true
   },
   "walk": {
    "from": 2,
    "count": 4,
    "fps": 6,
    "loop": true
   },
   "wind": {
    "from": 6,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "attack": {
    "from": 7,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "hurt": {
    "from": 8,
    "count": 1,
    "fps": 1,
    "loop": false
   }
  }
 },
 "shamblerFrost": {
  "id": "shamblerFrost",
  "cw": 56,
  "ch": 56,
  "ax": 22,
  "ay": 50,
  "cols": 8,
  "rows": 2,
  "count": 9,
  "anims": {
   "idle": {
    "from": 0,
    "count": 2,
    "fps": 3,
    "loop": true
   },
   "walk": {
    "from": 2,
    "count": 4,
    "fps": 6,
    "loop": true
   },
   "wind": {
    "from": 6,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "attack": {
    "from": 7,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "hurt": {
    "from": 8,
    "count": 1,
    "fps": 1,
    "loop": false
   }
  }
 },
 "lunger": {
  "id": "lunger",
  "cw": 56,
  "ch": 54,
  "ax": 22,
  "ay": 46,
  "cols": 8,
  "rows": 2,
  "count": 9,
  "anims": {
   "idle": {
    "from": 0,
    "count": 2,
    "fps": 3,
    "loop": true
   },
   "walk": {
    "from": 2,
    "count": 4,
    "fps": 10,
    "loop": true
   },
   "wind": {
    "from": 6,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "attack": {
    "from": 7,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "hurt": {
    "from": 8,
    "count": 1,
    "fps": 1,
    "loop": false
   }
  }
 },
 "tosser": {
  "id": "tosser",
  "cw": 44,
  "ch": 44,
  "ax": 20,
  "ay": 38,
  "cols": 8,
  "rows": 2,
  "count": 9,
  "anims": {
   "idle": {
    "from": 0,
    "count": 2,
    "fps": 3,
    "loop": true
   },
   "walk": {
    "from": 2,
    "count": 4,
    "fps": 6,
    "loop": true
   },
   "wind": {
    "from": 6,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "attack": {
    "from": 7,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "hurt": {
    "from": 8,
    "count": 1,
    "fps": 1,
    "loop": false
   }
  }
 },
 "boss": {
  "id": "boss",
  "cw": 104,
  "ch": 72,
  "ax": 44,
  "ay": 66,
  "cols": 8,
  "rows": 3,
  "count": 20,
  "anims": {
   "statue": {
    "from": 0,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "wake": {
    "from": 1,
    "count": 4,
    "fps": 8,
    "loop": false
   },
   "idle": {
    "from": 5,
    "count": 2,
    "fps": 3,
    "loop": true
   },
   "walk": {
    "from": 7,
    "count": 4,
    "fps": 6,
    "loop": true
   },
   "wind": {
    "from": 11,
    "count": 2,
    "fps": 6,
    "loop": true
   },
   "charge": {
    "from": 13,
    "count": 2,
    "fps": 12,
    "loop": true
   },
   "stomp": {
    "from": 15,
    "count": 2,
    "fps": 4,
    "loop": false
   },
   "stun": {
    "from": 17,
    "count": 2,
    "fps": 4,
    "loop": true
   },
   "hurt": {
    "from": 19,
    "count": 1,
    "fps": 1,
    "loop": false
   }
  }
 },
 "dog": {
  "id": "dog",
  "cw": 40,
  "ch": 36,
  "ax": 20,
  "ay": 31,
  "cols": 8,
  "rows": 1,
  "count": 8,
  "anims": {
   "idle": {
    "from": 0,
    "count": 2,
    "fps": 3,
    "loop": true
   },
   "run": {
    "from": 2,
    "count": 4,
    "fps": 12,
    "loop": true
   },
   "cheer": {
    "from": 6,
    "count": 2,
    "fps": 6,
    "loop": true
   }
  }
 },
 "squirrel": {
  "id": "squirrel",
  "cw": 40,
  "ch": 36,
  "ax": 20,
  "ay": 31,
  "cols": 8,
  "rows": 1,
  "count": 8,
  "anims": {
   "idle": {
    "from": 0,
    "count": 2,
    "fps": 3,
    "loop": true
   },
   "run": {
    "from": 2,
    "count": 4,
    "fps": 12,
    "loop": true
   },
   "cheer": {
    "from": 6,
    "count": 2,
    "fps": 6,
    "loop": true
   }
  }
 },
 "armadillo": {
  "id": "armadillo",
  "cw": 40,
  "ch": 36,
  "ax": 20,
  "ay": 31,
  "cols": 8,
  "rows": 1,
  "count": 8,
  "anims": {
   "idle": {
    "from": 0,
    "count": 2,
    "fps": 3,
    "loop": true
   },
   "run": {
    "from": 2,
    "count": 4,
    "fps": 12,
    "loop": true
   },
   "cheer": {
    "from": 6,
    "count": 2,
    "fps": 6,
    "loop": true
   }
  }
 },
 "cottontail": {
  "id": "cottontail",
  "cw": 40,
  "ch": 36,
  "ax": 20,
  "ay": 31,
  "cols": 8,
  "rows": 1,
  "count": 8,
  "anims": {
   "idle": {
    "from": 0,
    "count": 2,
    "fps": 3,
    "loop": true
   },
   "run": {
    "from": 2,
    "count": 4,
    "fps": 12,
    "loop": true
   },
   "cheer": {
    "from": 6,
    "count": 2,
    "fps": 6,
    "loop": true
   }
  }
 },
 "props": {
  "id": "props",
  "cw": 60,
  "ch": 36,
  "ax": 30,
  "ay": 32,
  "cols": 6,
  "rows": 1,
  "count": 6,
  "anims": {
   "cage": {
    "from": 0,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "cageOpen": {
    "from": 1,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "pedestal": {
    "from": 2,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "snack": {
    "from": 3,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "shot": {
    "from": 4,
    "count": 2,
    "fps": 8,
    "loop": true
   }
  }
 },
 "fx": {
  "id": "fx",
  "cw": 36,
  "ch": 32,
  "ax": 18,
  "ay": 28,
  "cols": 8,
  "rows": 2,
  "count": 9,
  "anims": {
   "poof": {
    "from": 0,
    "count": 4,
    "fps": 12,
    "loop": false
   },
   "hit": {
    "from": 4,
    "count": 3,
    "fps": 16,
    "loop": false
   },
   "dizzy": {
    "from": 7,
    "count": 2,
    "fps": 6,
    "loop": true
   }
  }
 },
 "backdrop": {
  "id": "backdrop",
  "cw": 128,
  "ch": 48,
  "ax": 0,
  "ay": 48,
  "cols": 2,
  "rows": 1,
  "count": 2,
  "anims": {
   "far": {
    "from": 0,
    "count": 1,
    "fps": 1,
    "loop": false
   },
   "near": {
    "from": 1,
    "count": 1,
    "fps": 1,
    "loop": false
   }
  }
 }
} as const;
export type SheetId = keyof typeof ATLAS;
