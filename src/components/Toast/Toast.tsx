import React, {useRef} from 'react';
import {createUniqueIDFactory} from '@shopify/javascript-utilities/other';

import {ToastProps, useFrame} from '../../utilities/frame';
import {useDeepEffect} from '../../utilities/use-deep-effect';

const createId = createUniqueIDFactory('Toast');

// The script in the styleguide that generates the Props Explorer data expects
// a component's props to be found in the Props interface. This silly workaround
// ensures that the Props Explorer table is generated correctly, instead of
// crashing if we write `ComposedProps = ToastProps & WithAppProviderProps`
export interface Props extends ToastProps {}

function Toast(props: Props) {
  const id = useRef(createId());
  const {showToast, hideToast} = useFrame();

  useDeepEffect(
    () => {
      const toastId = id.current;

      showToast({
        id: id.current,
        ...props,
      });

      return () => {
        hideToast({id: toastId});
      };
    },
    [props],
  );

  return null;
}

export default React.memo(Toast);
