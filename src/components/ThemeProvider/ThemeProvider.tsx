import React from 'react';
import {ThemeContext} from '../../utilities/theme';
import {Theme, CSSProperties} from '../../utilities/theme/types';
import {setColors} from '../../utilities/theme/utils';
import {isObjectsEqual} from '../../utilities/is-objects-equal';

interface State {
  theme: Theme;
  colors: CSSProperties | undefined;
}

interface Props {
  /** Custom logos and colors provided to select components */
  theme: Theme;
  /** The content to display */
  children?: React.ReactNode;
}

export default class ThemeProvider extends React.Component<Props, State> {
  state: State = {
    theme: setThemeContext(this.props.theme),
    colors: setColors(this.props.theme),
  };

  componentDidUpdate({theme: prevTheme}: Props) {
    const {theme} = this.props;
    if (isObjectsEqual(prevTheme, theme)) {
      return;
    }

    // eslint-disable-next-line react/no-did-update-set-state
    this.setState({
      theme: setThemeContext(theme),
      colors: setColors(theme),
    });
  }

  render() {
    const {
      theme: {logo = null, ...rest},
    } = this.state;
    const {
      props: {children},
      state: {colors},
    } = this;

    const theme = {
      ...rest,
      logo,
    };

    return (
      <ThemeContext.Provider value={theme}>
        <div style={colors}>{React.Children.only(children)}</div>
      </ThemeContext.Provider>
    );
  }
}

function setThemeContext(ctx: Theme): Theme {
  const {colors, ...theme} = ctx;
  return {...theme};
}
