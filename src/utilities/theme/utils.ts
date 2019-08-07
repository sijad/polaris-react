import {HSLColor, HSLAColor} from '../color-types';
import {
  colorToHsla,
  hslToString,
  hslToRgb,
  rgbToHex,
} from '../color-transformers';
import {isLight} from '../color-validation';
import {constructColorName} from '../color-names';
import {lightenColor, darkenColor, opacifyColor} from '../color-manipulation';
import {compose} from '../compose';

import {CSSProperties, ComponentThemeProperties, Theme} from './types';

const NAMESPACE = 'polaris';

const defaultRoleValues = {
  surface: '#0c0d0e',
  brand: '#008060',
  interaction: '#2A94FF',
  negative: '#C43256',
  timeliness: '#90DFD6',
  warning: '#FFA781',
  attention: '#FFC453',
};

const hslToHex: (color: HSLColor | HSLAColor) => string = compose(
  rgbToHex,
  hslToRgb,
);

type LightnessKeys = 'opposing' | 'base' | 'icon' | 'subdued' | 'disabled';

const lightness: {[Key in LightnessKeys]: [number, number]} = {
  opposing: [1, 99],
  base: [5, 95],
  icon: [10, 90],
  subdued: [15, 85],
  disabled: [20, 80],
};

const alpha = 1.0;

export function setColors(theme: Theme) {
  return new SchemeFactory(theme).scheme;
}

class SchemeFactory {
  scheme: CSSProperties = {};

  private isLightTheme: boolean;

  constructor(theme: Theme) {
    const {colors} = theme;
    const surface =
      colors == null || colors.surface == null
        ? defaultRoleValues.surface
        : colors.surface;

    this.setScheme(theme);
    this.isLightTheme = isLight(hslToRgb(colorToHsla(surface) as HSLColor));
  }

  private setScheme(theme: Theme) {
    this.scheme = this.setColors(theme);
  }

  private setColors(theme: Theme): CSSProperties {
    const {colors = {}} = theme;
    const {createRoleRange, createSurfaceRange} = this;
    const {
      surface = defaultRoleValues.surface,
      brand = defaultRoleValues.brand,
      interaction = defaultRoleValues.interaction,
      negative = defaultRoleValues.negative,
      positive = defaultRoleValues.brand,
      timeliness = defaultRoleValues.timeliness,
      warning = defaultRoleValues.warning,
      attention = defaultRoleValues.attention,
    } = colors;

    return {
      ...createSurfaceRange(surface),
      ...createRoleRange(brand, 'brand'),
      ...createRoleRange(interaction, 'interaction'),
      ...createRoleRange(timeliness, 'timeliness'),
      ...createRoleRange(positive, 'positive'),
      ...createRoleRange(attention, 'attention'),
      ...createRoleRange(warning, 'warning'),
      ...createRoleRange(negative, 'negative'),
    };
  }

