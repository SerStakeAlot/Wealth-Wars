/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/wwars.json`.
 */
export type Wwars = {
  "address": "3MuF3DSnsg166e1EuYdF4Dc86Z1nzD8dESbqpmFVmQYd",
  "metadata": {
    "name": "wwars",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addAssetClass",
      "discriminator": [
        103,
        110,
        106,
        36,
        99,
        38,
        219,
        68
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "gameConfig"
          ]
        },
        {
          "name": "gameConfig"
        },
        {
          "name": "assetClass",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  97,
                  115,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "classId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "addAssetClassParams"
            }
          }
        }
      ]
    },
    {
      "name": "buyAsset",
      "discriminator": [
        197,
        37,
        177,
        1,
        180,
        23,
        175,
        98
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "buyer"
              }
            ]
          }
        },
        {
          "name": "gameConfig"
        },
        {
          "name": "assetClass",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  97,
                  115,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "classId"
              }
            ]
          }
        },
        {
          "name": "holding",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "assetClass"
              }
            ]
          }
        },
        {
          "name": "buyerTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "gameConfig"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "classId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "defend",
      "discriminator": [
        142,
        105,
        191,
        156,
        164,
        134,
        161,
        87
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          },
          "relations": [
            "holding"
          ]
        },
        {
          "name": "gameConfig"
        },
        {
          "name": "assetClass",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  97,
                  115,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "classId"
              }
            ]
          }
        },
        {
          "name": "holding",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "assetClass"
              }
            ]
          }
        },
        {
          "name": "ownerTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "gameConfig"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "classId",
          "type": "u64"
        },
        {
          "name": "spendAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finishUpgrade",
      "discriminator": [
        41,
        200,
        85,
        131,
        105,
        69,
        118,
        105
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          },
          "relations": [
            "holding"
          ]
        },
        {
          "name": "gameConfig"
        },
        {
          "name": "assetClass",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  97,
                  115,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "classId"
              }
            ]
          }
        },
        {
          "name": "holding",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "assetClass"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "classId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeGame",
      "discriminator": [
        44,
        62,
        102,
        247,
        126,
        208,
        130,
        215
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "wealthMint"
        },
        {
          "name": "gameConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "treasuryVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "gameConfig"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "initializeGameParams"
            }
          }
        }
      ]
    },
    {
      "name": "joinGame",
      "discriminator": [
        107,
        112,
        18,
        38,
        56,
        173,
        60,
        128
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "pause",
      "discriminator": [
        211,
        22,
        221,
        251,
        74,
        121,
        193,
        47
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "gameConfig"
          ]
        },
        {
          "name": "gameConfig",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "bool"
        }
      ]
    },
    {
      "name": "queueUpgrade",
      "discriminator": [
        114,
        107,
        111,
        117,
        192,
        153,
        170,
        59
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          },
          "relations": [
            "holding"
          ]
        },
        {
          "name": "gameConfig"
        },
        {
          "name": "assetClass",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  97,
                  115,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "classId"
              }
            ]
          }
        },
        {
          "name": "holding",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "assetClass"
              }
            ]
          }
        },
        {
          "name": "ownerTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "gameConfig"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "classId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setParams",
      "discriminator": [
        27,
        234,
        178,
        52,
        147,
        2,
        187,
        141
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "gameConfig"
          ]
        },
        {
          "name": "gameConfig",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "setParamsArgs"
            }
          }
        }
      ]
    },
    {
      "name": "takeover",
      "discriminator": [
        16,
        223,
        149,
        148,
        132,
        54,
        233,
        192
      ],
      "accounts": [
        {
          "name": "attacker",
          "writable": true,
          "signer": true
        },
        {
          "name": "attackerPlayer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "attacker"
              }
            ]
          }
        },
        {
          "name": "targetPlayer"
        },
        {
          "name": "gameConfig"
        },
        {
          "name": "assetClass",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  97,
                  115,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "classId"
              }
            ]
          }
        },
        {
          "name": "targetHolding",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "arg",
                "path": "targetPlayer"
              },
              {
                "kind": "account",
                "path": "assetClass"
              }
            ]
          }
        },
        {
          "name": "attackerTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "gameConfig"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "targetPlayer",
          "type": "pubkey"
        },
        {
          "name": "classId",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "assetClass",
      "discriminator": [
        52,
        33,
        215,
        217,
        225,
        130,
        156,
        253
      ]
    },
    {
      "name": "gameConfig",
      "discriminator": [
        45,
        146,
        146,
        33,
        170,
        69,
        96,
        133
      ]
    },
    {
      "name": "holding",
      "discriminator": [
        23,
        96,
        64,
        250,
        235,
        191,
        0,
        144
      ]
    },
    {
      "name": "player",
      "discriminator": [
        205,
        222,
        112,
        7,
        165,
        155,
        206,
        218
      ]
    }
  ],
  "events": [
    {
      "name": "assetBought",
      "discriminator": [
        46,
        228,
        125,
        137,
        14,
        243,
        92,
        136
      ]
    },
    {
      "name": "defended",
      "discriminator": [
        148,
        217,
        80,
        205,
        95,
        253,
        9,
        147
      ]
    },
    {
      "name": "playerJoined",
      "discriminator": [
        39,
        144,
        49,
        106,
        108,
        210,
        183,
        38
      ]
    },
    {
      "name": "takenOver",
      "discriminator": [
        133,
        195,
        105,
        190,
        247,
        119,
        19,
        141
      ]
    },
    {
      "name": "upgradeFinished",
      "discriminator": [
        18,
        120,
        152,
        134,
        172,
        5,
        228,
        200
      ]
    },
    {
      "name": "upgradeQueued",
      "discriminator": [
        254,
        102,
        100,
        128,
        192,
        72,
        160,
        251
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "mathOverflow",
      "msg": "Math operation overflow"
    },
    {
      "code": 6001,
      "name": "gamePaused",
      "msg": "Game is paused"
    },
    {
      "code": 6002,
      "name": "unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6003,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6004,
      "name": "cooldownNotExpired",
      "msg": "Cooldown not expired"
    },
    {
      "code": 6005,
      "name": "upgradeInProgress",
      "msg": "Upgrade in progress"
    },
    {
      "code": 6006,
      "name": "assetNotAtRisk",
      "msg": "Asset not at risk"
    },
    {
      "code": 6007,
      "name": "invalidParameters",
      "msg": "Invalid parameters"
    }
  ],
  "types": [
    {
      "name": "addAssetClassParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "classId",
            "type": "u64"
          },
          {
            "name": "basePrice",
            "type": "u64"
          },
          {
            "name": "priceScaleNum",
            "type": "u64"
          },
          {
            "name": "priceScaleDen",
            "type": "u64"
          },
          {
            "name": "baseYield",
            "type": "u64"
          },
          {
            "name": "upgradeCd",
            "type": "i64"
          },
          {
            "name": "defendCd",
            "type": "i64"
          },
          {
            "name": "baseRiskGrowthPerSec",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "assetBought",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "class",
            "type": "pubkey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "level",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "assetClass",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "classId",
            "type": "u64"
          },
          {
            "name": "basePrice",
            "type": "u64"
          },
          {
            "name": "priceScaleNum",
            "type": "u64"
          },
          {
            "name": "priceScaleDen",
            "type": "u64"
          },
          {
            "name": "baseYield",
            "type": "u64"
          },
          {
            "name": "upgradeCd",
            "type": "i64"
          },
          {
            "name": "defendCd",
            "type": "i64"
          },
          {
            "name": "baseRiskGrowthPerSec",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "defended",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "class",
            "type": "pubkey"
          },
          {
            "name": "spend",
            "type": "u64"
          },
          {
            "name": "riskAfter",
            "type": "u32"
          },
          {
            "name": "shieldAfter",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "gameConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "wealthMint",
            "type": "pubkey"
          },
          {
            "name": "treasuryVault",
            "type": "pubkey"
          },
          {
            "name": "feeBps",
            "type": "u16"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "bumpConfig",
            "type": "u8"
          },
          {
            "name": "bumpVault",
            "type": "u8"
          },
          {
            "name": "defaultUpgradeCd",
            "type": "i64"
          },
          {
            "name": "defaultDefendCd",
            "type": "i64"
          },
          {
            "name": "riskThreshold",
            "type": "u32"
          },
          {
            "name": "riskGrowthPerSec",
            "type": "u32"
          },
          {
            "name": "defendRiskReductionPerToken",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "holding",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "class",
            "type": "pubkey"
          },
          {
            "name": "level",
            "type": "u16"
          },
          {
            "name": "shield",
            "type": "u32"
          },
          {
            "name": "lastClaimTs",
            "type": "i64"
          },
          {
            "name": "upgradeEndTs",
            "type": "i64"
          },
          {
            "name": "lastDefendTs",
            "type": "i64"
          },
          {
            "name": "lastRiskTs",
            "type": "i64"
          },
          {
            "name": "riskScore",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "initializeGameParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeBps",
            "type": "u16"
          },
          {
            "name": "defaultUpgradeCd",
            "type": "i64"
          },
          {
            "name": "defaultDefendCd",
            "type": "i64"
          },
          {
            "name": "riskThreshold",
            "type": "u32"
          },
          {
            "name": "riskGrowthPerSec",
            "type": "u32"
          },
          {
            "name": "defendRiskReductionPerToken",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "lastDefendTs",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "playerJoined",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "setParamsArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeBps",
            "type": {
              "option": "u16"
            }
          },
          {
            "name": "defaultUpgradeCd",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "defaultDefendCd",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "riskThreshold",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "riskGrowthPerSec",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "defendRiskReductionPerToken",
            "type": {
              "option": "u32"
            }
          }
        ]
      }
    },
    {
      "name": "takenOver",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fromPlayer",
            "type": "pubkey"
          },
          {
            "name": "toPlayer",
            "type": "pubkey"
          },
          {
            "name": "class",
            "type": "pubkey"
          },
          {
            "name": "level",
            "type": "u16"
          },
          {
            "name": "cost",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "upgradeFinished",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "class",
            "type": "pubkey"
          },
          {
            "name": "newLevel",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "upgradeQueued",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "class",
            "type": "pubkey"
          },
          {
            "name": "endTs",
            "type": "i64"
          }
        ]
      }
    }
  ]
};

// Runtime-friendly IDL export used by tests or runtime code that import { IDL }
// The JSON file `wwars.json` is generated during build/deploy and sits alongside this file.
// Use require to avoid esModuleInterop issues in some test runners.
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const IDL = require('./wwars.json') as any;
