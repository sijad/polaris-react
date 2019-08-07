export type ThemeLogo = {
  /** Provides a path for a logo used on a dark background */
  topBarSource?: string;
  /** Provides a path for a logo used on a light background */
  contextualSaveBarSource?: string;
  /** Destination the merchant will navigate to when clicking the logo */
  url?: string;
  /** Accessible label the logo image */
  accessibilityLabel?: string;
  /** Number of pixels wide the logo image is */
  width?: number;
} | null;

export type CSSProperties = {
  [key: string]: string;
};

export type ThemeColors = {
  surface?: string;
  brand?: string;
  interaction?: string;
  timeliness?: string;
  positive?: string;
  attention?: string;
  warning?: string;
  negative?: string;
};

export interface Theme {
  /** Sets the logo for the top bar and contextual save bar components*/
  logo?: ThemeLogo;
  /** Sets the background color of the top bar component. Complimentary and typography colors are determined programmatically */
  colors?: ThemeColors;
}

export type ThemeVariant = 'light' | 'dark';

type StateProperties = 'default' | 'hover' | 'focus' | 'active' | 'disabled';
type StyleProperties =
  | 'text'
  | 'textOnDark'
  | 'textOnLight'
  | 'textSubdued'
  | 'textSubduedOnDark'
  | 'textSubduedOnLight'
  | 'icon'
  | 'iconOnDark'
  | 'iconOnLight'
  | 'background'
  | 'backgroundSubdued'
  | 'border'
  | 'gradient'
  | 'shadow';

export type ComponentThemeProperties = {
  [Theme in StateProperties]?: {[Style in StyleProperties]?: string | string[]}
};
