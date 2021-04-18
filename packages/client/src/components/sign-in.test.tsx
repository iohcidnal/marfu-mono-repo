import { act } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import SignIn from './sign-in';

const render = renderWithProviders(<SignIn />);

describe('SignIn', () => {
  it('should render properly', async () => {
    let rendered;
    await act(async () => {
      rendered = render();
    });
    expect(rendered.asFragment()).toMatchSnapshot();
  });

  it.todo('cover other lines');
});
