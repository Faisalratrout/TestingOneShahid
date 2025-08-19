import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, borderWidth, shadowRadius, shadowOffset } from './spacing';

export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  // Layout styles
  row: {
    flexDirection: 'row',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  spaceAround: {
    justifyContent: 'space-around',
  },
  
  alignCenter: {
    alignItems: 'center',
  },
  
  alignStart: {
    alignItems: 'flex-start',
  },
  
  alignEnd: {
    alignItems: 'flex-end',
  },
  
  justifyCenter: {
    justifyContent: 'center',
  },
  
  justifyStart: {
    justifyContent: 'flex-start',
  },
  
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  
  flex1: {
    flex: 1,
  },
  
  // Card styles
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.card,
    padding: spacing[4],
    marginVertical: spacing[2],
    marginHorizontal: spacing[3],
    shadowColor: colors.cardShadow,
    shadowOffset: shadowOffset.md,
    shadowOpacity: 0.1,
    shadowRadius: shadowRadius.md,
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  
  cardLarge: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.card,
    padding: spacing[6],
    marginVertical: spacing[3],
    marginHorizontal: spacing[4],
    shadowColor: colors.cardShadow,
    shadowOffset: shadowOffset.lg,
    shadowOpacity: 0.15,
    shadowRadius: shadowRadius.lg,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  
  cardSmall: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.card,
    padding: spacing[3],
    marginVertical: spacing[1],
    marginHorizontal: spacing[2],
    shadowColor: colors.cardShadow,
    shadowOffset: shadowOffset.sm,
    shadowOpacity: 0.08,
    shadowRadius: shadowRadius.sm,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  
  // Shadow styles
  shadow: {
    shadowColor: colors.black,
    shadowOffset: shadowOffset.md,
    shadowOpacity: 0.1,
    shadowRadius: shadowRadius.md,
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  
  shadowLarge: {
    shadowColor: colors.black,
    shadowOffset: shadowOffset.lg,
    shadowOpacity: 0.15,
    shadowRadius: shadowRadius.lg,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  
  shadowSmall: {
    shadowColor: colors.black,
    shadowOffset: shadowOffset.sm,
    shadowOpacity: 0.08,
    shadowRadius: shadowRadius.sm,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  
  // Text styles
  textPrimary: {
    color: colors.textPrimary,
    ...typography.body,
  },
  
  textSecondary: {
    color: colors.textSecondary,
    ...typography.bodySmall,
  },
  
  textDisabled: {
    color: colors.textDisabled,
    ...typography.bodySmall,
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  textLeft: {
    textAlign: 'left',
  },
  
  textRight: {
    textAlign: 'right',
  },
  
  textBold: {
    fontWeight: '700',
  },
  
  textMedium: {
    fontWeight: '500',
  },
  
  textUppercase: {
    textTransform: 'uppercase',
  },
  
  // Button styles
  button: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: borderRadius.button,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  
  buttonSecondary: {
    backgroundColor: colors.buttonSecondary,
    borderRadius: borderRadius.button,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: borderWidth.button,
    borderColor: colors.buttonPrimary,
    borderRadius: borderRadius.button,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  
  buttonDisabled: {
    backgroundColor: colors.buttonDisabled,
    borderRadius: borderRadius.button,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  
  buttonText: {
    color: colors.textOnPrimary,
    ...typography.button,
  },
  
  buttonTextSecondary: {
    color: colors.textOnSecondary,
    ...typography.button,
  },
  
  buttonTextOutline: {
    color: colors.buttonPrimary,
    ...typography.button,
  },
  
  buttonTextDisabled: {
    color: colors.textDisabled,
    ...typography.button,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: borderWidth.input,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.input,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    fontSize: typography.input.fontSize,
    fontFamily: typography.input.fontFamily,
    color: colors.textPrimary,
    minHeight: 44,
  },
  
  inputFocused: {
    borderColor: colors.inputFocus,
  },
  
  inputError: {
    borderColor: colors.inputError,
  },
  
  inputLabel: {
    color: colors.textPrimary,
    marginBottom: spacing[1],
    ...typography.inputLabel,
  },
  
  inputErrorText: {
    color: colors.inputError,
    marginTop: spacing[1],
    ...typography.inputError,
  },
  
  // List styles
  listContainer: {
    backgroundColor: colors.background,
  },
  
  listItem: {
    backgroundColor: colors.white,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderBottomWidth: borderWidth.divider,
    borderBottomColor: colors.divider,
  },
  
  listItemLast: {
    borderBottomWidth: 0,
  },
  
  // Separator styles
  separator: {
    height: borderWidth.divider,
    backgroundColor: colors.divider,
  },
  
  separatorThick: {
    height: borderWidth.thick,
    backgroundColor: colors.divider,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.modal,
    padding: spacing[5],
    margin: spacing[4],
    maxWidth: '90%',
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: shadowOffset['2xl'],
        shadowOpacity: 0.25,
        shadowRadius: shadowRadius['2xl'],
      },
      android: {
        elevation: 16,
      },
    }),
  },
  
  // Header styles
  header: {
    backgroundColor: colors.primary,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  
  headerTitle: {
    color: colors.textOnPrimary,
    ...typography.headerTitle,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  // Error styles
  errorContainer: {
    backgroundColor: colors.errorLight,
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginVertical: spacing[2],
    borderLeftWidth: borderWidth.thick,
    borderLeftColor: colors.error,
  },
  
  errorText: {
    color: colors.error,
    ...typography.bodySmall,
  },
  
  // Success styles
  successContainer: {
    backgroundColor: colors.successLight,
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginVertical: spacing[2],
    borderLeftWidth: borderWidth.thick,
    borderLeftColor: colors.success,
  },
  
  successText: {
    color: colors.success,
    ...typography.bodySmall,
  },
  
  // Warning styles
  warningContainer: {
    backgroundColor: colors.warningLight,
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginVertical: spacing[2],
    borderLeftWidth: borderWidth.thick,
    borderLeftColor: colors.warning,
  },
  
  warningText: {
    color: colors.warning,
    ...typography.bodySmall,
  },
  
  // Info styles
  infoContainer: {
    backgroundColor: colors.infoLight,
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginVertical: spacing[2],
    borderLeftWidth: borderWidth.thick,
    borderLeftColor: colors.info,
  },
  
  infoText: {
    color: colors.info,
    ...typography.bodySmall,
  },
  
  // Utility styles
  hidden: {
    opacity: 0,
  },
  
  visible: {
    opacity: 1,
  },
  
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  
  // Padding utilities
  p0: { padding: spacing[0] },
  p1: { padding: spacing[1] },
  p2: { padding: spacing[2] },
  p3: { padding: spacing[3] },
  p4: { padding: spacing[4] },
  p5: { padding: spacing[5] },
  p6: { padding: spacing[6] },
  p8: { padding: spacing[8] },
  
  // Margin utilities
  m0: { margin: spacing[0] },
  m1: { margin: spacing[1] },
  m2: { margin: spacing[2] },
  m3: { margin: spacing[3] },
  m4: { margin: spacing[4] },
  m5: { margin: spacing[5] },
  m6: { margin: spacing[6] },
  m8: { margin: spacing[8] },
  
  // Margin top utilities
  mt0: { marginTop: spacing[0] },
  mt1: { marginTop: spacing[1] },
  mt2: { marginTop: spacing[2] },
  mt3: { marginTop: spacing[3] },
  mt4: { marginTop: spacing[4] },
  mt5: { marginTop: spacing[5] },
  mt6: { marginTop: spacing[6] },
  mt8: { marginTop: spacing[8] },
  
  // Margin bottom utilities
  mb0: { marginBottom: spacing[0] },
  mb1: { marginBottom: spacing[1] },
  mb2: { marginBottom: spacing[2] },
  mb3: { marginBottom: spacing[3] },
  mb4: { marginBottom: spacing[4] },
  mb5: { marginBottom: spacing[5] },
  mb6: { marginBottom: spacing[6] },
  mb8: { marginBottom: spacing[8] },
});

export default globalStyles;