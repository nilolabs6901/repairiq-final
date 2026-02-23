import { ErrorCode, Difficulty } from '@/types';

// Comprehensive appliance error code database
export const ERROR_CODE_DATABASE: ErrorCode[] = [
  // Samsung Washer Error Codes
  {
    id: 'samsung-washer-ue',
    code: 'UE',
    brand: 'Samsung',
    applianceType: 'Washer',
    description: 'Unbalanced load detected during spin cycle',
    possibleCauses: [
      'Clothes bunched on one side of drum',
      'Single heavy item causing imbalance',
      'Washer not level',
      'Shock absorbers worn',
    ],
    suggestedFixes: [
      'Stop the cycle and redistribute clothes evenly',
      'Remove bulky items and wash separately',
      'Check and adjust leveling feet',
      'Inspect shock absorbers if problem persists',
    ],
    difficulty: 'easy',
    estimatedCost: '$0 - $150',
    professionalRequired: false,
    relatedCodes: ['dC', 'E4'],
  },
  {
    id: 'samsung-washer-de',
    code: 'dE',
    brand: 'Samsung',
    applianceType: 'Washer',
    description: 'Door lock error - door not properly closed or locked',
    possibleCauses: [
      'Door not fully closed',
      'Debris in door latch',
      'Faulty door lock assembly',
      'Wiring issue to door lock',
    ],
    suggestedFixes: [
      'Ensure door is firmly closed',
      'Clean door latch and strike plate',
      'Check door lock mechanism for damage',
      'Inspect wiring connections',
    ],
    difficulty: 'easy',
    estimatedCost: '$0 - $100',
    professionalRequired: false,
    relatedCodes: ['dL', 'dE1', 'dE2'],
  },
  {
    id: 'samsung-washer-le',
    code: 'LE',
    brand: 'Samsung',
    applianceType: 'Washer',
    description: 'Water level sensor error - low water level detected',
    possibleCauses: [
      'Water supply turned off',
      'Kinked inlet hoses',
      'Clogged inlet screens',
      'Faulty water level sensor',
    ],
    suggestedFixes: [
      'Check that water supply valves are fully open',
      'Straighten any kinks in inlet hoses',
      'Clean inlet screens on hoses',
      'Test or replace water level sensor',
    ],
    difficulty: 'medium',
    estimatedCost: '$20 - $200',
    professionalRequired: false,
    relatedCodes: ['1E', 'E7'],
  },

  // LG Washer Error Codes
  {
    id: 'lg-washer-oe',
    code: 'OE',
    brand: 'LG',
    applianceType: 'Washer',
    description: 'Drain error - water not draining properly',
    possibleCauses: [
      'Clogged drain filter',
      'Kinked drain hose',
      'Drain pump failure',
      'Blockage in drain system',
    ],
    suggestedFixes: [
      'Clean the drain pump filter',
      'Check drain hose for kinks or clogs',
      'Verify drain hose height (should be 18-96 inches)',
      'Inspect drain pump for debris or failure',
    ],
    difficulty: 'easy',
    estimatedCost: '$0 - $150',
    professionalRequired: false,
    relatedCodes: ['E2'],
  },
  {
    id: 'lg-washer-ue',
    code: 'UE',
    brand: 'LG',
    applianceType: 'Washer',
    description: 'Unbalanced load - cannot spin properly',
    possibleCauses: [
      'Load is unbalanced',
      'Washer not level',
      'Suspension rods damaged',
      'Shock absorbers worn',
    ],
    suggestedFixes: [
      'Redistribute clothes evenly in drum',
      'Level the washer using adjustable feet',
      'Check suspension rods for damage',
      'Replace shock absorbers if worn',
    ],
    difficulty: 'easy',
    estimatedCost: '$0 - $100',
    professionalRequired: false,
    relatedCodes: ['uE', 'E4'],
  },
  {
    id: 'lg-washer-le',
    code: 'LE',
    brand: 'LG',
    applianceType: 'Washer',
    description: 'Motor locked error - motor cannot turn',
    possibleCauses: [
      'Overloaded drum',
      'Motor failure',
      'Hall sensor failure',
      'Rotor position sensor issue',
    ],
    suggestedFixes: [
      'Reduce load size and restart',
      'Reset by unplugging for 10 minutes',
      'Check hall sensor connections',
      'May require motor replacement if persistent',
    ],
    difficulty: 'hard',
    estimatedCost: '$100 - $400',
    professionalRequired: true,
    relatedCodes: ['LE1'],
  },

  // Whirlpool Washer Error Codes
  {
    id: 'whirlpool-washer-f5e2',
    code: 'F5 E2',
    brand: 'Whirlpool',
    applianceType: 'Washer',
    description: 'Door lock error - door will not lock',
    possibleCauses: [
      'Door not closing properly',
      'Faulty door lock mechanism',
      'Control board issue',
      'Wiring problem',
    ],
    suggestedFixes: [
      'Check for obstructions in door',
      'Inspect door lock for damage',
      'Test door lock with multimeter',
      'Check wiring connections to door lock',
    ],
    difficulty: 'medium',
    estimatedCost: '$30 - $150',
    professionalRequired: false,
    relatedCodes: ['F5 E1', 'F5 E3'],
  },
  {
    id: 'whirlpool-washer-f8e1',
    code: 'F8 E1',
    brand: 'Whirlpool',
    applianceType: 'Washer',
    description: 'Water supply error - not filling with water',
    possibleCauses: [
      'Water supply turned off',
      'Inlet hoses kinked',
      'Inlet valve failure',
      'Low water pressure',
    ],
    suggestedFixes: [
      'Turn on water supply valves fully',
      'Check inlet hoses for kinks',
      'Clean inlet valve screens',
      'Test water pressure at faucet',
    ],
    difficulty: 'easy',
    estimatedCost: '$0 - $100',
    professionalRequired: false,
    relatedCodes: ['F8 E2', 'Lo FL'],
  },

  // Samsung Refrigerator Error Codes
  {
    id: 'samsung-fridge-22e',
    code: '22E',
    brand: 'Samsung',
    applianceType: 'Refrigerator',
    description: 'Freezer fan motor error',
    possibleCauses: [
      'Ice buildup blocking fan',
      'Fan motor failure',
      'Wiring issue',
      'Control board problem',
    ],
    suggestedFixes: [
      'Defrost freezer to remove ice buildup',
      'Check fan for obstructions',
      'Test fan motor continuity',
      'Inspect wiring connections',
    ],
    difficulty: 'medium',
    estimatedCost: '$50 - $200',
    professionalRequired: false,
    relatedCodes: ['21E', '23E'],
  },
  {
    id: 'samsung-fridge-5e',
    code: '5E',
    brand: 'Samsung',
    applianceType: 'Refrigerator',
    description: 'Fridge defrost sensor error',
    possibleCauses: [
      'Defrost sensor failure',
      'Wiring issue',
      'Frost buildup',
      'Control board problem',
    ],
    suggestedFixes: [
      'Manually defrost the refrigerator',
      'Test defrost sensor with multimeter',
      'Check sensor wiring connections',
      'May need control board replacement',
    ],
    difficulty: 'medium',
    estimatedCost: '$30 - $250',
    professionalRequired: false,
    relatedCodes: ['1E', '2E'],
  },

  // GE Dishwasher Error Codes
  {
    id: 'ge-dishwasher-c1',
    code: 'C1',
    brand: 'GE',
    applianceType: 'Dishwasher',
    description: 'Drain pump issue - water not draining',
    possibleCauses: [
      'Clogged drain',
      'Kinked drain hose',
      'Faulty drain pump',
      'Food debris blocking pump',
    ],
    suggestedFixes: [
      'Check and clean the drain filter',
      'Inspect drain hose for clogs or kinks',
      'Clear any debris from drain pump',
      'Test drain pump motor',
    ],
    difficulty: 'easy',
    estimatedCost: '$0 - $150',
    professionalRequired: false,
    relatedCodes: ['C2', 'C3'],
  },

  // Whirlpool/Maytag Dryer Error Codes
  {
    id: 'whirlpool-dryer-f01',
    code: 'F01',
    brand: 'Whirlpool',
    applianceType: 'Dryer',
    description: 'Main electronic control board failure',
    possibleCauses: [
      'Control board malfunction',
      'Power surge damage',
      'Component failure on board',
    ],
    suggestedFixes: [
      'Reset by unplugging for 1 minute',
      'Check power supply and outlet',
      'Control board may need replacement',
    ],
    difficulty: 'hard',
    estimatedCost: '$150 - $400',
    professionalRequired: true,
    relatedCodes: ['F02', 'F70'],
  },
  {
    id: 'whirlpool-dryer-f22',
    code: 'F22',
    brand: 'Whirlpool',
    applianceType: 'Dryer',
    description: 'Exhaust thermistor error - temperature sensing issue',
    possibleCauses: [
      'Blocked exhaust vent',
      'Failed thermistor',
      'Wiring problem',
      'Control board issue',
    ],
    suggestedFixes: [
      'Clean lint trap and exhaust vent',
      'Check vent for restrictions',
      'Test thermistor with multimeter',
      'Inspect wiring connections',
    ],
    difficulty: 'medium',
    estimatedCost: '$20 - $100',
    professionalRequired: false,
    relatedCodes: ['F23', 'F28'],
  },

  // Samsung Dryer Error Codes
  {
    id: 'samsung-dryer-he',
    code: 'HE',
    brand: 'Samsung',
    applianceType: 'Dryer',
    description: 'Heating error - dryer not heating',
    possibleCauses: [
      'Heating element failure',
      'Thermal fuse blown',
      'Gas valve issue (gas dryers)',
      'High limit thermostat tripped',
    ],
    suggestedFixes: [
      'Check lint trap and exhaust vent',
      'Test heating element continuity',
      'Test thermal fuse',
      'Verify gas supply (gas dryers)',
    ],
    difficulty: 'medium',
    estimatedCost: '$50 - $200',
    professionalRequired: false,
    relatedCodes: ['hE', 'hE1'],
  },

  // Frigidaire/Electrolux Codes
  {
    id: 'frigidaire-fridge-sy-ef',
    code: 'SY EF',
    brand: 'Frigidaire',
    applianceType: 'Refrigerator',
    description: 'Evaporator fan circuit failure',
    possibleCauses: [
      'Evaporator fan motor failure',
      'Fan blade obstruction',
      'Wiring issue',
      'Control board failure',
    ],
    suggestedFixes: [
      'Check for ice blocking fan blade',
      'Test fan motor continuity',
      'Inspect fan blade for damage',
      'Check wiring to fan motor',
    ],
    difficulty: 'medium',
    estimatedCost: '$50 - $200',
    professionalRequired: false,
    relatedCodes: ['SY CE', 'SY CF'],
  },

  // Bosch Dishwasher Error Codes
  {
    id: 'bosch-dishwasher-e15',
    code: 'E15',
    brand: 'Bosch',
    applianceType: 'Dishwasher',
    description: 'Water leak detected in base - flood protection activated',
    possibleCauses: [
      'Leaking door seal',
      'Loose hose connections',
      'Cracked sump or hose',
      'Float switch triggered',
    ],
    suggestedFixes: [
      'Tilt machine back 45 degrees to drain base',
      'Inspect door gasket for damage',
      'Check all hose connections',
      'Look for visible leaks under machine',
    ],
    difficulty: 'medium',
    estimatedCost: '$0 - $100',
    professionalRequired: false,
    relatedCodes: ['E14', 'E16'],
  },
  {
    id: 'bosch-dishwasher-e24',
    code: 'E24',
    brand: 'Bosch',
    applianceType: 'Dishwasher',
    description: 'Drain error - water not draining properly',
    possibleCauses: [
      'Blocked filter',
      'Kinked drain hose',
      'Blocked air gap/garbage disposal',
      'Drain pump failure',
    ],
    suggestedFixes: [
      'Clean the filter and drain area',
      'Check drain hose for kinks',
      'Clear garbage disposal knockout plug',
      'Test drain pump operation',
    ],
    difficulty: 'easy',
    estimatedCost: '$0 - $150',
    professionalRequired: false,
    relatedCodes: ['E22', 'E25'],
  },

  // KitchenAid/Whirlpool Oven Error Codes
  {
    id: 'kitchenaid-oven-f2e0',
    code: 'F2 E0',
    brand: 'KitchenAid',
    applianceType: 'Oven',
    description: 'Oven temperature too high - sensor issue or runaway heat',
    possibleCauses: [
      'Shorted oven temperature sensor',
      'Runaway oven condition',
      'Control board malfunction',
    ],
    suggestedFixes: [
      'Turn off oven and allow to cool',
      'Test oven temperature sensor resistance',
      'Check sensor wiring',
      'May need control board replacement',
    ],
    difficulty: 'medium',
    estimatedCost: '$30 - $300',
    professionalRequired: false,
    relatedCodes: ['F2 E1', 'F3 E0'],
  },

  // LG Refrigerator Error Codes
  {
    id: 'lg-fridge-er-if',
    code: 'Er IF',
    brand: 'LG',
    applianceType: 'Refrigerator',
    description: 'Ice maker fan error',
    possibleCauses: [
      'Ice buildup blocking fan',
      'Fan motor failure',
      'Ice maker malfunction',
    ],
    suggestedFixes: [
      'Defrost ice buildup around ice maker',
      'Check fan blade for obstructions',
      'Test fan motor',
      'Reset ice maker',
    ],
    difficulty: 'easy',
    estimatedCost: '$0 - $150',
    professionalRequired: false,
    relatedCodes: ['Er IS', 'Er FF'],
  },
];

