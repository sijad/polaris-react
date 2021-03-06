import React, {useContext} from 'react';
import {mountWithAppProvider} from 'test-utilities/legacy';
import {LinkContext} from '../../../utilities/link';
import {AppProvider} from '../AppProvider';

describe('<AppProvider />', () => {
  it('updates context when props change', () => {
    const Child: React.SFC<{}> = () => {
      // eslint-disable-next-line shopify/jest/no-if
      return useContext(LinkContext) ? <div id="child" /> : null;
    };
    const LinkComponent = () => <div />;

    const wrapper = mountWithAppProvider(
      <AppProvider i18n={{}}>
        <Child />
      </AppProvider>,
    );

    expect(wrapper.find('#child')).toHaveLength(0);
    wrapper.setProps({linkComponent: LinkComponent});
    wrapper.update();
    expect(wrapper.find('#child')).toHaveLength(1);
  });
});
