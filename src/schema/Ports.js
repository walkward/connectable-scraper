/**
 * Ports
 * ------------
 * Schema for external interface between the device and other devices.
 * This file should always be referred to when scraping items. Scraped
 * items should not use terms described outside of this object.
 * @namespace ports
 * @property {String!}    name                - Port family name.
 * @property {[String]}   aliases             - Common names used for port family.
 * @property {[@Signals]} signal              - Describes the signals this family supports.
 * @property {Boolean!}   deprecated          - Port family deprecation status.
 * @property {Object!}    types               - Types of cables within the given family. Each type should be distinct plug (eg. No specifications or otherwise backwards compatible ports).
 * @property {String!}    {types}.name        - The specific type of port name.
 * @property {[String]}   {types}.aliases     - Common names used for the given port type.
 * @property {Boolean}    {types}.deprecated  - Port type deprecation status.
 * @property {Boolean}    {types}.backwards   - Backwards compatibility status
 */

module.exports = {
  hdmi: {
    name: 'HDMI',
    aliases: ['High-Definition Multimedia Interface'],
    signal: ['Data', 'Audio', 'Video'],
    deprecated: false,
    types: {
      typeA: {
        name: 'HDMI Type-A',
        aliases: ['Standard']
      },
      typeB: {
        name: 'HDMI Type-B',
        aliases: ['Dual-Link']
      },
      typeC: {
        name: 'HDMI Mini',
        aliases: ['HDMI Type-C']
      },
      typeD: {
        name: 'HDMI Micro',
        aliases: ['HDMI Type-D']
      },
      typeE: {
        name: 'HDMI Automotive',
        aliases: ['HDMI Type-E']
      }
    }
  },
  usb: {
    name: 'USB',
    aliases: ['Universal Serial Bus'],
    signal: ['Data'],
    deprecated: false,
    types: {
      typeA: {
        name: 'USB Type-A',
        aliases: ['USB-A'],
        backwards: true
      },
      typeB: {
        name: 'USB Type-B',
        aliases: [],
        backwards: true
      },
      typeB30: {
        name: 'USB 3.0 Type-B',
        aliases: [],
        backwards: true
      },
      typeC: {
        name: 'USB Type-C',
        aliases: ['USB-C'],
        backwards: true
      },
      miniA: {
        name: 'USB Mini-A',
        aliases: [],
        backwards: true,
        deprecated: true
      },
      miniB: {
        name: 'USB Mini-B',
        aliases: [],
        backwards: true
      },
      microA: {
        name: 'USB Micro-A',
        aliases: [],
        backwards: true
      },
      microB: {
        name: 'USB Micro-B',
        aliases: [],
        backwards: true
      },
      microAB: {
        name: 'USB Micro-AB',
        aliases: [],
        deprecated: true
      },
      microBSuper: {
        name: 'USB Micro-B Superspeed',
        aliases: []
      },
      esata: {
        name: 'USB eSATA',
        aliases: []
      },
      esata30: {
        name: 'USB 3.0 eSATA',
        aliases: []
      }
    }
  },
  displayPort: {
    name: 'DisplayPort',
    aliases: ['Display Port'],
    signal: ['Audio', 'Video', 'Data'],
    deprecated: false,
    types: {
      default: {
        name: 'DisplayPort',
        aliases: []
      },
      mini: {
        name: 'Mini DisplayPort',
        aliases: ['mDP']
      },
      micro: {
        name: 'Micro DisplayPort',
        aliases: []
      }
    }
  },
  rca: {
    name: 'RCA',
    aliases: ['Phono connector', 'Cinch connector', 'A/V jacks'],
    signal: ['Audio', 'Video'],
    deprecated: false,
    types: {
      composite: {
        name: 'Composite RCA',
        aliases: []
      },
      component: {
        name: 'Component RCA',
        aliases: []
      }
    }
  },
  dvi: {
    name: 'DVI',
    aliases: ['Digital Visual Interface'],
    signal: ['Video', 'Data'],
    deprecated: true,
    types: {
      default: {
        name: 'DVI-A',
        aliases: ['DVI Analog']
      },
      dviDSingle: {
        name: 'DVI-D Single Link',
        aliases: ['DVI-D 24 Pin', 'DVI Digital Single Link']
      },
      dviDDual: {
        name: 'DVI-D Dual Link',
        aliases: ['DVI-D 29 Pin', 'DVI Digital Dual Link']
      },
      dviISingle: {
        name: 'DVI-I Single Link',
        aliases: ['DVI-I 24 Pin', 'DVI Digital & Analog Single Link']
      },
      dviIDual: {
        name: 'DVI-I Dual Link',
        aliases: ['DVI-I 29 Pin', 'DVI Digital & Analog Dual Link']
      },
      dviA: {
        name: 'DVI-A',
        aliases: ['DVI Analog']
      },
      mini: {
        name: 'Mini DVI',
        aliases: []
      },
      micro: {
        name: '',
        aliases: []
      }
    }
  },
  vga: {
    name: 'VGA',
    aliases: ['Video Graphics Array'],
    signal: ['Video', 'Data'],
    deprecated: true,
    types: {
      default: {
        name: 'VGA',
        aliases: ['HD-15']
      },
      super: {
        name: 'Super VGA',
        aliases: ['SVGA']
      },
      mini: {
        name: 'Mini-VGA',
        aliases: []
      }
    }
  },
  dSub: {
    name: 'D-Sub',
    aliases: ['D-subminiature'],
    signal: ['Video', 'Data'],
    deprecated: true,
    types: {
      default: {
        name: 'D-Sub',
        aliases: ['D-Sub 15']
      }
    }
  },
  dfp: {
    name: 'DFP',
    aliases: ['VESA Digital Flat Panel'],
    signal: ['Data'],
    deprecated: true,
    types: {
      default: {
        name: 'DFP',
        aliases: ['Digital Flat Panel']
      },
      dfp20: {
        name: 'DFP 20-Pin',
        aliases: ['HPCN20']
      },
      dfp26: {
        name: 'DFP 20-Pin',
        aliases: ['HPCN26']
      }
    }
  },
  evc: {
    name: 'EVC',
    aliases: ['VESA Enhanced Video Connector'],
    signal: ['Analog Audio', 'Analog Video', 'USB'],
    deprecated: true,
    types: {
      default: {
        name: 'EVC',
        aliases: ['P&D']
      }
    }
  },
  svideo: {
    name: 'S-Video',
    aliases: ['separate video', 'Y/C'],
    signal: ['Analog Video'],
    deprecated: false,
    types: {
      svideo4mini: {
        name: 'S-Video 4-pin mini-DIN',
        aliases: []
      },
      svideo7mini: {
        name: 'S-Video 7-pin mini-DIN',
        aliases: []
      },
      svideo9mini: {
        name: 'S-Video 9-pin Video In/Video Out',
        aliases: []
      }
    }
  },
  primaryPower: {
    name: 'Primary Power Type',
    aliases: ['Power Sources'],
    signal: ['Power'],
    deprecated: false,
    types: {
      iec320C2: {
        name: 'IEC-320 C2',
        aliases: []
      },
      iec320C4: {
        name: 'IEC-320 C4',
        aliases: []
      },
      iec320C6: {
        name: 'IEC-320 C6',
        aliases: []
      },
      iec320C8: {
        name: 'IEC-320 C8',
        aliases: []
      },
      iec320C10: {
        name: 'IEC-320 C10',
        aliases: []
      },
      iec320C12: {
        name: 'IEC-320 C12',
        aliases: []
      },
      iec320C14: {
        name: 'IEC-320 C14',
        aliases: []
      },
      iec320C16: {
        name: 'IEC-320 C16',
        aliases: []
      },
      iec320C16A: {
        name: 'IEC-320 C16A',
        aliases: []
      },
      iec320C18: {
        name: 'IEC-320 C18',
        aliases: []
      },
      iec320C20: {
        name: 'IEC-320 C20',
        aliases: []
      },
      iec320C22: {
        name: 'IEC-320 C22',
        aliases: []
      },
      iec320C24: {
        name: 'IEC-320 C24',
        aliases: []
      },
      iec320L: {
        name: 'IEC-320 L',
        aliases: []
      },
      iec320J: {
        name: 'IEC-320 J',
        aliases: []
      },
      iec320H: {
        name: 'IEC-320 H',
        aliases: []
      },
      iec320F: {
        name: 'IEC-320 F',
        aliases: []
      },
      iec320D: {
        name: 'IEC-320 D',
        aliases: []
      },
      iec320B: {
        name: 'IEC-320 B',
        aliases: []
      }
    }
  },
  stereoJack: {
    name: 'Stereo Connector',
    aliases: ['Audio Jack', 'stereo plug', 'Phone Connector'],
    signal: ['Analog Audio Out', 'Analog Audio In'],
    deprecated: false,
    types: {
      ts25m: {
        name: '2.5mm TS Stereo Jack',
        aliases: ['']
      },
      trs25m: {
        name: '2.5mm TRS Stereo Jack',
        aliases: ['']
      },
      trrs25m: {
        name: '2.5mm TRRS Stereo Jack',
        aliases: ['']
      },
      ts35m: {
        name: '3.5mm TS Stereo Jack',
        aliases: ['']
      },
      trs35m: {
        name: '3.5mm TRS Audio Jack',
        aliases: ['Audio Jack', '3.5mm', 'mini-phone', 'stereo plug', 'mini-stereo', 'mini jack', 'aux input', '1/8" Jack', '1/8-inch connector', 'mini plug'],
        signal: ['Analog Audio Out', 'Analog Audio In']
      },
      trrs35m: {
        name: '3.5mm TRRS Mic/Audio Jack',
        aliases: ['Microphone Jack', 'Mic-in', 'Headphone/Microphone Combo', '1/8" Microphone Jack', 'Combo Audio Jack', 'Headset jack'],
        signal: ['Analog Audio Out', 'Analog Audio In', 'Mic In']
      },
      ts63m: {
        name: '1/4" TS Stereo Jack',
        signal: ['Mono Audio In', 'Mono Audio Out'],
        aliases: []
      },
      trs63m: {
        name: '1/4" TRS Stereo Jack',
        signal: ['Analog Audio Out', 'Analog Audio In'],
        aliases: []
      },
      ctia: {
        name: 'CTIA Stereo Jack',
        signal: [],
        aliases: ['Apple Audio Jack']
      },
      omtp: {
        name: 'OMTP Stereo Jack',
        signal: [],
        aliases: ['Nokia Audio Jack']
      },
      stereoIn: {
        name: 'Stereo Line-In',
        aliases: []
      },
      stereoOut: {
        name: 'Stereo Line-Out',
        aliases: []
      },
      rightLeft: {
        name: 'Right-to-Left',
        aliases: []
      },
      center: {
        name: 'Center',
        aliases: ['Subwoofer']
      }
    }
  },
  ps2: {
    name: 'PS/2',
    aliases: ['PS/2 keyboard', 'PS/2 mouse', 'Personal System/2'],
    deprecated: true,
    signals: ['Data'],
    types: {
      default: {
        name: 'PS/2',
        aliases: ['PS/2 keyboard', 'PS/2 mouse', 'Personal System/2'],
        signals: ['Data']
      }
    }
  },
  spdif: {
    name: 'S/PDIF',
    aliases: ['Sony/Philips Digital Interface Format'],
    deprecated: false,
    signals: ['Digital Audio Out'],
    types: {
      default: {
        name: 'S/PDIF',
        aliases: ['Sony/Philips Digital Interface Format', 'SPDIF'],
        signals: ['Digital Audio Out']
      }
    }
  },
  xlr: {
    name: 'XLR Connectors',
    aliases: [],
    signal: [],
    deprecated: false,
    types: {}
  },
  thunderbolt: {
    name: 'Thunderbolt',
    aliases: [],
    deprecated: false,
    signal: ['Data', 'Video', 'Audio'],
    types: {
      thunderbolt1: {
        deprecated: true,
        name: 'Thunderbolt 1',
        aliases: []
      },
      thunderbolt2: {
        deprecated: true,
        name: 'Thunderbolt 2',
        aliases: []
      },
      thunderbolt3: {
        deprecated: false,
        name: 'Thunderbolt 3',
        aliases: []
      }
    }
  },
  firewire: {
    name: 'FireWire',
    deprecated: true,
    signal: ['Data'],
    aliases: ['IEEE-1394', 'DV', 'i.Link', 'Lynx'],
    types: {
      default: {
        name: 'Firewire',
        aliases: ['Firewire', '1394']
      },
      firewire4: {
        deprecated: true,
        name: 'Firewire 400 4-Pin',
        aliases: ['Firewire 400Mb/s', 'IEEE1394a']
      },
      firewire6: {
        deprecated: true,
        name: 'Firewire 400 6-Pin',
        aliases: []
      },
      firewire8: {
        deprecated: false,
        name: 'Firewire 800 9-Pin',
        aliases: ['Firewire 800Mb/s', 'FireWire 800', 'IEEE1394b']
      }
    }
  },
  coaxial: {
    name: '',
    aliases: [],
    signal: [],
    deprecated: false,
    types: {}
  },
  ir: {
    name: 'IR',
    aliases: ['Infrared communication port'],
    signal: ['Infrared'],
    deprecated: true,
    types: {
      default: {
        name: 'IR',
        aliases: ['IR Port', 'Infared Port'],
        signal: ['Infrared']
      }
    }
  },
  rj: {
    name: 'RJ',
    aliases: ['Registered jack'],
    signal: [],
    deprecated: false,
    types: {
      ethernet: {
        name: 'Ethernet',
        aliases: ['RJ45', '10/100/1000Mbps'],
        signal: ['Ethernet']
      },
      modem: {
        name: 'Modem',
        aliases: ['RJ14']
      }
    }
  },
  eSata: {
    name: 'eSATA',
    aliases: ['Serial ATA'],
    signal: ['Data'],
    deprecated: false,
    types: {
      default: {
        name: 'eSATA',
        aliases: ['e-SATA']
      }
    }
  },
  sata: {
    name: 'Serial ATA',
    aliases: ['SATA', 'Serial AT Attachment'],
    signal: [],
    deprecated: false,
    types: {
      default: {
        name: 'Serial ATA',
        aliases: []
      },
      sata150: {
        name: 'Serial ATA-150',
        deprecated: true,
        aliases: []
      },
      sata300: {
        name: 'Serial ATA-300',
        deprecated: true,
        aliases: []
      },
      sata600: {
        name: 'Serial ATA-600',
        deprecated: false,
        aliases: []
      }
    }
  },
  serialPort: {
    name: 'Serial Port',
    aliases: [],
    signal: ['Data'],
    deprecated: true,
    types: {
      default: {
        name: 'Serial Port',
        aliases: ['Serial']
      }
    }
  },
  parallelPort: {
    name: 'Serial Port',
    aliases: [],
    signal: ['Data'],
    deprecated: true,
    types: {
      default: {
        name: 'Serial Port',
        aliases: ['Parallel']
      }
    }
  },
  toslink: {
    name: 'TOSLINK',
    aliases: [],
    signal: ['Digital Audio Out', 'Digital Audio In'],
    deprecated: false,
    types: {
      default: {
        name: 'TOSLINK',
        aliases: ['optical audio cable', 'optical cable']
      },
      mini: {
        name: 'Mini-TOSLINK',
        aliases: ['3.5mm TOSLINK Combo', '3.5mm TOSLINK Combined', 'optical cable']
      }
    }
  }
}
