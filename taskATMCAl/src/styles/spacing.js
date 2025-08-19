// Base spacing unit (8px scale)
const baseUnit = 8;

// Spacing scale
export const spacing = {
  // Individual units
  0: 0,
  1: baseUnit * 0.5, // 4px
  2: baseUnit, // 8px
  3: baseUnit * 1.5, // 12px
  4: baseUnit * 2, // 16px
  5: baseUnit * 2.5, // 20px
  6: baseUnit * 3, // 24px
  7: baseUnit * 3.5, // 28px
  8: baseUnit * 4, // 32px
  9: baseUnit * 4.5, // 36px
  10: baseUnit * 5, // 40px
  11: baseUnit * 5.5, // 44px
  12: baseUnit * 6, // 48px
  14: baseUnit * 7, // 56px
  16: baseUnit * 8, // 64px
  20: baseUnit * 10, // 80px
  24: baseUnit * 12, // 96px
  28: baseUnit * 14, // 112px
  32: baseUnit * 16, // 128px
  36: baseUnit * 18, // 144px
  40: baseUnit * 20, // 160px
  44: baseUnit * 22, // 176px
  48: baseUnit * 24, // 192px
  52: baseUnit * 26, // 208px
  56: baseUnit * 28, // 224px
  60: baseUnit * 30, // 240px
  64: baseUnit * 32, // 256px
  72: baseUnit * 36, // 288px
  80: baseUnit * 40, // 320px
  96: baseUnit * 48, // 384px
};

// Semantic spacing
export const margin = {
  // Margin all sides
  xs: spacing[1],
  sm: spacing[2],
  md: spacing[4],
  lg: spacing[6],
  xl: spacing[8],
  '2xl': spacing[10],
  '3xl': spacing[12],

  // Specific margins
  none: spacing[0],
  tiny: spacing[1],
  small: spacing[2],
  medium: spacing[4],
  large: spacing[6],
  xlarge: spacing[8],
  huge: spacing[12],
};

export const padding = {
  // Padding all sides
  xs: spacing[1],
  sm: spacing[2],
  md: spacing[4],
  lg: spacing[6],
  xl: spacing[8],
  '2xl': spacing[10],
  '3xl': spacing[12],

  // Specific paddings
  none: spacing[0],
  tiny: spacing[1],
  small: spacing[2],
  medium: spacing[4],
  large: spacing[6],
  xlarge: spacing[8],
  huge: spacing[12],
};

// Layout spacing
export const layout = {
  // Container spacing
  containerPadding: spacing[4],
  containerPaddingLarge: spacing[6],
  
  // Section spacing
  sectionMargin: spacing[6],
  sectionPadding: spacing[4],
  
  // Card spacing
  cardPadding: spacing[4],
  cardMargin: spacing[3],
  cardGap: spacing[2],
  
  // List spacing
  listItemPadding: spacing[3],
  listItemMargin: spacing[1],
  listGap: spacing[2],
  
  // Form spacing
  formFieldMargin: spacing[3],
  formSectionMargin: spacing[6],
  inputPadding: spacing[3],
  
  // Button spacing
  buttonPadding: spacing[3],
  buttonMargin: spacing[2],
  buttonGap: spacing[2],
  
  // Navigation spacing
  tabPadding: spacing[2],
  headerPadding: spacing[4],
  
  // Screen spacing
  screenPadding: spacing[4],
  screenMargin: spacing[2],
};

// Component-specific spacing
export const components = {
  // ATM components
  atm: {
    cardPadding: spacing[4],
    cardMargin: spacing[3],
    buttonSpacing: spacing[3],
    pinPadSpacing: spacing[2],
    balanceMargin: spacing[4],
  },
  
  // Calendar components
  calendar: {
    eventPadding: spacing[2],
    eventMargin: spacing[1],
    dayPadding: spacing[1],
    monthMargin: spacing[4],
    headerPadding: spacing[3],
  },
  
  // Modal components
  modal: {
    padding: spacing[5],
    margin: spacing[4],
    buttonSpacing: spacing[3],
    contentSpacing: spacing[4],
  },
  
  // Form components
  form: {
    inputPadding: spacing[3],
    inputMargin: spacing[3],
    labelMargin: spacing[1],
    buttonMargin: spacing[4],
    sectionSpacing: spacing[6],
  },
  
  // List components
  list: {
    itemPadding: spacing[4],
    itemMargin: spacing[1],
    separatorHeight: spacing[0],
    headerPadding: spacing[3],
  },
  
  // Header components
  header: {
    padding: spacing[4],
    titleMargin: spacing[2],
    buttonSpacing: spacing[3],
  },
};

// Border radius scale
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
  
  // Semantic radius
  button: 8,
  card: 12,
  input: 8,
  modal: 16,
  avatar: 9999,
  badge: 16,
};

// Border width scale
export const borderWidth = {
  0: 0,
  1: 1,
  2: 2,
  4: 4,
  8: 8,
  
  // Semantic widths
  thin: 1,
  medium: 2,
  thick: 4,
  
  // Component specific
  input: 1,
  button: 1,
  card: 1,
  divider: 1,
};

// Shadow spacing
export const shadowRadius = {
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  '2xl': 16,
};

export const shadowOffset = {
  sm: { width: 0, height: 1 },
  md: { width: 0, height: 2 },
  lg: { width: 0, height: 4 },
  xl: { width: 0, height: 8 },
  '2xl': { width: 0, height: 12 },
};

// Icon sizes
export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 40,
  '5xl': 48,
  
  // Semantic sizes
  tiny: 12,
  small: 16,
  medium: 24,
  large: 32,
  huge: 48,
  
  // Component specific
  tab: 24,
  header: 24,
  button: 20,
  input: 16,
};

// Hit slop for touchable areas
export const hitSlop = {
  sm: { top: 4, bottom: 4, left: 4, right: 4 },
  md: { top: 8, bottom: 8, left: 8, right: 8 },
  lg: { top: 12, bottom: 12, left: 12, right: 12 },
  xl: { top: 16, bottom: 16, left: 16, right: 16 },
};

// Minimum touch target size (accessibility)
export const minTouchTarget = 44;

export default {
  spacing,
  margin,
  padding,
  layout,
  components,
  borderRadius,
  borderWidth,
  shadowRadius,
  shadowOffset,
  iconSize,
  hitSlop,
  minTouchTarget,
};