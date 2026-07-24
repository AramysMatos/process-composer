import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import initStore from 'app/config/store';
import Header from './header';

describe('Header', () => {
  let mountedWrapper;
  const devProps = {
    ribbonEnv: 'dev',
    isInProduction: false,
  };
  const prodProps = {
    ribbonEnv: 'prod',
    isInProduction: true,
  };

  const wrapper = (props = devProps) => {
    if (!mountedWrapper) {
      const store = initStore();
      const { container } = render(
        <Provider store={store}>
          <MemoryRouter>
            <Header {...props} />
          </MemoryRouter>
        </Provider>
      );
      mountedWrapper = container.innerHTML;
    }
    return mountedWrapper;
  };

  beforeEach(() => {
    mountedWrapper = undefined;
  });

  it('Renders a minimal Header in dev profile with LoadingBar and ribbon.', () => {
    const html = wrapper();

    expect(html).toContain('loading-bar');
    expect(html).toContain('ribbon');
    expect(html).not.toContain('navbar');
    expect(html).not.toContain('account-menu');
  });

  it('Renders a minimal Header in prod profile without ribbon.', () => {
    const html = wrapper(prodProps);

    expect(html).toContain('loading-bar');
    expect(html).not.toContain('ribbon');
    expect(html).not.toContain('navbar');
  });
});