// Search function for error codes
export function searchErrorCodes(
  query: string,
  brand?: string,
  applianceType?: string
): ErrorCode[] {
  const normalizedQuery = query.toUpperCase().replace(/[^A-Z0-9]/g, '');

  return ERROR_CODE_DATABASE.filter((code) => {
    const normalizedCode = code.code.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Match exact code or partial match
    const codeMatch = normalizedCode === normalizedQuery ||
      normalizedCode.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedCode);

    // Filter by brand if specified
    const brandMatch = !brand || code.brand.toLowerCase() === brand.toLowerCase();

    // Filter by appliance type if specified
    const typeMatch = !applianceType ||
      code.applianceType.toLowerCase() === applianceType.toLowerCase();

    return codeMatch && brandMatch && typeMatch;
  });
}

// Get all brands in database
export function getAvailableBrands(): string[] {
  const brands = new Set(ERROR_CODE_DATABASE.map(code => code.brand));
  return Array.from(brands).sort();
}

// Get all appliance types in database
export function getAvailableApplianceTypes(): string[] {
  const types = new Set(ERROR_CODE_DATABASE.map(code => code.applianceType));
  return Array.from(types).sort();
}

// Get codes by brand
export function getCodesByBrand(brand: string): ErrorCode[] {
  return ERROR_CODE_DATABASE.filter(
    code => code.brand.toLowerCase() === brand.toLowerCase()
  );
}

// Get codes by appliance type
export function getCodesByApplianceType(applianceType: string): ErrorCode[] {
  return ERROR_CODE_DATABASE.filter(
    code => code.applianceType.toLowerCase() === applianceType.toLowerCase()
  );
}

// Get related codes
export function getRelatedCodes(errorCode: ErrorCode): ErrorCode[] {
  if (!errorCode.relatedCodes || errorCode.relatedCodes.length === 0) {
    return [];
  }

  return ERROR_CODE_DATABASE.filter(
    code =>
      code.brand === errorCode.brand &&
      code.applianceType === errorCode.applianceType &&
      errorCode.relatedCodes?.includes(code.code)
  );
}