  private createRoleRange = (
    baseColor: string,
    colorRole: string,
    options?: {
      opacify?: boolean;
      stops?: number;
      increment?: number;
    },
  ): CSSProperties => {
    const {opacify = false, stops = 2, increment = 5} = options || {};
    const {isLightTheme} = this;
    const hslBaseColor = colorToHsla(baseColor) as HSLColor;

    const onBase = {
      [constructColorName(NAMESPACE, colorRole, 'on')]: hslToString({
        hue: hslBaseColor.hue,
        saturation: hslBaseColor.saturation,
        lightness: isLightTheme ? lightness.base[0] : lightness.base[1],
        alpha,
      }),
      [constructColorName(NAMESPACE, colorRole, 'iconOn')]: hslToString({
        hue: hslBaseColor.hue,
        saturation: hslBaseColor.saturation,
        lightness: isLightTheme ? lightness.icon[0] : lightness.icon[1],
        alpha,
      }),
      [constructColorName(NAMESPACE, colorRole, 'subduedOn')]: hslToString({
        hue: hslBaseColor.hue,
        saturation: hslBaseColor.saturation,
        lightness: isLightTheme ? lightness.subdued[0] : lightness.subdued[1],
        alpha,
      }),
      [constructColorName(NAMESPACE, colorRole, 'disabledOn')]: hslToString({
        hue: hslBaseColor.hue,
        saturation: hslBaseColor.saturation,
        lightness: isLightTheme ? lightness.disabled[0] : lightness.disabled[1],
        alpha,
      }),
    };

    const surface = {
      hue: hslBaseColor.hue,
      saturation: hslBaseColor.saturation,
      lightness: isLightTheme ? lightness.base[0] : lightness.base[1],
      alpha,
    };

    const onSurface = {
      [constructColorName(NAMESPACE, colorRole, 'onSurface')]: hslToString({
        hue: surface.hue,
        saturation: surface.saturation,
        lightness: !isLightTheme ? lightness.base[0] : lightness.base[1],
        alpha,
      }),
      [constructColorName(NAMESPACE, colorRole, 'iconOnSurface')]: hslToString({
        hue: surface.hue,
        saturation: surface.saturation,
        lightness: !isLightTheme ? lightness.icon[0] : lightness.icon[1],
        alpha,
      }),
      [constructColorName(
        NAMESPACE,
        colorRole,
        'subduedOnSurface',
      )]: hslToString({
        hue: surface.hue,
        saturation: surface.saturation,
        lightness: !isLightTheme ? lightness.subdued[0] : lightness.subdued[1],
        alpha,
      }),
      [constructColorName(
        NAMESPACE,
        colorRole,
        'disabledOnSurface',
      )]: hslToString({
        hue: surface.hue,
        saturation: surface.saturation,
        lightness: !isLightTheme
          ? lightness.disabled[0]
          : lightness.disabled[1],
        alpha,
      }),
    };

    return {
      ...{
        [constructColorName(NAMESPACE, colorRole)]: hslToString(colorToHsla(
          baseColor,
        ) as HSLAColor),
      },
      ...createDarkRange(stops, colorRole, hslBaseColor as HSLColor, increment),
      ...onBase,
      ...{
        [constructColorName(NAMESPACE, colorRole, 'surface')]: hslToString(
          surface,
        ),
      },
      ...onSurface,
      ...(opacify && createOpaqueRange(baseColor, colorRole)),
    };
  };

  private createSurfaceRange = (baseColor: string): CSSProperties => {
    const hslBaseColor: HSLColor = colorToHsla(baseColor) as HSLColor;
    const {isLightTheme} = this;

    let greyRange: CSSProperties;

    const colorRole = 'surface';
    const stops = 19;
    const increment = 5;
    const options = {suffix: ''};

    if (isLightTheme) {
      greyRange = createDarkRange(
        stops,
        colorRole,
        hslBaseColor,
        increment,
        options,
      );
    } else {
      greyRange = createLightRange(
        stops,
        colorRole,
        hslBaseColor,
        increment,
        options,
      );
    }

    const opposingColor = hslToHex({
      hue: hslBaseColor.hue,
      saturation: hslBaseColor.saturation,
      lightness: isLightTheme ? 1 : 99,
    });

    function getOnColor(baseIsLight: boolean) {
      return hslToHex({
        hue: hslBaseColor.hue,
        saturation: hslBaseColor.saturation,
        lightness: baseIsLight ? 5 : 95,
      });
    }

    const on = {
      [constructColorName(NAMESPACE, colorRole, 'onDark')]: getOnColor(false),
      [constructColorName(NAMESPACE, colorRole, 'onLight')]: getOnColor(true),
      [constructColorName(NAMESPACE, colorRole, 'onBase')]: getOnColor(
        isLightTheme,
      ),
      [constructColorName(NAMESPACE, colorRole, 'onOpposing')]: getOnColor(
        !isLightTheme,
      ),
    };

    //   - shade
    //     - one darkened stop
    //   - border
    //     - one darkened stop
    //
    //   - base
    //     - card
    //     - page
    //   - on base
    //     - subdued
    //     - icon
    //     - disabled
    //   - base opacified
    //
    //   - opposing (opposite of base)
    //   - on opposing
    //     - subdued
    //     - icon
    //     - disabled
    //   - opposing opacified
    //
    //   - range of grays for interactive elements (5-10?)

    return {
      ...{
        [constructColorName(NAMESPACE, colorRole, '0')]: baseColor,
      },
      ...greyRange,
      ...createOpaqueRange(baseColor, colorRole, {
        suffix: 'baseOpacified',
      }),
      ...createOpaqueRange(opposingColor, colorRole, {
        suffix: 'opposingOpacified',
      }),
      ...on,
    };
  };
}

function createLightRange(
  stops: number,
  colorRole: string,
  hslBaseColor: HSLColor,
  increment: number,
  options?: {
    suffix?: string;
  },
): CSSProperties {
  const {suffix = 'lightened'} = options || {};
  return Array.from({length: stops}, (_, i) => i + 1).reduce(
    (colorStyles: CSSProperties, stop) => {
      const color = hslToHex(lightenColor(
        hslBaseColor,
        increment * stop,
      ) as HSLColor);
      colorStyles[
        constructColorName(NAMESPACE, colorRole, `${suffix}${stop}`)
      ] = color;
      return colorStyles;
    },
    {},
  );
}

function createDarkRange(
  stops: number,
  colorRole: string,
  hslBaseColor: HSLColor,
  increment: number,
  options?: {
    suffix?: string;
  },
): CSSProperties {
  const {suffix = 'darkened'} = options || {};
  return Array.from({length: stops}, (_, i) => i + 1).reduce(
    (colorStyles: CSSProperties, stop) => {
      const color = hslToString(darkenColor(
        hslBaseColor,
        increment * stop,
      ) as HSLAColor);
      colorStyles[
        constructColorName(NAMESPACE, colorRole, `${suffix}${stop}`)
      ] = color;
      return colorStyles;
    },
    {},
  );
}

function createOpaqueRange(
  baseColor: string,
  colorRole: string,
  options?: {
    suffix?: string;
  },
): CSSProperties {
  const {hue, saturation, lightness} = colorToHsla(baseColor) as HSLColor;
  const {suffix = 'opacified'} = options || {};
  return [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].reduce(
    (colorStyles: CSSProperties, stop) => {
      colorStyles[
        constructColorName(
          NAMESPACE,
          colorRole,
          `${suffix}${stop.toString().split('0.')[1]}`,
        )
      ] = hslToString(
        opacifyColor({hue, saturation, lightness, alpha: 1}, stop),
      );

      return colorStyles;
    },
    {},
  );
}

export function reduceTheme(theme: ComponentThemeProperties): CSSProperties {
  return Object.entries(theme)
    .reduce((childAccumulator, childCurrent) => {
      const maybeChildCurrent = childCurrent[1] != null ? childCurrent[1] : [];
      return [
        ...childAccumulator,
        ...Object.entries(maybeChildCurrent).reduce(
          (propertyAccumulator, propertyCurrent) => {
            if (typeof propertyCurrent[1] === 'string') {
              return [
                ...propertyAccumulator,
                ...[
                  {
                    [`--${childCurrent[0]}-${propertyCurrent[0]}`]: `var(${
                      propertyCurrent[1]
                    })`,
                  },
                ],
              ];
            } else {
              const maybePropertyCurrent =
                propertyCurrent[1] != null ? propertyCurrent[1] : [];
              return [
                ...propertyAccumulator,
                ...[
                  ...maybePropertyCurrent.map((property, index) => {
                    return {
                      [`--${childCurrent[0]}-${propertyCurrent[0]}-${index +
                        1}`]: `var(${property})`,
                    };
                  }),
                ],
              ];
            }
          },
          [],
        ),
      ];
    }, [])
    .reduce((accumulator, current) => {
      return {...accumulator, ...current};
    }, {});
}
